import OnboardingProgress from '@/components/features/onboarding/OnboardingProgress';
import { Colors } from '@/styles/colors';
import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

type Step1Props = {
  onNext: () => void;
};

export default function OnboardingStep1Screen({ onNext }: Step1Props) {
  const BASE_INDEX = 0;
  const { width: W, height: H } = useWindowDimensions();

  function handleNext() {
    onNext();
  }

  const routeWidth = W * 1.1;
  const routeHeight = H * 1.1;

  const routeLeft = -W * 0.05;
  const routeTop = H * 0.01;

  return (
    <View style={styles.container}>
      <View style={styles.bg} />
      <View pointerEvents="none" style={styles.routeLayer}>
        <Image
          source={require('@/assets/images/route.png')}
          resizeMode="contain"
          style={{
            position: 'absolute',
            width: routeWidth,
            height: routeHeight,
            left: routeLeft,
            top: routeTop,
            opacity: 1,
          }}
        />
      </View>

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
        <OnboardingProgress total={5} activeIndex={BASE_INDEX} />

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
    opacity: 0.18,
    zIndex: 0,
  },

  routeLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },

  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 2, 
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
    transform: [{ rotate: '-2.262deg' }, { translateY: 20 }],
  },

  paperText: {
    textAlign: 'center',
    fontSize: 28,
    lineHeight: 28,
    letterSpacing: -0.28,
    color: Colors.primary950,
    fontFamily: 'Nanum',
  },

  bottomWrap: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    marginBottom: 12,
    gap: 16,
    zIndex: 2,
  },

  nextButton: {
    height: 54,
    borderRadius: 999,
    backgroundColor: Colors.primary900,
    alignItems: 'center',
    justifyContent: 'center',
  },

  nextButtonText: {
    color: Colors.primary50,
    fontSize: 22,
    fontWeight: '400',
    fontFamily: 'Nanum',
  },
});
