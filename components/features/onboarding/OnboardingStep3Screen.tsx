import OnboardingProgress from '@/components/features/onboarding/OnboardingProgress';
import { Colors } from '@/styles/colors';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type Step3Props = {
  onNext: () => void;
   onPrev: () => void;
};

export default function OnboardingStep3Screen({ onNext }: Step3Props) {
  const BASE_INDEX = 2;

  return (
    <View style={styles.container}>
      <View style={styles.bg} />
      <View style={styles.bgOverlay} />

      <View style={styles.centerWrap}>
        <Text style={styles.title}>
          기억된 순간들이 오며{'\n'}
          나만의 <Text style={styles.highlight}>여행 아카이브</Text>로
        </Text>

        <View style={styles.cardWrap}>
          <View style={styles.card}>
            <Image
              source={require('@/assets/images/card1.png')}
              style={styles.cardImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.card}>
            <Image
              source={require('@/assets/images/card2.png')}
              style={styles.cardImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      <View style={styles.bottomWrap}>
        <OnboardingProgress total={4} activeIndex={BASE_INDEX} />

        <Pressable style={styles.nextButton} onPress={onNext}>
          <Text style={styles.nextButtonText}>다음</Text>
        </Pressable>
      </View>
    </View>
  );
}


const CARD_W = 155;
const CARD_H = 245;

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
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 100,
    transform: [{ translateY: 100}], 
  },

  title: {
    textAlign: 'center',
    fontSize: 26,
    lineHeight: 36,
    letterSpacing: -0.28,
    color: Colors.primary600,
    fontFamily: 'Nanum',
    marginBottom: 22,
  },

  highlight: {
    color: Colors.primary800,
    fontFamily: 'Nanum',
  },

  cardWrap: {
    flexDirection: 'row',
    columnGap: 18, 
    alignItems: 'flex-end',
    marginTop: 8,
  },

  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.primary100,
    paddingTop: 8,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  cardImage: {
    width: '100%',
    height: '100%',
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
