import { Colors } from '@/styles/colors';
import type { CardItem } from '@/components/features/card/types';
import FlippableCard, { CARD_WIDTH, CARD_HEIGHT } from '@/components/features/card/FlippableCard';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
  PanResponder,
  StyleSheet,
  View, 
  
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import ScrollbarHandle from '@/assets/images/scrollbar_handle.svg';
import TickMark from '@/assets/images/Tick-mark.svg';

const H_PADDING = 24;
const CARD_GAP = 19;
const TRACK_GRADIENT_LEFT = Colors?.primary400 ?? '#C6B9A5';
const TRACK_GRADIENT_RIGHT = Colors?.primary200 ?? '#F0EAE1';
const BAR_WIDTH = 348;
const BAR_HEIGHT = 8;
const BAR_BORDER_RADIUS = 40;
const HANDLE_SIZE = 24;

const CARD_LIST_HEIGHT = 476;

const PLACEHOLDER_IMAGE = (seed: number) =>
  `https://picsum.photos/seed/${seed}/204/188`;

const MOCK_CARDS: CardItem[] = [
  {
    id: '1',
    title: '여행명은 공백 포함 14자',
    dateRange: '0000.00.00 - 0000.00.00',
    description: '공백 포함 54자 - 여행 설명을 작성해주세요. 어쩌구저쩌구 2줄',
    imageGrid: [
      PLACEHOLDER_IMAGE(1),
      PLACEHOLDER_IMAGE(2),
      PLACEHOLDER_IMAGE(3),
    ],
  },
  {
    id: '2',
    title: '두 번째 카드',
    dateRange: '2025.01.01 - 2025.01.05',
    description: '여행 메모 내용입니다.',
    imageGrid: [
      PLACEHOLDER_IMAGE(10),
      PLACEHOLDER_IMAGE(11),
      PLACEHOLDER_IMAGE(12),
      PLACEHOLDER_IMAGE(13),
      PLACEHOLDER_IMAGE(14),
    ],
  },
  {
    id: '3',
    title: '세 번째 카드',
    dateRange: '2025.02.10 - 2025.02.15',
    description: '추가 카드 예시입니다.',
    imageGrid: [
      PLACEHOLDER_IMAGE(20),
      PLACEHOLDER_IMAGE(21),
      PLACEHOLDER_IMAGE(22),
      PLACEHOLDER_IMAGE(23),
      PLACEHOLDER_IMAGE(24),
      PLACEHOLDER_IMAGE(25),
      PLACEHOLDER_IMAGE(26),
      PLACEHOLDER_IMAGE(27),
    ],
  },
];

const CONTENT_WIDTH = Dimensions.get('window').width - H_PADDING * 2;
const ITEM_WIDTH = CARD_WIDTH + CARD_GAP;
const CONTENT_PADDING_H = (CONTENT_WIDTH - ITEM_WIDTH) / 2;

function scrollOffsetToCenterCard(index: number): number {
  return CONTENT_PADDING_H + index * ITEM_WIDTH + ITEM_WIDTH / 2 - CONTENT_WIDTH / 2;
}

function indexFromScrollOffset(offsetX: number): number {
  return Math.round(
    (offsetX - CONTENT_PADDING_H + CONTENT_WIDTH / 2) / ITEM_WIDTH - 0.5
  );
}

