import OnboardingProgress from '@/components/features/onboarding/OnboardingProgress';
import { useAuth } from '@/context/authContext';
import { Colors } from '@/styles/colors';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import KakaoIcon from '@/assets/images/kakao.svg';
import * as SecureStore from 'expo-secure-store';

type Step4Props = {
  onFinish: () => void;
  onPrev: () => void;
};

const PAD = 8;

const travelImages = [
  require('@/assets/images/travel_1.png'),
  require('@/assets/images/travel_2.png'),
  require('@/assets/images/travel_3.png'),
  require('@/assets/images/travel_4.png'),
  require('@/assets/images/travel_5.png'),
  require('@/assets/images/travel_6.png'),
];

export default function OnboardingStep4Screen({ onFinish }: Step4Props) {
  const router = useRouter();
  const { checkAuth } = useAuth();
  const BASE_INDEX = 3;

  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const init = async () => {
      try {
        const isLoggedIn = await checkAuth();

        if (isLoggedIn) {
          router.replace('/(tabs)');
          return;
        }
      } catch (error) {
        console.error('온보딩 Step4 auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [checkAuth, router]);

 const handleKakaoStart = async () => {
  if (loading) return;

  await SecureStore.deleteItemAsync('access_token');
  await SecureStore.deleteItemAsync('refresh_token');

  router.push('/(auth)/kakao-webview');
};

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary600} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.bg} />

      <View pointerEvents="none" style={styles.routeLayer} />

      <View style={styles.bgOverlay} />

      <View style={styles.centerWrap}>
        <Text style={styles.title}>
          다양한 테마로{'\n'}
          나만의 기록을 더욱 다채롭게
        </Text>

        <View style={[styles.grid, { width: gridW, columnGap: gap }]}>
          {travelImages.map((img, idx) => (
            <View
              key={idx}
              style={[
                styles.card,
                { width: cardW, height: cardH, padding: PAD },
              ]}
            >
              <Image
                source={img}
                style={{ width: innerW, height: innerH }}
                resizeMode="contain"
              />
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
          <Text style={styles.kakaoButtonText}>카카오로 5초만에 시작하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.primary150,
    justifyContent: 'center',
    alignItems: 'center',
  },

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