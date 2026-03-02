import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { Redirect, usePathname, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Colors } from '@/styles/colors';
import { typography } from '@/styles/typography';

type CameraFacing = 'back' | 'front';
type Step = 'capture' | 'review';

const COUNTDOWN_SECONDS = 15;

export default function RecordScreen() {
  const pathname = usePathname();
  const router = useRouter();
  if (typeof pathname === 'string' && pathname.includes('record') && pathname.includes('tabs')) {
    return <Redirect href="/record" />;
  }
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState<Step>('capture');
  const [topFacing, setTopFacing] = useState<CameraFacing>('back');
  const [mainUri, setMainUri] = useState<string | null>(null);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const oppositeFacing: CameraFacing = topFacing === 'back' ? 'front' : 'back';

  const clearCountdown = useCallback(() => {
    setCountdown(null);
  }, []);

  const takePicture = useCallback(async (): Promise<string | null> => {
    if (!cameraRef.current || !cameraReady || isCapturing) return null;
    setIsCapturing(true);
    try {
      const cam = cameraRef.current as { takePictureAsync: (opts: { quality?: number }) => Promise<{ uri: string }> };
      const result = await cam.takePictureAsync({ quality: 0.9 });
      if (result?.uri) return result.uri;
    } catch (e) {
      __DEV__ && console.warn('takePicture error', e);
    } finally {
      setIsCapturing(false);
    }
    return null;
  }, [cameraReady, isCapturing]);

  const onCapturePress = useCallback(async () => {
    if (!mainUri) {
      const uri = await takePicture();
      if (uri) {
        setCameraReady(false);
        setMainUri(uri);
        setCountdown(COUNTDOWN_SECONDS);
      }
      return;
    }
  }, [mainUri, takePicture]);

  useEffect(() => {
    if (mainUri == null || selfieUri != null || countdown == null) return;

    if (countdown <= 0) {
      clearCountdown();
      takePicture().then((uri) => {
        if (uri) {
          setSelfieUri(uri);
          setStep('review');
        }
      });
      return;
    }

    const id = setInterval(() => {
      setCountdown((prev) => (prev == null || prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [mainUri, selfieUri, countdown, clearCountdown, takePicture]);

  const onFlipCamera = useCallback(() => {
    setTopFacing((f) => (f === 'back' ? 'front' : 'back'));
  }, []);

  const onRetake = useCallback(() => {
    clearCountdown();
    setMainUri(null);
    setSelfieUri(null);
    setStep('capture');
  }, [clearCountdown]);

  const onNext = useCallback(() => {
    router.back();
  }, [router]);

  if (!permission) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerMessage}>
          <Text style={styles.messageText}>카메라 권한 확인 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
              <Feather name="chevron-left" size={24} color={Colors.black} />
            </Pressable>
            <Text style={styles.title}>기록하기</Text>
            <View style={styles.headerRight} />
          </View>
          <View style={styles.centerMessage}>
            <Text style={styles.messageText}>기록하기를 위해 카메라 접근이 필요합니다.</Text>
            <Pressable style={styles.permissionBtn} onPress={requestPermission}>
              <Text style={styles.permissionBtnText}>권한 허용</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const showTopCamera = !mainUri;
  const showBottomCamera = !!mainUri && !selfieUri;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <Feather name="chevron-left" size={24} color={Colors.black} />
          </Pressable>
          <Text style={styles.title}>기록하기</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.card}>
          {step === 'capture' ? (
            <>
              {/* Top: live camera or first photo + countdown */}
              <View style={styles.frameMain}>
                {showTopCamera ? (
                  <>
                    <CameraView
                      ref={cameraRef}
                      style={StyleSheet.absoluteFill}
                      facing={topFacing}
                      onCameraReady={() => setCameraReady(true)}
                    />
                    <View style={styles.flipBtnWrap} pointerEvents="box-none">
                      <Pressable
                        style={styles.flipBtn}
                        onPress={onFlipCamera}
                        hitSlop={12}
                      >
                        <Feather name="refresh-cw" size={22} color={Colors.grey700} />
                      </Pressable>
                    </View>
                  </>
                ) : (
                  <>
                    {mainUri && (
                      <Image
                        source={{ uri: mainUri }}
                        style={StyleSheet.absoluteFill}
                        contentFit="cover"
                      />
                    )}
                    {countdown != null && countdown >= 0 && (
                      <View style={styles.countdownOverlay}>
                        <Text style={styles.countdownText}>{countdown}</Text>
                      </View>
                    )}
                  </>
                )}
              </View>

              {/* Bottom: placeholder or second (selfie) camera */}
              <View style={styles.frameSelfie}>
                {showBottomCamera ? (
                  <CameraView
                    ref={cameraRef}
                    style={StyleSheet.absoluteFill}
                    facing={oppositeFacing}
                    onCameraReady={() => setCameraReady(true)}
                  />
                ) : (
                  <View style={styles.placeholder}>
                    <Feather name="maximize-2" size={28} color={Colors.grey400} />
                  </View>
                )}
              </View>
            </>
          ) : (
            <>
              <View style={styles.frameMain}>
                {mainUri && (
                  <Image
                    source={{ uri: mainUri }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                  />
                )}
              </View>
              <View style={styles.frameSelfie}>
                {selfieUri && (
                  <Image
                    source={{ uri: selfieUri }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                  />
                )}
              </View>
            </>
          )}
        </View>

        {step === 'capture' ? (
          <View style={styles.footer}>
            <Pressable
              style={[styles.captureBtn, isCapturing && styles.captureBtnDisabled]}
              onPress={onCapturePress}
              disabled={isCapturing}
            >
              <View style={styles.captureBtnInner} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.reviewActions}>
            <Pressable style={styles.retakeBtn} onPress={onRetake}>
              <Text style={styles.retakeBtnText}>다시 촬영</Text>
            </Pressable>
            <Pressable style={styles.nextBtn} onPress={onNext}>
              <Text style={styles.nextBtnText}>다음</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary100,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingTop: 8,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    ...typography.head4_22_regular,
    color: Colors.black,
  },
  headerRight: {
    width: 32,
  },
  centerMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  messageText: {
    ...typography.body3_16_regular,
    color: Colors.grey700,
    textAlign: 'center',
    marginBottom: 16,
  },
  permissionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary600,
    borderRadius: 12,
  },
  permissionBtnText: {
    ...typography.body3_16_regular,
    color: Colors.primary50,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.primary50,
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 400,
  },
  frameMain: {
    flex: 2,
    backgroundColor: Colors.grey150,
    overflow: 'hidden',
    position: 'relative',
  },
  frameSelfie: {
    flex: 1,
    backgroundColor: Colors.grey200,
    overflow: 'hidden',
    position: 'relative',
  },
  flipBtnWrap: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 48,
    height: 48,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  flipBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    ...typography.head2_26_regular,
    color: Colors.primary50,
    fontSize: 72,
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: Colors.primary600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtnInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary700,
  },
  captureBtnDisabled: {
    opacity: 0.6,
  },
  reviewActions: {
    flexDirection: 'row',
    paddingVertical: 24,
    gap: 12,
    paddingHorizontal: 4,
  },
  retakeBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary50,
    borderWidth: 1,
    borderColor: Colors.primary400,
    alignItems: 'center',
  },
  retakeBtnText: {
    ...typography.body3_16_regular,
    color: Colors.primary800,
  },
  nextBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary700,
    alignItems: 'center',
  },
  nextBtnText: {
    ...typography.body3_16_regular,
    color: Colors.primary50,
  },
});
