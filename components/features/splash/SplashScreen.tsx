import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';

const FRAME_W = 195;
const FRAME_H = 138;

const SHIFT_Y = -50;

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    //if (__DEV__) return;

    const t = setTimeout(() => {
      router.replace('/(auth)/onboarding');
    }, 1000);

    return () => clearTimeout(t);
  }, [router]);

  const { logoW, logoH, sloganW, sloganH } = useMemo(() => {
    const logoW = Math.round(FRAME_W * 0.5);
    const logoH = Math.round(logoW * 0.35);

    const sloganW = Math.round(FRAME_W * 0.6);
    const sloganH = Math.round(sloganW * 0.22);

    return { logoW, logoH, sloganW, sloganH };
  }, []);

  return (
    <View style={styles.container}>
      {/* 프레임 */}
      <Image
        source={require('@/assets/images/frame.png')}
        style={[
          styles.frame,
          { width: FRAME_W, height: FRAME_H, transform: [{ translateY: SHIFT_Y }] },
        ]}
        resizeMode="contain"
      />

      {/* 로고 */}
      <Image
        source={require('@/assets/images/Me-mory.png')}
        style={[
          styles.logo,
          {
            width: logoW,
            height: logoH,
            top: '50%',
            marginTop: -logoH / 2,
            transform: [{ translateX: -logoW / 2 }, { translateY: SHIFT_Y }],
          },
        ]}
        resizeMode="contain"
      />

      {/* 슬로건 */}
      <Image
        source={require('@/assets/images/slogan.png')}
        style={[
          styles.slogan,
          {
            width: sloganW,
            height: sloganH,
            top: '50%',
            marginTop: logoH / 2 + 70,
            transform: [{ translateX: -sloganW / 2 }, { translateY: SHIFT_Y }],
          },
        ]}
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

  frame: {},

  logo: {
    position: 'absolute',
    left: '50%',
  },

  slogan: {
    position: 'absolute',
    left: '50%',
  },
});
