import OnboardingProgress from '@/components/features/onboarding/OnboardingProgress';
import { useAuth } from '@/context/authContext';
import axiosInstance from '@/lib/axiosInstance';
import { Colors } from '@/styles/colors';
import KakaoLogins from '@react-native-kakao/user';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Travel1 from '@/assets/images/travel_1.svg';
import Travel2 from '@/assets/images/travel_2.svg';
import Travel3 from '@/assets/images/travel_3.svg';
import Travel4 from '@/assets/images/travel_4.svg';
import Travel5 from '@/assets/images/travel_5.svg';
import Travel6 from '@/assets/images/travel_6.svg';

import KakaoIcon from '@/assets/images/kakao.svg';

type Step4Props = {
  onFinish: () => void;
  onPrev: () => void;
};

const PAD = 8;
const Travels = [Travel1, Travel2, Travel3, Travel4, Travel5, Travel6];

export default function OnboardingStep4Screen({ onFinish }: Step4Props) {
  const router = useRouter();
  const { checkAuth } = useAuth();
  const BASE_INDEX = 3;

  const [loading, setLoading] = useState(false);

  const { gridW, cardW, cardH, innerW, innerH, gap } = useMemo(() => {
    const screenW = Dimensions.get('window').width;

    const H_PADDING = 20;

    const gridW = screenW - H_PADDING * 2;

    const gap = 3;

    const cardW = Math.floor((gridW - gap * 2) / 3);
    const cardH = Math.floor(cardW * 1.58);

    const innerW = cardW - PAD * 2;
    const innerH = cardH - PAD * 2;

    return { gridW, cardW, cardH, innerW, innerH, gap };
  }, []);

  const withTimeout = <T,>(p: Promise<T>, ms = 15000) =>
    Promise.race<T>([
      p,
      new Promise<T>((_, rej) =>
        setTimeout(() => rej(new Error(`TIMEOUT ${ms}ms`)), ms),
      ),
    ]);

  const handleKakaoStart = async () => {
    if (loading) return;
    setLoading(true);

    try {
      let token: any;
      try {
        token = await withTimeout(KakaoLogins.login(), 15000);
      } catch (err: any) {
        console.log('[AUTH] FAIL: KakaoLogins.login()', err?.message ?? err);
        return;
      }

      const kakaoAccessToken = token?.accessToken;
      if (!kakaoAccessToken) {
        console.log('[AUTH] FAIL: no kakao accessToken');
        return;
      }

      let res: any;
      try {
        res = await axiosInstance.post('/api/auth/login', {
          accessToken: kakaoAccessToken,
        });
      } catch (err: any) {
        console.log(
          '[AUTH] FAIL: backend login',
          err?.response?.data?.message ?? err?.message ?? err,
        );
        return;
      }

      const jwtToken = res.data?.data?.jwtAccessToken;
      const registered = res.data?.data?.registered;

      if (!jwtToken) {
        console.log('[AUTH] FAIL: no jwtAccessToken');
        return;
      }

      const pureToken = String(jwtToken).replace(/^Bearer\s+/i, '');
      await SecureStore.setItemAsync('access_token', pureToken);
      await checkAuth();

      const FORCE_PROFILE_SETUP =
        __DEV__ && process.env.EXPO_PUBLIC_FORCE_PROFILE_SETUP === 'true';

      if (FORCE_PROFILE_SETUP) {
        onFinish?.();
        router.replace('/onboarding/profile-setup');
        return;
      }

      if (registered) {
        router.replace('/home');
      } else {
        onFinish?.();
        router.replace('/onboarding/profile-setup');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.bg} />

      <View pointerEvents="none" style={styles.routeLayer}>
        <Image
          source={require('@/assets/images/route4.png')}
          resizeMode="contain"
          style={styles.routeImage}
        />
      </View>

      <View style={styles.bgOverlay} />

      <View style={styles.centerWrap}>
        <Text style={styles.title}>
          다양한 테마로{'\n'}
          나만의 기록을 더욱 다채롭게
        </Text>

        <View style={[styles.grid, { width: gridW, columnGap: gap }]}>
          {Travels.map((T, idx) => (
            <View
              key={idx}
              style={[
                styles.card,
                { width: cardW, height: cardH, padding: PAD },
              ]}
            >
              <T width={innerW} height={innerH} />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bottomWrap}>
        <OnboardingProgress total={4} activeIndex={BASE_INDEX} />

        <Pressable
          style={[styles.kakaoButton, loading && styles.kakaoButtonDisabled]}
          onPress={handleKakaoStart}
          disabled={loading}
        >
          <KakaoIcon width={17} height={16} />
          <Text style={styles.kakaoButtonText}>
            카카오로 5초만에 시작하기
          </Text>
          {loading && <ActivityIndicator style={{ marginLeft: 8 }} />}
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
    zIndex: 0,
  },


  routeLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },

  routeImage: {
    position: 'absolute',
    width: Dimensions.get('window').width * 1.1,
    height: Dimensions.get('window').height * 1.1,
    left: -Dimensions.get('window').width * 0.03,
    top: Dimensions.get('window').height * 0.04,
    opacity: 1,
  },


  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',

    paddingHorizontal: 20,
    paddingTop: 170,

    paddingHorizontal: 24,
    paddingTop: 100,
    transform: [{ translateY: 70 }],
    zIndex: 2,

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
    rowGap: 10,
  },

  card: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.primary100,
    justifyContent: 'center',
    alignItems: 'center',
  },

  bottomWrap: {
    paddingHorizontal: 24,
    paddingBottom: 34,
    gap: 16,
    zIndex: 2,
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

  kakaoButtonText: {
    color: '#272727',
    fontSize: 16,
    fontWeight: '700',
  },
});