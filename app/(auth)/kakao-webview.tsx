import { useAuth } from "@/context/authContext";
import axiosInstance from "@/lib/axiosInstance";
import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

export default function KakaoWebView() {
  const router = useRouter();
  const { checkAuth } = useAuth();

  const REST_API_KEY = process.env.EXPO_PUBLIC_REST_API_KEY;
  const REDIRECT_URI = process.env.EXPO_PUBLIC_REDIRECT_URI;

  const webviewRef = useRef<WebView>(null);

  const inflightRef = useRef(false);
  const lastCodeRef = useRef<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [fatalError, setFatalError] = useState<string | null>(null);

  const authUrl = useMemo(() => {
    if (!REST_API_KEY || !REDIRECT_URI) return null;

    return (
      `https://kauth.kakao.com/oauth/authorize` +
      `?client_id=${encodeURIComponent(REST_API_KEY)}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=code`
    );
  }, [REST_API_KEY, REDIRECT_URI]);

  const routeAfterLogin = async () => {
    try {
      const res = await axiosInstance.get("/api/users/me");
      console.log("로그인 후 /me 성공:", res.data);

      router.replace("/(tabs)");
    } catch (e: any) {
      console.error("로그인 후 /me 실패:", e?.response?.data);

      const message = e?.response?.data?.message ?? "";

      if (message.includes("회원 정보 입력을 완료해주세요")) {
        router.replace("/onboarding/profile-setup");
        return;
      }

      setFatalError(
        e?.response?.data?.message ??
          e?.response?.data?.data?.message ??
          e?.message ??
          "로그인 후 사용자 정보 확인 중 오류가 발생했습니다."
      );
    }
  };

  const handleCodeOnce = async (code: string) => {
    if (inflightRef.current) return;
    if (lastCodeRef.current === code) return;

    inflightRef.current = true;
    lastCodeRef.current = code;
    setSubmitting(true);

    try {
      console.log("[KAKAO] sending code:", code);

      const res = await axiosInstance.get("/api/auth/login/kakao", {
        params: { code },
      });

      console.log("[KAKAO] backend response:", res?.data);

      const tokenRaw =
        res.data?.data?.accessToken ??
        res.data?.data?.jwtAccessToken ??
        res.data?.accessToken ??
        res.data?.jwtAccessToken;

      const refreshTokenRaw =
        res.data?.data?.refreshToken ??
        res.data?.refreshToken;

      if (!tokenRaw) {
        setFatalError("서버 응답에 accessToken이 없음 (응답 스키마 확인 필요)");
        return;
      }

      const token = String(tokenRaw).replace(/^Bearer\s+/i, "");
      console.log("[KAKAO] final access token:", token);

      await SecureStore.setItemAsync("access_token", token);

      if (refreshTokenRaw) {
        await SecureStore.setItemAsync("refresh_token", String(refreshTokenRaw));
        console.log("[KAKAO] refresh token saved");
      } else {
        console.log("[KAKAO] refresh token 없음");
      }

      await checkAuth();
      await routeAfterLogin();
    } catch (e: any) {
      console.log("[AUTH] FAIL:", {
        status: e?.response?.status,
        data: e?.response?.data,
        message: e?.message,
        url: e?.config?.url,
        method: e?.config?.method,
      });

      setFatalError(
        e?.response?.data?.message ??
          e?.response?.data?.data?.message ??
          e?.message ??
          "카카오 로그인 처리 중 오류"
      );
    } finally {
      setSubmitting(false);
      inflightRef.current = false;
    }
  };

  const resetAndReload = async () => {
    inflightRef.current = false;
    lastCodeRef.current = null;
    setFatalError(null);
    setSubmitting(false);

    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");

    webviewRef.current?.stopLoading?.();
    webviewRef.current?.reload();
  };

  if (!authUrl) {
    return (
      <View style={styles.centerScreen}>
        <Text style={styles.errorTitle}>환경변수 확인 필요</Text>
        <Text style={styles.errorDesc}>
          REST_API_KEY / REDIRECT_URI가 비어 있음
        </Text>
      </View>
    );
  }

  if (fatalError) {
    return (
      <View style={styles.centerScreen}>
        <Text style={styles.errorTitle}>카카오 로그인 실패</Text>
        <Text style={styles.errorDesc}>{fatalError}</Text>

        <Pressable onPress={resetAndReload} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>다시 로그인하기</Text>
        </Pressable>
      </View>
    );
  }

  if (submitting) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={Colors.primary900} />
        <Text style={styles.loadingTitle}>로그인 처리 중</Text>
        <Text style={styles.loadingDesc}>
          사용자 정보를 확인하고 있습니다.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        source={{ uri: authUrl }}
        originWhitelist={["*"]}
        cacheEnabled={false}
        javaScriptEnabled
        startInLoadingState
        onShouldStartLoadWithRequest={(req) => {
          const url = req.url;

          if (REDIRECT_URI && url.startsWith(REDIRECT_URI)) {
            console.log("[KAKAO REDIRECT URL]", url);

            webviewRef.current?.stopLoading?.();

            try {
              const current = new URL(url);
              const code = current.searchParams.get("code");
              console.log("[KAKAO] parsed code:", code);

              if (code) {
                handleCodeOnce(code);
              } else {
                setFatalError("redirect URL에 code가 없음");
              }
            } catch {
              setFatalError("redirect URL 파싱 실패");
            }

            return false;
          }

          return true;
        }}
        onHttpError={(e) => console.log("[WEBVIEW] http error", e.nativeEvent)}
        onError={(e) => console.log("[WEBVIEW] error", e.nativeEvent)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary50,
  },

  centerScreen: {
    flex: 1,
    backgroundColor: Colors.primary50,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: Colors.primary50,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  loadingTitle: {
    ...typography.head3_24_regular,
    color: Colors.primary950,
    marginTop: 18,
    textAlign: "center",
  },

  loadingDesc: {
    ...typography.body4_14_regular,
    color: Colors.grey700,
    marginTop: 8,
    textAlign: "center",
  },

  errorTitle: {
    ...typography.head3_24_regular,
    color: Colors.primary950,
    marginBottom: 10,
    textAlign: "center",
  },

  errorDesc: {
    ...typography.body4_14_regular,
    color: Colors.grey700,
    textAlign: "center",
    lineHeight: 22,
  },

  retryButton: {
    marginTop: 20,
    minWidth: 160,
    height: 48,
    borderRadius: 999,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary900,
  },

  retryButtonText: {
    ...typography.body2_18_regular,
    color: Colors.primary50,
  },
});