import { Colors } from '@/styles/colors';
import type { CardItem } from '@/components/features/card/types';
import FlippableCard, { CARD_WIDTH, CARD_HEIGHT } from '@/components/features/card/FlippableCard';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getTrips, tripToCardItem } from '@/lib/api/trips';
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
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getTrips()
      .then((trips) => {
        if (cancelled) return;
        const list = trips.map(tripToCardItem);
        setCards(list);
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          err?.response?.data?.message ??
          err?.message ??
          '여행 목록을 불러오지 못했습니다.';
        setError(message);
        setCards([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const itemWidth = ITEM_WIDTH;
  const data = cards;

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

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={TRACK_LEFT_COLOR} />
        <Text style={styles.loadingText}>여행 목록 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyText}>아직 여행이 없어요.</Text>
        <Text style={styles.emptySubtext}>새 여행을 추가하면 카드로 보여져요.</Text>
      </View>
    );
  }

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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors?.grey600 ?? '#666',
  },
  errorText: {
    fontSize: 14,
    color: Colors?.grey800 ?? '#333',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    color: Colors?.grey800 ?? '#333',
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: Colors?.grey600 ?? '#666',
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
