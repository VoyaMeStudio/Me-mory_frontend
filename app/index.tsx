import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(function loadOnboardingFlag() {
    (async function () {
      const value = await AsyncStorage.getItem('hasOnboarded');
      setHasOnboarded(value === 'true');
      setIsLoading(false);
    })();
  }, []);

  if (isLoading) {
    return null;
  }

  if (hasOnboarded) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/splash" />;
}
