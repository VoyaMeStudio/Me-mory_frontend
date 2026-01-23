import OnboardingProgress from '@/components/features/onboarding/OnboardingProgress';
import { useAuth } from '@/context/authContext';
import axiosInstance from '@/lib/axiosInstance';
import { Colors } from '@/styles/colors';
import KakaoLogins from '@react-native-kakao/user';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';

type Step4Props = {
  onFinish: () => void;
  onPrev: () => void;
};

export default function OnboardingStep4Screen({ onFinish, onPrev }: Step4Props) {
  const router = useRouter();
  const { checkAuth } = useAuth();
  const BASE_INDEX = 3;

  const [loading, setLoading] = useState(false);

  const { gridW, cardW, cardH } = useMemo(() => {
    const screenW = Dimensions.get('window').width;

    const H_PADDING = 24;
    const MAX_GRID_W = 360;
    const gridW = Math.min(screenW - H_PADDING * 2, MAX_GRID_W);

    const COLUMN_GAP = 8;
    const cardW = Math.floor((gridW - COLUMN_GAP * 2) / 3);
    const cardH = Math.floor(cardW * 1.58);

  
    return { gridW, cardW, cardH };
  }, []);

  const withTimeout = <T,>(p: Promise<T>, ms = 15000) =>
    Promise.race<T>([
      p,
      new Promise<T>((_, rej) => setTimeout(() => rej(new Error(`TIMEOUT ${ms}ms`)), ms)),
    ]);

  const handleKakaoStart = async () => {
  if (loading) return;
  setLoading(true);

  try {
    console.log('[AUTH] start kakao login');

    // 1) 카카오 로그인 
    let token: any;
    try {
      token = await withTimeout(KakaoLogins.login(), 15000);
      console.log('[AUTH] after KakaoLogins.login()');
    } catch (err: any) {
      console.log('[AUTH] FAIL: KakaoLogins.login()', err?.message ?? err);
      return;
    }

    const kakaoAccessToken = token?.accessToken;

    if (!kakaoAccessToken) {
      console.log('[AUTH] FAIL: no kakao accessToken');
      return;
    }
    console.log('[AUTH] kakao token OK');

    // 2) 백엔드 로그인
    let res: any;
    try {
      res = await axiosInstance.post('/api/auth/login', { accessToken: kakaoAccessToken });
    } catch (err: any) {
      console.log(
        '[AUTH] FAIL: backend login',
        err?.response?.data?.message ?? err?.message ?? err
      );
      return;
    }

    const jwtToken = res.data?.data?.jwtAccessToken;
    const registered = res.data?.data?.registered;

    if (!jwtToken) {
      console.log('[AUTH] FAIL: no jwtAccessToken');
      return;
    }
    console.log(`[AUTH] backend OK (registered=${registered})`);

    // 3) 토큰 저장 & auth 상태 갱신
    const pureToken = String(jwtToken).replace(/^Bearer\s+/i, '');
    await SecureStore.setItemAsync('access_token', pureToken);
    await checkAuth();
    console.log('[AUTH] token saved & auth refreshed');

    // 4) 라우팅
    const FORCE_PROFILE_SETUP =
  __DEV__ && process.env.EXPO_PUBLIC_FORCE_PROFILE_SETUP === 'true';

    if (FORCE_PROFILE_SETUP) {
      console.log('[AUTH] route -> profile-setup (FORCED DEV)');
      onFinish?.();
      router.replace('/(auth)/profile-setup');
      return;
    }

    if (registered) {
      console.log('[AUTH] route -> tabs');
      router.replace('/(tabs)');
    } else {
      console.log('[AUTH] route -> profile-setup');
      onFinish?.();
      router.replace('/(auth)/profile-setup');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <View style={styles.bg} />
      <View style={styles.bgOverlay} />

      <View style={styles.centerWrap}>
        <Text style={styles.title}>
          다양한 테마로{'\n'}
          나만의 기록을 더욱 다채롭게
        </Text>

        <View style={[styles.grid, { width: gridW }]}>
          <View style={[styles.card, { width: cardW, height: cardH }]}>
            <Image source={require('@/assets/images/travel_1.png')} style={styles.cardImage} resizeMode="contain" />
          </View>
          <View style={[styles.card, { width: cardW, height: cardH }]}>
            <Image source={require('@/assets/images/travel_2.png')} style={styles.cardImage} resizeMode="contain" />
          </View>
          <View style={[styles.card, { width: cardW, height: cardH }]}>
            <Image source={require('@/assets/images/travel_3.png')} style={styles.cardImage} resizeMode="contain" />
          </View>
          <View style={[styles.card, { width: cardW, height: cardH }]}>
            <Image source={require('@/assets/images/travel_4.png')} style={styles.cardImage} resizeMode="contain" />
          </View>
          <View style={[styles.card, { width: cardW, height: cardH }]}>
            <Image source={require('@/assets/images/travel_5.png')} style={styles.cardImage} resizeMode="contain" />
          </View>
          <View style={[styles.card, { width: cardW, height: cardH }]}>
            <Image source={require('@/assets/images/travel_6.png')} style={styles.cardImage} resizeMode="contain" />
          </View>
        </View>
      </View>

      <View style={styles.bottomWrap}>
        <OnboardingProgress total={4} activeIndex={BASE_INDEX} />

        <Pressable
          style={[styles.kakaoButton, loading && styles.kakaoButtonDisabled]}
          onPress={handleKakaoStart}
          disabled={loading}
        >
          <Image source={require('@/assets/images/kakao.png')} style={styles.kakaoIcon} resizeMode="contain" />
          <Text style={styles.kakaoButtonText}>카카오로 5초만에 시작하기</Text>
          {loading ? <ActivityIndicator style={{ marginLeft: 8 }} /> : null}
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
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 100,
    transform: [{ translateY: 70 }],
  },

  title: {
    textAlign: 'center',
    fontSize: 26,
    lineHeight: 36,
    letterSpacing: -0.28,
    color: Colors.primary600,
    fontFamily: 'Nanum',
    marginBottom: 28,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: 8,
    rowGap: 14,
  },

  card: {
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
    paddingBottom: 34,
    marginBottom: 0,
    gap: 16,
  },

  kakaoButton: {
    height: 54,
    borderRadius: 999,
    backgroundColor: '#F7E05A',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },

  kakaoButtonDisabled: {
    opacity: 0.7,
  },

  kakaoIcon: {
    width: 17,
    height: 16,
  },

  kakaoButtonText: {
    color: '#272727',
    fontSize: 16,
    fontWeight: '700',
  },
});
