import OnboardingProgress from '@/components/features/onboarding/OnboardingProgress';
import { Colors } from '@/styles/colors';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type Step2Props = {
  onNext: () => void;
  onPrev: () => void;
};

export default function OnboardingStep2Screen({ onNext }: Step2Props) {
  const BASE_INDEX = 1;

  function handleNext() {
    onNext();
  }

  return (
    <View style={styles.container}>
      <View style={styles.bg} />
      <View style={styles.bgOverlay} />

      <View style={styles.centerWrap}>
        <Text style={styles.title}>
          내 시선 속 <Text style={styles.highlightGreen}>풍경</Text>과{'\n'}
          그 순간의 <Text style={styles.highlightOrange}>나</Text>를{'\n'}
          한 컷에
        </Text>

        <View style={styles.imageWrapper}>
          <Image
            source={require('@/assets/images/Rectangle_1.png')}
            style={styles.topImage}
            resizeMode="cover"
          />
          <Image
            source={require('@/assets/images/Rectangle_2.png')}
            style={styles.bottomImage}
            resizeMode="cover"
          />
        </View>
      </View>

      <View style={styles.bottomWrap}>
        <OnboardingProgress total={4} activeIndex={BASE_INDEX} />

        <Pressable style={styles.nextButton} onPress={handleNext}>
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
    paddingTop: 55,
  },

  title: {
    textAlign: 'center',
    fontSize: 26,
    lineHeight: 36,
    letterSpacing: -0.28,
    color: Colors.primary600,
    fontFamily: 'Nanum',
    marginBottom: 20,
  },

  highlightGreen: {
    color: '#8AA36B',
    fontFamily: 'Nanum',
  },

  highlightOrange: {
    color: '#E58C6A',
    fontFamily: 'Nanum',
  },

  imageWrapper: {
    width: '70%',
    maxWidth: 330,
    height: 450,
    borderRadius: 7,
    overflow: 'hidden',
    backgroundColor: Colors.primary100,
  },

  topImage: {
    width: '100%',
    height: '50%',
  },

  bottomImage: {
    width: '100%',
    height: '50%',
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
