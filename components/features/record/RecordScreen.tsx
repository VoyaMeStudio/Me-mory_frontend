import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  getRecordReviewSession,
  setRecordReviewSession,
} from '@/lib/recordReviewSession';
import {
  persistRepresentativeSlot,
  type RepresentativeSlot,
} from '@/lib/recordRepresentativeStorage';
import { Colors } from '@/styles/colors';
import { typography } from '@/styles/typography';

const RECORD_BG = require('@/assets/images/record_bg.jpg');

function RecordScreenRoot({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1 }}>
      <Image
        source={RECORD_BG}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />
      {children}
    </View>
  );
}

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

function readReviewHydration() {
  const s = getRecordReviewSession();
  if (s?.mainUri && s?.selfieUri) {
    return {
      step: 'review' as Step,
      mainUri: s.mainUri,
      selfieUri: s.selfieUri,
      topFacing: s.topFacing,
      representativeSlot: s.representativeSlot,
    };
  }
  return {
    step: 'capture' as Step,
    mainUri: null as string | null,
    selfieUri: null as string | null,
    topFacing: 'back' as CameraFacing,
    representativeSlot: 'top' as RepresentativeSlot,
  };
}

const COUNTDOWN_SECONDS = 15;

/** Top / bottom preview panes (design spec). */
const RECORD_BOX_WIDTH = 347;
const RECORD_BOX_HEIGHT = 319;
const RECORD_BORDER_WIDTH = 0.75;
const RECORD_BORDER_COLOR = Colors.grey550; // #A7A4A0
const RECORD_TOP_BG_FALLBACK = '#D3D3D3'; // CSS lightgray; shown under `cover` image
const RECORD_BOTTOM_BG = '#CECBC6'; // grey-200 in spec

/** Shutter control — matches design tokens (primary-100 / -400 / -500). */
const CAPTURE_OUTER_SIZE = 50;
const CAPTURE_INNER_SIZE = 40;
const CAPTURE_OUTER_FILL = Colors.primary100; // #F4F0EA
const CAPTURE_OUTER_STROKE = '#625B4F'; // primary-500
const CAPTURE_INNER_FILL = '#877E6E'; // primary-400

/** Vertical gap from bottom preview pane to controls (design: 21px to flip top). */
const RECORD_CAPTURE_TOP_GAP = 21;

const FLIP_BTN_SIZE = 37;
/** Inset from the right edge of the padded content area to the flip control. */
const FLIP_INSET_RIGHT = 6;

/**
 * Optional texture for the top pane (`background: url(...) lightgray 50% / cover`).
 * Set to `require('@/assets/images/your-texture.png')` when the asset exists.
 */
const RECORD_TOP_BG_IMAGE: number | null = null;

function RecordScreenCameraUnavailable() {
  const router = useRouter();
  return (
    <RecordScreenRoot>
      <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              setRecordReviewSession(null);
              router.back();
            }}
            style={styles.backBtn}
            hitSlop={12}
          >
            <Feather name="chevron-left" size={24} color={Colors.primary800} />
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
    </RecordScreenRoot>
  );
}

const PERMISSION_CHECK_TIMEOUT_MS = 3000;

const CONTAINER_H_PADDING = 20;

