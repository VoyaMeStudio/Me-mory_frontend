import { Colors } from '@/styles/colors';
import type { CardItem } from '@/components/features/card/types';
import FlippableCard, { CARD_WIDTH, CARD_HEIGHT } from '@/components/features/card/FlippableCard';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import ScrollbarHandle from '@/assets/images/scrollbar_handle.svg';
import TickMark from '@/assets/images/Tick-mark.svg';

const H_PADDING = 24;
const CARD_GAP = 19;
const TRACK_LEFT_COLOR = Colors?.primary400 ?? '#C6B9A5';
const TRACK_RIGHT_COLOR = Colors?.primary300 ?? '#E1D7C3';
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
    title: '여행명은 공백 포함 14자입니다',
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
  {
    id: '4',
    title: '네 번째 카드',
    dateRange: '2025.03.01 - 2025.03.07',
    description: '봄 여행 기록입니다.',
    imageGrid: [
      PLACEHOLDER_IMAGE(30),
      PLACEHOLDER_IMAGE(31),
      PLACEHOLDER_IMAGE(32),
    ],
  },
  {
    id: '5',
    title: '다섯 번째 카드',
    dateRange: '2025.03.15 - 2025.03.20',
    description: '주말 소풍 메모.',
    imageGrid: [
      PLACEHOLDER_IMAGE(40),
      PLACEHOLDER_IMAGE(41),
      PLACEHOLDER_IMAGE(42),
      PLACEHOLDER_IMAGE(43),
    ],
  },
  {
    id: '6',
    title: '여섯 번째 카드',
    dateRange: '2025.04.01 - 2025.04.05',
    description: '벚꽃 구경 여행.',
    imageGrid: [
      PLACEHOLDER_IMAGE(50),
      PLACEHOLDER_IMAGE(51),
      PLACEHOLDER_IMAGE(52),
      PLACEHOLDER_IMAGE(53),
      PLACEHOLDER_IMAGE(54),
    ],
  },
  {
    id: '7',
    title: '일곱 번째 카드',
    dateRange: '2025.04.10 - 2025.04.15',
    description: '가족 여행 기록입니다.',
    imageGrid: [
      PLACEHOLDER_IMAGE(60),
      PLACEHOLDER_IMAGE(61),
      PLACEHOLDER_IMAGE(62),
      PLACEHOLDER_IMAGE(63),
      PLACEHOLDER_IMAGE(64),
      PLACEHOLDER_IMAGE(65),
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
  /** Thumb position (0..trackWidth) during drag, driven by gesture - no re-renders */
  const thumbPositionAnim = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDraggingHandle, setIsDraggingHandle] = useState(false);
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

  // Keep animated thumb in sync when list is scrolled (not dragging handle)
  useEffect(() => {
    if (!isDraggingHandle && trackWidth > 0 && data.length > 1) {
      thumbPositionAnim.setValue(currentIndex * step);
    }
  }, [currentIndex, step, isDraggingHandle, trackWidth, data.length, thumbPositionAnim]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          isDraggingBarRef.current = true;
          setIsDraggingHandle(true);
        },
        onPanResponderMove: (_, gestureState) => {
          if (data.length <= 1 || trackWidth <= 0) return;
          const dx = gestureState.dx;
          const base = currentIndex * step;
          const newPos = Math.min(trackWidth, Math.max(0, base + dx));
          thumbPositionAnim.setValue(newPos);
          const fractionalIndex = (data.length - 1) * (newPos / trackWidth);
          const offset = scrollOffsetToCenterCard(fractionalIndex);
          listRef.current?.scrollTo({ x: offset, y: 0, animated: false });
        },
        onPanResponderRelease: (_, gestureState) => {
          isDraggingBarRef.current = false;
          setIsDraggingHandle(false);
          if (data.length <= 1 || trackWidth <= 0) {
            setDragOffset(0);
            return;
          }
          const startPos = currentIndex * step;
          const finalPos = Math.min(trackWidth, Math.max(0, startPos + gestureState.dx));
          const nearestIndex = Math.round(finalPos / step);
          const clamped = Math.max(0, Math.min(nearestIndex, data.length - 1));
          setDragOffset(0);
          setCurrentIndex(clamped);
          thumbPositionAnim.setValue(clamped * step);
          scrollToIndex(clamped);
        },
      }),
    [currentIndex, data.length, trackWidth, step, scrollToIndex, thumbPositionAnim]
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
              snapToInterval={isDraggingHandle ? undefined : ITEM_WIDTH}
              snapToAlignment={isDraggingHandle ? undefined : 'start'}
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
                  <Animated.View
                    style={[
                      styles.trackSegmentLeft,
                      {
                        width: thumbPositionAnim,
                        borderTopLeftRadius: BAR_HEIGHT / 2,
                        borderBottomLeftRadius: BAR_HEIGHT / 2,
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.trackSegmentRight,
                      {
                        left: thumbPositionAnim,
                        borderTopRightRadius: BAR_HEIGHT / 2,
                        borderBottomRightRadius: BAR_HEIGHT / 2,
                      },
                    ]}
                  />
                </View>
              )}
              {data.length > 1 &&
                trackWidth > 0 &&
                Array.from({ length: data.length }).map((_, i) => {
                  const tickLeft = (i / (data.length - 1)) * trackWidth - 2;
                  const opacity = thumbPositionAnim.interpolate({
                    inputRange: [tickLeft - 2, tickLeft + 2],
                    outputRange: [1, 0],
                    extrapolate: 'clamp',
                  });
                  return (
                    <Animated.View
                      key={i}
                      style={[styles.tickMarkWrap, { left: tickLeft }, { opacity }]}
                      pointerEvents="none"
                    >
                      <TickMark width={4} height={4} />
                    </Animated.View>
                  );
                })}
              <Animated.View
                {...panResponder.panHandlers}
                style={[
                  styles.scrollbarThumb,
                  {
                    left: trackWidth > 0
                      ? thumbPositionAnim.interpolate({
                          inputRange: [0, trackWidth],
                          outputRange: [-HANDLE_SIZE / 2, trackWidth - HANDLE_SIZE / 2],
                        })
                      : -HANDLE_SIZE / 2,
                  },
                ]}
              >
                <ScrollbarHandle width={HANDLE_SIZE} height={HANDLE_SIZE} />
              </Animated.View>
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
  trackSegmentLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: BAR_HEIGHT,
    backgroundColor: TRACK_LEFT_COLOR,
    overflow: 'hidden',
  },
  trackSegmentRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: BAR_HEIGHT,
    backgroundColor: TRACK_RIGHT_COLOR,
    overflow: 'hidden',
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
