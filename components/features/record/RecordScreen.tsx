import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Colors } from '@/styles/colors';
import { typography } from '@/styles/typography';

// expo-camera requires native code; load optionally so we don't crash in Expo Go
let CameraView: any = null;
let useCameraPermissions: (() => [{ granted: boolean } | null, () => Promise<{ granted: boolean }>]) | null = null;
try {
  const camera = require('expo-camera');
  CameraView = camera.CameraView;
  useCameraPermissions = camera.useCameraPermissions;
} catch {
  // Native module 'ExpoCamera' not found (e.g. running in Expo Go) — show fallback UI
}

type CameraFacing = 'back' | 'front';
type Step = 'capture' | 'review';

const COUNTDOWN_SECONDS = 15;

function RecordScreenCameraUnavailable() {
  const router = useRouter();
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
          <Text style={styles.messageText}>
            카메라는 개발 빌드에서만 사용할 수 있습니다.{'\n'}
            터미널에서 {'"npx expo run:ios"'} 또는 {'"npx expo run:android"'} 를 실행해 주세요.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const PERMISSION_CHECK_TIMEOUT_MS = 3000;

function RecordScreenContent() {
  const router = useRouter();
  const topCameraRef = useRef<any>(null);
  const bottomCameraRef = useRef<any>(null);

  const [permission, requestPermission] = useCameraPermissions!();
  const [permissionCheckTimedOut, setPermissionCheckTimedOut] = useState(false);
  const [step, setStep] = useState<Step>('capture');
  const [topFacing, setTopFacing] = useState<CameraFacing>('back');
  const [mainUri, setMainUri] = useState<string | null>(null);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [topCameraReady, setTopCameraReady] = useState(false);
  const [bottomCameraReady, setBottomCameraReady] = useState(false);

  useEffect(() => {
    if (permission != null) return;
    const t = setTimeout(() => setPermissionCheckTimedOut(true), PERMISSION_CHECK_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [permission]);

  const oppositeFacing: CameraFacing = topFacing === 'back' ? 'front' : 'back';
  const showTopCamera = !mainUri;
  const showBottomCamera = !!mainUri && !selfieUri;

  const clearCountdown = useCallback(() => {
    setCountdown(null);
  }, []);

  const takePictureWithRef = useCallback(async (ref: React.RefObject<any>, _isReady: boolean): Promise<string | null> => {
    // Attempt taking a photo as soon as possible. Some devices/dev-builds can fire `onCameraReady`
    // slightly later, so readiness gating can cause the 2nd capture to never happen.
    if (!ref.current || isCapturing) return null;
    setIsCapturing(true);
    try {
      const cam = ref.current as { takePictureAsync?: (opts: { quality?: number }) => Promise<{ uri: string }> };
      if (typeof cam?.takePictureAsync !== 'function') {
        __DEV__ && console.warn('takePictureAsync not available on camera ref');
        return null;
      }
      const result = await cam.takePictureAsync({ quality: 0.9 });
      if (result?.uri) return result.uri;
    } catch (e) {
      __DEV__ && console.warn('takePicture error', e);
    } finally {
      setIsCapturing(false);
    }
    return null;
  }, [isCapturing]);

  const onCapturePress = useCallback(async () => {
    if (!mainUri) {
      // First photo: take with top camera (default back, user can flip to selfie)
      const uri = await takePictureWithRef(topCameraRef, topCameraReady);
      if (uri) {
        setTopCameraReady(false);
        setMainUri(uri);
        setCountdown(COUNTDOWN_SECONDS);
      }
      return;
    }
    // Second photo: user can tap button instead of waiting for countdown
    if (selfieUri) return;
    const uri = await takePictureWithRef(bottomCameraRef, bottomCameraReady);
    if (uri) {
      clearCountdown();
      setSelfieUri(uri);
      setStep('review');
    }
  }, [mainUri, selfieUri, topCameraReady, bottomCameraReady, takePictureWithRef, clearCountdown]);

  useEffect(() => {
    if (mainUri == null || selfieUri != null || countdown == null) return;

    if (countdown <= 0) {
      // Retry automatically until the bottom camera can actually capture.
      (async () => {
        const uri = await takePictureWithRef(bottomCameraRef, bottomCameraReady);
        if (uri) {
          clearCountdown();
          setSelfieUri(uri);
          setStep('review');
          return;
        }
        // Keep countdown non-null so this effect runs again and retries.
        setCountdown(1);
      })();
      return;
    }

    const id = setInterval(() => {
      setCountdown((prev) => (prev == null || prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [mainUri, selfieUri, countdown, clearCountdown, bottomCameraReady, takePictureWithRef]);

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
    if (permissionCheckTimedOut) {
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
              <Text style={styles.messageText}>
                카메라 권한을 확인할 수 없습니다.{'\n'}
                뒤로 가서 개발 빌드에서 다시 시도해 주세요.
              </Text>
              <Pressable style={styles.permissionBtn} onPress={() => router.back()}>
                <Text style={styles.permissionBtnText}>뒤로 가기</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      );
    }
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
            <Text style={styles.messageText}>카메라 권한 확인 중...</Text>
            <Pressable
              style={[styles.permissionBtn, { marginTop: 16 }]}
              onPress={() => typeof requestPermission === 'function' && requestPermission()}
            >
              <Text style={styles.permissionBtnText}>권한 요청</Text>
            </Pressable>
          </View>
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
            <Pressable style={styles.permissionBtn} onPress={() => typeof requestPermission === 'function' && requestPermission()}>
              <Text style={styles.permissionBtnText}>권한 허용</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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

        <View style={styles.boxesWrap}>
          <View style={styles.boxTop}>
            {step === 'capture' ? (
              showTopCamera ? (
                <>
                  <CameraView
                    ref={topCameraRef}
                    style={StyleSheet.absoluteFill}
                    facing={topFacing}
                    onCameraReady={() => setTopCameraReady(true)}
                  />
                  <View style={styles.aspectHintWrap} pointerEvents="box-none">
                    <Feather name="maximize-2" size={20} color={Colors.grey500} />
                  </View>
                  {__DEV__ && topCameraReady && (
                    <View style={styles.cameraStatusBadge}>
                      <Text style={styles.cameraStatusText}>Camera ready</Text>
                    </View>
                  )}
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
                      <Text style={styles.countdownText}>{countdown}s</Text>
                    </View>
                  )}
                </>
              )
            ) : (
              mainUri && (
                <Image
                  source={{ uri: mainUri }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                />
              )
            )}
          </View>

          <View style={styles.boxBottom}>
            {step === 'capture' ? (
              showBottomCamera ? (
                <>
                  <CameraView
                    ref={bottomCameraRef}
                    style={StyleSheet.absoluteFill}
                    facing={oppositeFacing}
                    onCameraReady={() => setBottomCameraReady(true)}
                  />
                  {__DEV__ && bottomCameraReady && (
                    <View style={styles.cameraStatusBadge}>
                      <Text style={styles.cameraStatusText}>Bottom ready</Text>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.placeholder}>
                  <Feather name="maximize-2" size={28} color={Colors.grey400} />
                </View>
              )
            ) : (
              selfieUri && (
                <Image
                  source={{ uri: selfieUri }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                />
              )
            )}
          </View>
        </View>

        {step === 'capture' ? (
          <View style={styles.footer}>
            <View style={styles.footerSpacer} />
            <Pressable
              style={[styles.captureBtn, isCapturing && styles.captureBtnDisabled]}
              onPress={onCapturePress}
              disabled={isCapturing}
            >
              <View style={styles.captureBtnInner} />
            </Pressable>
            <View style={styles.footerSpacer}>
              {!mainUri && (
                <Pressable
                  style={styles.flipBtnCorner}
                  onPress={onFlipCamera}
                  hitSlop={12}
                >
                  <Feather name="refresh-cw" size={24} color={Colors.grey700} />
                </Pressable>
              )}
            </View>
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

export default function RecordScreen() {
  if (!CameraView || !useCameraPermissions) {
    return <RecordScreenCameraUnavailable />;
  }
  return <RecordScreenContent />;
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
  boxesWrap: {
    flex: 1,
    gap: 0,
    alignItems: 'center',
    minHeight: 400,
    marginTop: 35,
  },
  boxTop: {
    width: 347,
    height: 319,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 0.75,
    borderColor: Colors.grey550,
    borderBottomWidth: 0,
    backgroundColor: Colors.grey150,
    overflow: 'hidden',
    position: 'relative',
  },
  boxBottom: {
    width: 347,
    height: 319,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 0.75,
    borderColor: Colors.grey550,
    borderTopWidth: 0,
    backgroundColor: '#CECBC6',
    overflow: 'hidden',
    position: 'relative',
  },
  aspectHintWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraStatusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 6,
  },
  cameraStatusText: {
    ...typography.body3_16_regular,
    color: Colors.primary50,
    fontSize: 12,
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
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
    justifyContent: 'space-between',
    paddingVertical: 24,
    minHeight: 72,
  },
  footerSpacer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
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
  flipBtnCorner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.grey200,
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
