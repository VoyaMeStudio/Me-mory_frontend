import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    //if (__DEV__) return; // 개발 중 고정
    const t = setTimeout(() => {
      router.replace('/(auth)/onboarding/step-1');
    }, 1000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <View style={styles.container}>
      <Image
         source={require('@/assets/images/logo&slogan.png')}
        style={styles.group}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  group: {
    width: 195,
    height: 179,
    transform: [{ translateY: -30 }], 
  },
});


       