export default function CardScreen() {
  const listRef = useRef<ScrollView>(null);
  const isDraggingBarRef = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const itemWidth = ITEM_WIDTH;
  const data = MOCK_CARDS;

  const { listMaxHeight, cardHeight } = useMemo(() => {
    return { listMaxHeight: CARD_LIST_HEIGHT, cardHeight: CARD_LIST_HEIGHT };
  }, []);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isDraggingBarRef.current) return;
      const x = e.nativeEvent.contentOffset.x;
      const index = indexFromScrollOffset(x);
      const clamped = Math.max(0, Math.min(index, data.length - 1));
      setCurrentIndex(clamped);
    },
    [data.length]
  );

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const index = indexFromScrollOffset(x);
      const clamped = Math.max(0, Math.min(index, data.length - 1));
      setCurrentIndex(clamped);
    },
    [data.length]
  );

  const scrollToIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, data.length - 1));
      setCurrentIndex(clamped);
      listRef.current?.scrollTo({
        x: scrollOffsetToCenterCard(clamped),
        y: 0,
        animated: true,
      });
    },
    [data.length]
  );

  const step = useMemo(() => {
    if (data.length <= 1 || trackWidth <= 0) return 0;
    return trackWidth / (data.length - 1);
  }, [data.length, trackWidth]);

  const thumbPosition = useMemo(() => {
    if (data.length <= 1 || trackWidth <= 0) return 0;
    return currentIndex * step + dragOffset;
  }, [currentIndex, data.length, trackWidth, step, dragOffset]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          isDraggingBarRef.current = true;
        },
        onPanResponderMove: (_, gestureState) => {
          if (data.length <= 1 || trackWidth <= 0) return;
          const dx = gestureState.dx;
          const base = currentIndex * step;
          const newPos = Math.min(trackWidth, Math.max(0, base + dx));
          setDragOffset(newPos - base);
          const fractionalIndex = (data.length - 1) * (newPos / trackWidth);
          const offset = scrollOffsetToCenterCard(fractionalIndex);
          listRef.current?.scrollTo({ x: offset, y: 0, animated: false });
        },
        onPanResponderRelease: () => {
          isDraggingBarRef.current = false;
          if (data.length <= 1 || trackWidth <= 0) {
            setDragOffset(0);
            return;
          }
          const currentPos = currentIndex * step + dragOffset;
          const nearestIndex = Math.round(currentPos / step);
          const clamped = Math.max(0, Math.min(nearestIndex, data.length - 1));
          setDragOffset(0);
          setCurrentIndex(clamped);
          scrollToIndex(clamped);
        },
      }),
    [currentIndex, data.length, trackWidth, step, scrollToIndex]
  );

  const onTrackLayout = useCallback((e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.contentCenter}>
        <View style={styles.listSection}>
          <View style={[styles.listWrap, { maxHeight: listMaxHeight }]}>
            <ScrollView
              ref={listRef}
              horizontal
              pagingEnabled={false}
              snapToInterval={ITEM_WIDTH}
              snapToAlignment="start"
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.listContent, { paddingHorizontal: CONTENT_PADDING_H }]}
              onScroll={onScroll}
              onMomentumScrollEnd={onMomentumScrollEnd}
              scrollEventThrottle={16}
            >
              {data.map((item) => (
                <View key={item.id} style={[styles.cardSlot, { width: itemWidth }]}>
                  <View style={[styles.cardInner, { height: cardHeight }]}>
                    <FlippableCard item={item} cardHeight={cardHeight} />
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.scrollbarSection}>
          <View style={styles.scrollbarWrap}>
            <View
              style={styles.scrollbarTrack}
              onLayout={onTrackLayout}
            >
              {trackWidth > 0 && (
                <View style={[styles.trackGradientWrap, { width: trackWidth }]} pointerEvents="none">
                  <Svg width={trackWidth} height={BAR_HEIGHT} style={styles.trackGradientSvg}>
                    <Defs>
                      <LinearGradient
                        id="scrollbarTrackGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <Stop offset="0%" stopColor={TRACK_GRADIENT_LEFT} />
                        <Stop offset="100%" stopColor={TRACK_GRADIENT_RIGHT} />
                      </LinearGradient>
                    </Defs>
                    <Rect
                      x={0}
                      y={0}
                      width={trackWidth}
                      height={BAR_HEIGHT}
                      rx={BAR_HEIGHT / 2}
                      ry={BAR_HEIGHT / 2}
                      fill="url(#scrollbarTrackGradient)"
                    />
                  </Svg>
                </View>
              )}
              {data.length > 1 &&
                trackWidth > 0 &&
                Array.from({ length: data.length }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.tickMarkWrap,
                      {
                        left: (i / (data.length - 1)) * trackWidth - 2,
                      },
                    ]}
                    pointerEvents="none"
                  >
                    <TickMark width={4} height={4} />
                  </View>
                ))}
              <View
                {...panResponder.panHandlers}
                style={[
                  styles.scrollbarThumb,
                  { left: trackWidth > 0 ? thumbPosition - HANDLE_SIZE / 2 : 0 },
                ]}
              >
                <ScrollbarHandle width={HANDLE_SIZE} height={HANDLE_SIZE} />
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const GAP_LIST_SCROLLBAR = 29;
const SCROLLBAR_BLOCK_HEIGHT = 93;
const CENTER_BLOCK_HEIGHT = CARD_LIST_HEIGHT + GAP_LIST_SCROLLBAR + SCROLLBAR_BLOCK_HEIGHT;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: H_PADDING,
    paddingTop: 0,
    paddingBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentCenter: {
    width: '100%',
    height: CENTER_BLOCK_HEIGHT,
  },
  listSection: {
    height: CARD_LIST_HEIGHT,
  },
  listWrap: {
    flex: 1,
    minHeight: 0,
  },
  listContent: {
    paddingBottom: 0,
  },
  cardSlot: {
    width: ITEM_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInner: {
    width: CARD_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollbarSection: {
    flexShrink: 0,
    paddingTop: GAP_LIST_SCROLLBAR,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollbarWrap: {
    width: '100%',
    minHeight: 44,
    paddingTop: 0,
    paddingBottom: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollbarTrack: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: BAR_WIDTH,
    height: BAR_HEIGHT,
    borderRadius: BAR_BORDER_RADIUS,
    position: 'relative',
    overflow: 'visible',
  },
  trackGradientWrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: BAR_HEIGHT,
    borderRadius: BAR_BORDER_RADIUS,
    overflow: 'hidden',
  },
  trackGradientSvg: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  tickMarkWrap: {
    position: 'absolute',
    top: '50%',
    marginTop: -2,
    width: 4,
    height: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollbarThumb: {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    top: (BAR_HEIGHT - HANDLE_SIZE) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
