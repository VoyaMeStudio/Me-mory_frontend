import OnboardingProgress from '@/components/features/onboarding/OnboardingProgress';
import { Colors } from '@/styles/colors';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function OnboardingStep1Screen() {
  const router = useRouter();

  const BASE_INDEX = 0;
  //임시
  const [tempIndex, setTempIndex] = useState<number | null>(null);

  const lockedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      lockedRef.current = false;
      setTempIndex(null);
      return () => {};
    }, []),
  );

  function handleNext() {
    if (lockedRef.current) return;
    lockedRef.current = true;

    // 비행기 이동 먼저 보여주기 (고민중)
    setTempIndex(1);

    setTimeout(() => {
      router.push('/(auth)/onboarding/step-2');
    }, 240);
  }

  const activeIndex = tempIndex ?? BASE_INDEX;

  return (
    <View style={styles.container}>
      <View style={styles.bg} />
      <View style={styles.bgOverlay} />

      <View style={styles.centerWrap}>
        <Image
          source={require('@/assets/images/paper_step1.png')}
          style={styles.paper}
          resizeMode="contain"
        />

        <View style={styles.paperTextBox} pointerEvents="none">
          <Text style={styles.paperText}>
            그대의 감정과{'\n'}
            나만의 시선으로 담은 순간들{'\n\n'}
            시간이 지나도{'\n'}
            선명하게 기억되고 있도록,
          </Text>
        </View>
      </View>

      <View style={styles.bottomWrap}>
        <OnboardingProgress total={5} activeIndex={activeIndex} />

        <Pressable onPress={handleNext} style={styles.nextButton}>
          <Text style={styles.nextButtonText}>다음</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primary150,
  },

  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primary150,
    opacity: 0.22,
  },

  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  paper: {
    width: '88%',
    maxWidth: 360,
    height: 420,
  },

 paperTextBox: {
  position: 'absolute',
  width: 280,
  height: 143,
  alignItems: 'center',
  justifyContent: 'center',
  transform: [
    { rotate: '-2.262deg' },
    { translateY: 20}, 
  ],
},

  paperText: {
    textAlign: 'center',
    fontSize: 28,
    lineHeight: 28,
    letterSpacing: -0.28,
    color: Colors.primary600,
    fontFamily: 'Nanum',
  },

  bottomWrap: {
  paddingHorizontal: 24,
  paddingBottom: 28,
  marginBottom: 12, 
  gap: 16,
},


  nextButton: {
    height: 54,
    borderRadius: 999,
    backgroundColor: Colors.primary800,
    alignItems: 'center',
    justifyContent: 'center',
  },

  nextButtonText: {
    color: Colors.primary100,
    fontSize: 22,
    fontWeight: '400',
    fontFamily: 'Nanum',
  },
});
