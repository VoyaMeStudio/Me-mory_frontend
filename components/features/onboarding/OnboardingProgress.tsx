import { Colors } from '@/styles/colors';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';

type Props = {
  total: number;
  activeIndex: number;
};

const DOT = 10;
const GAP = 12;

const PLANE_W = 26;
const PLANE_H = 27;

const LEFT_GUTTER = 30;

const EXTRA_GAP = 8; 

export default function OnboardingProgress({ total, activeIndex }: Props) {
  const safeTotal = 6;
  const safeIndex = Math.max(0, Math.min(activeIndex, safeTotal - 1));

  const x = useRef(new Animated.Value(0)).current;

  const dotStarts = useMemo(() => {
    const starts: number[] = [];
    let cur = LEFT_GUTTER;

    for (let i = 0; i < safeTotal; i++) {
      starts.push(cur);

      let gapAfter = GAP;

      if (i === safeIndex || i === safeIndex - 1) {
        gapAfter += EXTRA_GAP;
      }

      cur += DOT + (i === safeTotal - 1 ? 0 : gapAfter);
    }

    return starts;
  }, [safeIndex]);

  const areaWidth = useMemo(() => {
    const lastStart = dotStarts[safeTotal - 1] ?? LEFT_GUTTER;
    return lastStart + DOT; 
  }, [dotStarts]);

  const getTargetX = useCallback(() => {
    const dotStart = dotStarts[safeIndex] ?? LEFT_GUTTER;
    const dotCenter = dotStart + DOT / 2;
    return dotCenter - PLANE_W / 2;
  }, [dotStarts, safeIndex]);

  const run = useCallback(() => {
    const target = getTargetX();
    x.stopAnimation();
    Animated.timing(x, {
      toValue: target,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [getTargetX, x]);

  useEffect(() => {
    run();
  }, [run]);

  useFocusEffect(
    useCallback(() => {
      run();
      return () => {};
    }, [run]),
  );

  return (
    <View style={styles.wrap}>
      <View style={[styles.area, { width: areaWidth }]}>
        <View style={styles.row}>
          {Array.from({ length: safeTotal }).map((_, idx) => {
            const isActive = idx === safeIndex;
            const left = dotStarts[idx] ?? LEFT_GUTTER;

            return (
              <View
                key={idx}
                style={[
                  styles.dot,
                  isActive && styles.dotHidden,
                  { position: 'absolute', left },
                ]}
              />
            );
          })}
        </View>

        <Animated.View
          pointerEvents="none"
          style={[styles.planeBox, { transform: [{ translateX: x }] }]}
        >
          <Image
            source={require('@/assets/images/plane.png')}
            style={styles.plane}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },

  area: {
    position: 'relative',
    height: PLANE_H,
    justifyContent: 'center',
  },

  row: {
    height: PLANE_H,
  },

  dot: {
    width: DOT,
    height: DOT,
    borderRadius: 999,
    backgroundColor: Colors.primary300,
    opacity: 0.6,
    top: (PLANE_H - DOT) / 2, 
  },

  dotHidden: {
    opacity: 0,
  },

  planeBox: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: PLANE_H,
    justifyContent: 'center',
  },

  plane: { width: PLANE_W, height: PLANE_H },
});
