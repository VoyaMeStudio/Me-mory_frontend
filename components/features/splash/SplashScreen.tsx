import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(function handleAutoMove() {
    const timeoutId = setTimeout(function moveToOnboarding() {
      router.replace('/(auth)/onboarding/step-1');
    }, 1000);

    return function cleanup() {
      clearTimeout(timeoutId);
    };
  }, [router]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: '600' }}>Splash</Text>
    </View>
  );
}
