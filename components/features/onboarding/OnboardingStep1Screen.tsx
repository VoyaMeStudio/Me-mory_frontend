import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function OnboardingStep1Screen() {
  const router = useRouter();

  function handleNext() {
    router.push('/(auth)/onboarding/step-2');
  }

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: '600' }}>Onboarding Step 1</Text>
      <Pressable onPress={handleNext} style={{ marginTop: 16 }}>
        <Text>다음</Text>
      </Pressable>
    </View>
  );
}
