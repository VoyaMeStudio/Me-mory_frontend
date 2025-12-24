import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function OnboardingStep6Screen() {
  const router = useRouter();

  async function handleFinish() {
    await AsyncStorage.setItem('hasOnboarded', 'true');
    router.replace('/(tabs)'); // 완료 후 초기화면
  }

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: '600' }}>Onboarding Step 6</Text>

      <Pressable onPress={handleFinish} style={{ marginTop: 16 }}>
        <Text>완료</Text>
      </Pressable>
    </View>
  );
}
