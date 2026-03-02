import { Colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { Feather } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import CardFrontBg from '@/assets/images/card_default.svg';
import FlipButtonIcon from '@/assets/images/flip_button.svg';
import KebabMenuIcon from '@/assets/images/kebab_menu.svg';

import type { CardItem } from './types';

type BackScrollbarThumbProps = {
  scrollY: ReturnType<typeof useSharedValue<number>>;
  contentHeight: number;
  layoutHeight: number;
  trackHeight: number;
  thumbColor: string;
};

function BackScrollbarThumb({
  scrollY,
  contentHeight,
  layoutHeight,
  trackHeight,
  thumbColor,
}: BackScrollbarThumbProps) {
  const thumbStyle = useAnimatedStyle(() => {
    const range = Math.max(0, contentHeight - layoutHeight);
    const thumbHeight = Math.max(
      BACK_SCROLLBAR_THUMB_MIN,
      Math.min(trackHeight, (layoutHeight / Math.max(1, contentHeight)) * trackHeight)
    );
    const maxThumbTop = trackHeight - thumbHeight;
    const top =
      range > 0
        ? (scrollY.value / range) * maxThumbTop
        : 0;
    return {
      position: 'absolute' as const,
      left: 0,
      width: BACK_SCROLLBAR_TRACK_WIDTH,
      height: thumbHeight,
      top,
      backgroundColor: thumbColor,
      borderRadius: BACK_SCROLLBAR_TRACK_WIDTH / 2,
    };
  });
  return <Animated.View style={thumbStyle} />;
}

const CARD_WIDTH = 300;
const CARD_HEIGHT = 476;

const CARD_BG_WIDTH = 300;
const CARD_BG_HEIGHT = 474;

// Back card scrollbar: track spans full photo list height, 12px from card right
const BACK_SCROLLBAR_TRACK_WIDTH = 6;
const BACK_SCROLLBAR_PADDING = 8;
const BACK_SCROLLBAR_LEFT_FROM_CARD = 12;
const BACK_SCROLLBAR_THUMB_MIN = 24;
const BACK_SCROLLBAR_COLOR = Colors?.primary300 ?? '#E1D7C3';
// Vertical alignment with photo area: paddingTop 37 + header ~50 + title ~39
const BACK_SCROLLBAR_TOP = 37 + 50 + 39;
const BACK_PHOTO_HEIGHT = 316;

type Props = {
  item: CardItem;
  cardHeight?: number;
};

export default function FlippableCard({ item, cardHeight: customHeight }: Props) {
  const height = customHeight ?? CARD_HEIGHT;
  const rotation = useSharedValue(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const backScrollRef = useRef<ScrollView>(null);
  const [backScrollContentHeight, setBackScrollContentHeight] = useState(0);
  const [backScrollLayoutHeight, setBackScrollLayoutHeight] = useState(0);
  const backScrollY = useSharedValue(0);

  const flip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const onBackScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      backScrollY.value = e.nativeEvent.contentOffset.y;
    },
    [backScrollY]
  );

  const onBackContentSizeChange = useCallback((_w: number, h: number) => {
    setBackScrollContentHeight(h);
  }, []);

  const onBackScrollLayout = useCallback((e: { nativeEvent: { layout: { height: number } } }) => {
    setBackScrollLayoutHeight(e.nativeEvent.layout.height);
  }, []);

  useEffect(() => {
    rotation.value = withTiming(isFlipped ? 180 : 0, { duration: 400 });
  }, [isFlipped, rotation]);

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${rotation.value}deg` }],
    backfaceVisibility: 'hidden' as const,
  }));

  const backAnimatedStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    transform: [
      { perspective: 1000 },
      { rotateY: `${180 + rotation.value}deg` },
    ],
    backfaceVisibility: 'hidden' as const,
  }));

  const images = item.imageGrid?.length
    ? item.imageGrid
    : item.imageUri
      ? [item.imageUri]
      : [];

  return (
    <View style={[styles.outerWrap, { width: CARD_WIDTH, height }]}>
      <View style={[styles.cardSize, { width: CARD_WIDTH, height }]}>
        <Animated.View
          style={[styles.face, frontAnimatedStyle]}
          pointerEvents={isFlipped ? 'none' : 'auto'}
        >
          <View style={styles.card}>
            <View style={styles.cardBgWrap} pointerEvents="none">
              <CardFrontBg
                width={CARD_BG_WIDTH}
                height={height - 2}
                preserveAspectRatio="none"
              />
            </View>
            <View style={styles.cardContent} pointerEvents="box-none">
              <View style={styles.cardHeader} pointerEvents="box-none" collapsable={false}>
                <Pressable
                  style={styles.flipBtn}
                  onPress={flip}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <FlipButtonIcon width={32} height={32} />
                </Pressable>
                <Pressable style={styles.kebabBtn} onPress={() => {}}>
                  <KebabMenuIcon width={32} height={32} />
                </Pressable>
              </View>
              <ScrollView
                style={styles.cardScroll}
                contentContainerStyle={styles.cardScrollContent}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.title} numberOfLines={1}>
                  {item.title || '여행명은 공백 포함 14자'}
                </Text>
                {images.length > 0 ? (
                  <View style={[styles.mainImage, styles.placeholderImage]}>
                    <Image
                      source={{ uri: images[0] }}
                      style={StyleSheet.absoluteFill}
                      contentFit="cover"
                    />
                  </View>
                ) : (
                  <View style={[styles.mainImage, styles.placeholderImage]}>
                    <Feather name="image" size={40} color={Colors?.grey400} />
                  </View>
                )}
                <Text style={styles.dateRange}>{item.dateRange || '0000.00.00 - 0000.00.00'}</Text>
                <Text style={styles.description}>
                  {item.description || '공백 포함 54자 - 여행 설명을 작성해주세요.'}
                </Text>
              </ScrollView>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[styles.face, backAnimatedStyle]}
          pointerEvents={isFlipped ? 'auto' : 'none'}
        >
          <View style={styles.card}>
            <View style={styles.cardBgWrap} pointerEvents="none">
              <CardFrontBg
                width={CARD_BG_WIDTH}
                height={height - 2}
                preserveAspectRatio="none"
              />
            </View>
            <View style={styles.cardContent} pointerEvents="box-none">
              <View style={styles.backHeader}>
                <Pressable
                  onPress={flip}
                  style={styles.flipBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <FlipButtonIcon width={32} height={32} />
                </Pressable>
              </View>
              <Text style={styles.backTitle} numberOfLines={1}>
                {item.title || '여행명은 공백 포함 14자'}
              </Text>
              <View style={styles.backPhotoWrap}>
                <ScrollView
                  ref={backScrollRef}
                  style={styles.backPhotoScroll}
                  contentContainerStyle={styles.backScrollContent}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={images.length > 6}
                  keyboardShouldPersistTaps="handled"
                  onScroll={onBackScroll}
                  onContentSizeChange={onBackContentSizeChange}
                  onLayout={onBackScrollLayout}
                  scrollEventThrottle={16}
                >
                  {images.length > 0 ? (
                    <View style={styles.backPhotoGrid}>
                      {images.map((uri, i) => (
                        <View key={i} style={styles.backGridImageWrap}>
                          <Image
                            source={{ uri }}
                            style={StyleSheet.absoluteFill}
                            contentFit="cover"
                          />
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={[styles.backPlaceholder, styles.placeholderImage]}>
                      <Feather name="image" size={40} color={Colors?.grey400} />
                    </View>
                  )}
                </ScrollView>
              </View>
            </View>
            {images.length > 6 && (
              <View
                style={[
                  styles.backScrollbarOuter,
                  {
                    padding: BACK_SCROLLBAR_PADDING,
                    width:
                      BACK_SCROLLBAR_PADDING * 2 + BACK_SCROLLBAR_TRACK_WIDTH,
                  },
                ]}
                pointerEvents="none"
              >
                <View
                  style={[
                    styles.backScrollbarTrack,
                    {
                      width: BACK_SCROLLBAR_TRACK_WIDTH,
                      height: BACK_PHOTO_HEIGHT,
                    },
                  ]}
                >
                  <BackScrollbarThumb
                    scrollY={backScrollY}
                    contentHeight={backScrollContentHeight}
                    layoutHeight={backScrollLayoutHeight}
                    trackHeight={BACK_PHOTO_HEIGHT}
                    thumbColor={BACK_SCROLLBAR_COLOR}
                  />
                </View>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

export { CARD_WIDTH, CARD_HEIGHT };

const styles = StyleSheet.create({
  outerWrap: {
    position: 'relative',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  cardSize: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'relative',
  },
  face: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  cardBgWrap: {
    ...StyleSheet.absoluteFillObject,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    overflow: 'hidden',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 37,
    paddingBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    width: 277,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    zIndex: 10,
  },
  flipBtn: {
    padding: 4,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kebabBtn: {
    padding: 4,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: {
    padding: 4,
  },
  cardScroll: {
    flex: 1,
  },
  cardScrollContent: {
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    ...typography.head2_26_regular,
    height: 27,
    alignSelf: 'stretch',
    color: '#161616',
    textAlign: 'center',
    marginBottom: 12,
  },
  mainImage: {
    width: 233,
    height: 214,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: Colors?.grey200 ?? '#E2E2E2',
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
    justifyContent: 'center',
  },
  gridImage: {
    width: 72,
    height: 68,
    borderRadius: 10,
    backgroundColor: Colors?.grey200 ?? '#E2E2E2',
  },
  dateRange: {
    ...typography.body2_18_regular,
    height: 15,
    alignSelf: 'stretch',
    color: '#3E372D',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    ...typography.body1_20_regular,
    minHeight: 63,
    alignSelf: 'stretch',
    color: '#161616',
    textAlign: 'justify',
    marginBottom: 12,
  },
  backHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backTitle: {
    ...typography.head2_26_regular,
    height: 27,
    alignSelf: 'stretch',
    color: '#161616',
    textAlign: 'center',
    marginBottom: 12,
  },
  backPhotoWrap: {
    width: 216,
    height: 316,
    alignSelf: 'center',
    position: 'relative',
  },
  backPhotoScroll: {
    width: 216,
    height: 316,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  backScrollbarOuter: {
    position: 'absolute',
    right: BACK_SCROLLBAR_LEFT_FROM_CARD,
    top: BACK_SCROLLBAR_TOP,
    height: BACK_PHOTO_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backScrollbarTrack: {
    borderRadius: BACK_SCROLLBAR_TRACK_WIDTH / 2,
    overflow: 'hidden',
  },
  backScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingBottom: 16,
  },
  backPhotoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 216,
    gap: 12,
    alignContent: 'flex-start',
    alignItems: 'flex-start',
  },
  backGridImageWrap: {
    width: 102,
    height: 94,
    flexShrink: 0,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors?.grey200 ?? '#E2E2E2',
  },
  backPlaceholder: {
    width: '100%',
    minHeight: 120,
    borderRadius: 10,
    backgroundColor: Colors?.grey200 ?? '#E2E2E2',
  },
  backDescription: {
    ...typography.body4_14_regular,
    color: Colors?.grey600 ?? '#909090',
    textAlign: 'center',
  },
});