function RecordScreenContent() {
  const router = useRouter();
  const topCameraRef = useRef<any>(null);
  const bottomCameraRef = useRef<any>(null);

  const [permission, requestPermission] = useCameraPermissions!();
  const [permissionCheckTimedOut, setPermissionCheckTimedOut] = useState(false);
  const initial = useMemo(() => readReviewHydration(), []);
  const [step, setStep] = useState<Step>(initial.step);
  const [topFacing, setTopFacing] = useState<CameraFacing>(initial.topFacing);
  const [mainUri, setMainUri] = useState<string | null>(initial.mainUri);
  const [selfieUri, setSelfieUri] = useState<string | null>(initial.selfieUri);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [topCameraReady, setTopCameraReady] = useState(false);
  const [bottomCameraReady, setBottomCameraReady] = useState(false);
  /** Which image is marked 대표 in review (`top` = landscape/main shot, `bottom` = selfie). */
  const [representativeSlot, setRepresentativeSlot] = useState<RepresentativeSlot>(
    initial.representativeSlot
  );

  useFocusEffect(
    useCallback(() => {
      const s = getRecordReviewSession();
      if (s?.mainUri && s?.selfieUri) {
        setStep('review');
        setMainUri(s.mainUri);
        setSelfieUri(s.selfieUri);
        setTopFacing(s.topFacing);
        setRepresentativeSlot(s.representativeSlot);
      }
    }, [])
  );

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
      setRepresentativeSlot('top');
      void persistRepresentativeSlot('top');
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
          setRepresentativeSlot('top');
          void persistRepresentativeSlot('top');
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

  const onSelectRepresentative = useCallback((slot: RepresentativeSlot) => {
    setRepresentativeSlot(slot);
    void persistRepresentativeSlot(slot);
  }, []);

  const onFlipCamera = useCallback(() => {
    setTopFacing((f) => (f === 'back' ? 'front' : 'back'));
  }, []);

  const onRetake = useCallback(() => {
    clearCountdown();
    setRecordReviewSession(null);
    setMainUri(null);
    setSelfieUri(null);
    setStep('capture');
  }, [clearCountdown]);

  const onNext = useCallback(() => {
    if (mainUri && selfieUri) {
      setRecordReviewSession({
        mainUri,
        selfieUri,
        topFacing,
        representativeSlot,
      });
    }
    router.push('/record/destination');
  }, [router, mainUri, selfieUri, topFacing, representativeSlot]);

  const onHeaderBack = useCallback(() => {
    setRecordReviewSession(null);
    router.back();
  }, [router]);

  if (!permission) {
    if (permissionCheckTimedOut) {
      return (
        <RecordScreenRoot>
          <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Pressable onPress={onHeaderBack} style={styles.backBtn} hitSlop={12}>
                <Feather name="chevron-left" size={24} color={Colors.primary800} />
              </Pressable>
              <Text style={styles.title}>기록하기</Text>
              <View style={styles.headerRight} />
            </View>
            <View style={styles.centerMessage}>
              <Text style={styles.messageText}>
                카메라 권한을 확인할 수 없습니다.{'\n'}
                뒤로 가서 개발 빌드에서 다시 시도해 주세요.
              </Text>
              <Pressable style={styles.permissionBtn} onPress={onHeaderBack}>
                <Text style={styles.permissionBtnText}>뒤로 가기</Text>
              </Pressable>
            </View>
          </View>
          </SafeAreaView>
        </RecordScreenRoot>
      );
    }
    return (
      <RecordScreenRoot>
        <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable onPress={onHeaderBack} style={styles.backBtn} hitSlop={12}>
              <Feather name="chevron-left" size={24} color={Colors.primary800} />
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
      </RecordScreenRoot>
    );
  }

  if (!permission.granted) {
    return (
      <RecordScreenRoot>
        <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable onPress={onHeaderBack} style={styles.backBtn} hitSlop={12}>
              <Feather name="chevron-left" size={24} color={Colors.primary800} />
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
      </RecordScreenRoot>
    );
  }

  return (
    <RecordScreenRoot>
      <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onHeaderBack} style={styles.backBtn} hitSlop={12}>
            <Feather name="chevron-left" size={24} color={Colors.primary800} />
          </Pressable>
          <Text style={styles.title}>기록하기</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.boxesWrap}>
          <View style={styles.boxesColumn}>
            <View style={styles.boxTop}>
              <View style={[StyleSheet.absoluteFill, { backgroundColor: RECORD_TOP_BG_FALLBACK }]} />
              {RECORD_TOP_BG_IMAGE != null && (
                <Image
                  source={RECORD_TOP_BG_IMAGE}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                />
              )}
              {step === 'capture' ? (
                showTopCamera ? (
                  <>
                    <CameraView
                      ref={topCameraRef}
                      style={StyleSheet.absoluteFill}
                      facing={topFacing}
                      onCameraReady={() => setTopCameraReady(true)}
                    />
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
                        <View style={styles.countdownTextWrap}>
                          <Text style={styles.countdownText}>{countdown}s</Text>
                        </View>
                      </View>
                    )}
                  </>
                )
              ) : (
                mainUri && (
                  <>
                    <Image
                      source={{ uri: mainUri }}
                      style={StyleSheet.absoluteFill}
                      contentFit="cover"
                    />
                    <View style={styles.representativeBadgeWrap} pointerEvents="box-none">
                      <Pressable
                        onPress={() => onSelectRepresentative('top')}
                        style={[
                          styles.representativeBtn,
                          representativeSlot === 'top'
                            ? styles.representativeBtnSelected
                            : styles.representativeBtnUnselected,
                        ]}
                      >
                        <Text
                          style={
                            representativeSlot === 'top'
                              ? styles.representativeBtnLabelSelected
                              : styles.representativeBtnLabelUnselected
                          }
                        >
                          대표
                        </Text>
                      </Pressable>
                    </View>
                  </>
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
                    <View style={styles.expandHintCircle}>
                      <Feather name="maximize-2" size={18} color={Colors.primary50} />
                    </View>
                  </View>
                )
              ) : (
                selfieUri && (
                  <>
                    <Image
                      source={{ uri: selfieUri }}
                      style={StyleSheet.absoluteFill}
                      contentFit="cover"
                    />
                    <View style={styles.representativeBadgeWrap} pointerEvents="box-none">
                      <Pressable
                        onPress={() => onSelectRepresentative('bottom')}
                        style={[
                          styles.representativeBtn,
                          representativeSlot === 'bottom'
                            ? styles.representativeBtnSelected
                            : styles.representativeBtnUnselected,
                        ]}
                      >
                        <Text
                          style={
                            representativeSlot === 'bottom'
                              ? styles.representativeBtnLabelSelected
                              : styles.representativeBtnLabelUnselected
                          }
                        >
                          대표
                        </Text>
                      </Pressable>
                    </View>
                  </>
                )
              )}
            </View>
          </View>
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
            {!mainUri && (
              <Pressable
                style={[
                  styles.flipBtnCorner,
                  styles.flipBtnCornerAbsolute,
                  {
                    right: FLIP_INSET_RIGHT,
                    top: '50%',
                    marginTop: -FLIP_BTN_SIZE / 2,
                  },
                ]}
                onPress={onFlipCamera}
                hitSlop={12}
              >
                <Feather name="refresh-cw" size={18} color={Colors.primary50} />
              </Pressable>
            )}
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
    </RecordScreenRoot>
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
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    paddingHorizontal: CONTAINER_H_PADDING,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 3,
    paddingTop: 10,
    paddingBottom: 11,
    paddingLeft: 12,
    paddingRight: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#CECBC6',
  },
  backBtn: {
    padding: 4,
  },
  title: {
    ...typography.head4_22_regular,
    color: Colors.primary900,
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
    alignItems: 'center',
    justifyContent: 'flex-end',
    minHeight: 400,
  },
  boxesColumn: {
    alignItems: 'center',
  },
  boxTop: {
    width: RECORD_BOX_WIDTH,
    height: RECORD_BOX_HEIGHT,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderTopWidth: RECORD_BORDER_WIDTH,
    borderLeftWidth: RECORD_BORDER_WIDTH,
    borderRightWidth: RECORD_BORDER_WIDTH,
    borderBottomWidth: 0,
    borderColor: RECORD_BORDER_COLOR,
    overflow: 'hidden',
    position: 'relative',
  },
  boxBottom: {
    width: RECORD_BOX_WIDTH,
    height: RECORD_BOX_HEIGHT,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderTopWidth: RECORD_BORDER_WIDTH,
    borderLeftWidth: RECORD_BORDER_WIDTH,
    borderRightWidth: RECORD_BORDER_WIDTH,
    borderBottomWidth: RECORD_BORDER_WIDTH,
    borderColor: RECORD_BORDER_COLOR,
    backgroundColor: RECORD_BOTTOM_BG,
    overflow: 'hidden',
    position: 'relative',
  },
  expandHintCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.grey700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  representativeBadgeWrap: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 6,
  },
  representativeBtn: {
    width: 56,
    height: 25,
    paddingBottom: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(63, 58, 50, 0.7)',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 2,
      },
      android: {
        elevation: 4,
        shadowColor: 'rgba(63, 58, 50, 0.7)',
      },
    }),
  },
  representativeBtnSelected: {
    borderWidth: 0,
    borderColor: '#877E6E',
    backgroundColor: '#625B4F',
  },
  representativeBtnUnselected: {
    borderWidth: 0.5,
    borderColor: '#CECBC6',
    backgroundColor: '#F1F1EF',
  },
  representativeBtnLabelSelected: {
    ...typography.body3_16_regular,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  representativeBtnLabelUnselected: {
    ...typography.body3_16_regular,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '600',
    color: Colors.primary600,
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
    zIndex: 4,
    elevation: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownTextWrap: {
    width: 90,
    height: 31,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    width: 90,
    fontFamily: 'Pretendard',
    fontSize: 32,
    /** Spec lists 18px; with fontSize 32 that clips. Use 31 to match `countdownTextWrap` height. */
    lineHeight: 31,
    fontWeight: '600',
    fontStyle: 'normal',
    letterSpacing: 0.32,
    color: '#FFF',
    textAlign: 'center',
    textTransform: 'capitalize',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 4,
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: RECORD_CAPTURE_TOP_GAP,
    paddingBottom: 32,
    minHeight: 72,
  },
  flipBtnCornerAbsolute: {
    position: 'absolute',
  },
  captureBtn: {
    width: CAPTURE_OUTER_SIZE,
    height: CAPTURE_OUTER_SIZE,
    borderRadius: CAPTURE_OUTER_SIZE / 2,
    borderWidth: 1,
    borderColor: CAPTURE_OUTER_STROKE,
    backgroundColor: CAPTURE_OUTER_FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipBtnCorner: {
    width: FLIP_BTN_SIZE,
    height: FLIP_BTN_SIZE,
    borderRadius: FLIP_BTN_SIZE / 2,
    backgroundColor: Colors.grey800,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  captureBtnInner: {
    width: CAPTURE_INNER_SIZE,
    height: CAPTURE_INNER_SIZE,
    borderRadius: CAPTURE_INNER_SIZE / 2,
    backgroundColor: CAPTURE_INNER_FILL,
  },
  captureBtnDisabled: {
    opacity: 0.6,
  },
  reviewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 12,
    paddingHorizontal: 4,
  },
  retakeBtn: {
    width: 160,
    height: 40,
    paddingTop: 6,
    paddingRight: 55,
    paddingBottom: 9,
    paddingLeft: 56,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#CECBC6',
    backgroundColor: '#F1F1EF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  retakeBtnText: {
    ...typography.body3_16_regular,
    color: Colors.primary800,
  },
  nextBtn: {
    width: 160,
    height: 39,
    paddingVertical: 7,
    paddingHorizontal: 0,
    borderRadius: 20,
    backgroundColor: '#625B4F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBtnText: {
    ...typography.body3_16_regular,
    color: Colors.primary50,
  },
});
