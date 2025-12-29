import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { BackHandler, View } from 'react-native';

import OnboardingStep1Screen from '@/components/features/onboarding/OnboardingStep1Screen';
import OnboardingStep2Screen from '@/components/features/onboarding/OnboardingStep2Screen';
import OnboardingStep3Screen from '@/components/features/onboarding/OnboardingStep3Screen';
import OnboardingStep4Screen from '@/components/features/onboarding/OnboardingStep4Screen';

type Step = 1 | 2 | 3 | 4;

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  const next = useCallback(() => {
    setStep((prev) => (prev < 4 ? ((prev + 1) as Step) : prev));
  }, []);

  const prev = useCallback(() => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev));
  }, []);

  const finish = useCallback(async () => {
    await AsyncStorage.setItem('hasOnboarded', 'true');
    router.replace('/(auth)/login');
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (step > 1) {
          prev();
          return true;
        }
        return false;
      });
      return () => sub.remove();
    }, [step, prev]),
  );

  return (
    <View style={{ flex: 1 }}>
      {step === 1 && <OnboardingStep1Screen onNext={next} />}
      {step === 2 && <OnboardingStep2Screen onNext={next} onPrev={prev} />}
      {step === 3 && <OnboardingStep3Screen onNext={next} onPrev={prev} />}
      {step === 4 && <OnboardingStep4Screen onFinish={finish} onPrev={prev} />}
    </View>
  );
}
