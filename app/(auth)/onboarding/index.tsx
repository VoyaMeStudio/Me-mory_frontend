import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, View } from 'react-native';

import OnboardingStep1Screen from '@/components/features/onboarding/OnboardingStep1Screen';
import OnboardingStep2Screen from '@/components/features/onboarding/OnboardingStep2Screen';
import OnboardingStep3Screen from '@/components/features/onboarding/OnboardingStep3Screen';
import OnboardingStep4Screen from '@/components/features/onboarding/OnboardingStep4Screen';
import { useAuth } from '@/context/authContext';

type Step = 1 | 2 | 3 | 4;

export default function OnboardingScreen() {
  const router = useRouter();
  const { checkAuth } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const init = async () => {
    try {
      const isLoggedIn = await checkAuth();
      console.log("[OnboardingScreen] isLoggedIn =", isLoggedIn);

      if (isLoggedIn) {
        router.replace("/(tabs)");
        return;
      }
    } catch (error) {
      console.error("OnboardingScreen auth check error:", error);
    } finally {
      setLoading(false);
    }
  };

  init();
}, [checkAuth, router]);
  

  const next = useCallback(() => {
    setStep((prev) => (prev < 4 ? ((prev + 1) as Step) : prev));
  }, []);

  const prev = useCallback(() => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev));
  }, []);

  const finish = useCallback(async () => {
    await AsyncStorage.setItem('hasOnboarded', 'true');
  }, []);

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

  if (loading) {
    return <View style={{ flex: 1 }}><ActivityIndicator /></View>;
  }

  return (
    <View style={{ flex: 1 }}>
      {step === 1 && <OnboardingStep1Screen onNext={next} />}
      {step === 2 && <OnboardingStep2Screen onNext={next} onPrev={prev} />}
      {step === 3 && <OnboardingStep3Screen onNext={next} onPrev={prev} />}
      {step === 4 && <OnboardingStep4Screen onFinish={finish} onPrev={prev} />}
    </View>
  );
}