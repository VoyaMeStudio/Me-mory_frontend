import { useAuth } from "@/context/authContext";
import axiosInstance from "@/lib/axiosInstance";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
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

      const registered = res.data?.data?.registered ?? res.data?.registered;

      if (!tokenRaw) {
        setFatalError("서버 응답에 accessToken이 없음 (응답 스키마 확인 필요)");
        return;
      }

      const token = String(tokenRaw).replace(/^Bearer\s+/i, "");
      await SecureStore.setItemAsync("access_token", token);
      await checkAuth();

      if (registered) router.replace("/home");
      else router.replace("/onboarding/profile-setup");
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

  const resetAndReload = () => {
    inflightRef.current = false;
    lastCodeRef.current = null;
    setFatalError(null);
    setSubmitting(false);

    webviewRef.current?.stopLoading?.();
    webviewRef.current?.reload();
  };

  if (!authUrl) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>환경변수(REST_API_KEY / REDIRECT_URI) 확인 필요</Text>
        <Text style={{ marginTop: 8 }}>REST_API_KEY / REDIRECT_URI가 비어있음</Text>
      </View>
    );
  }

  if (fatalError) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
          gap: 12,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600" }}>카카오 로그인 실패</Text>
        <Text style={{ textAlign: "center" }}>{fatalError}</Text>

        <Pressable
          onPress={resetAndReload}
          style={{
            marginTop: 12,
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 10,
            borderWidth: 1,
          }}
        >
          <Text>다시 로그인하기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webviewRef}
        source={{ uri: authUrl }}
        originWhitelist={["*"]}
        cacheEnabled={false}
        javaScriptEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator />
          </View>
        )}
        onShouldStartLoadWithRequest={(req) => {
          const url = req.url;

          if (REDIRECT_URI && url.startsWith(REDIRECT_URI)) {
            console.log("[KAKAO REDIRECT URL]", url);

            webviewRef.current?.stopLoading?.();

            try {
              const current = new URL(url);
              const code = current.searchParams.get("code");
              console.log("[KAKAO] parsed code:", code);

              if (code) handleCodeOnce(code);
              else setFatalError("redirect URL에 code가 없음");
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

      {submitting && (
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.5)",
          }}
        >
          <ActivityIndicator />
          <Text style={{ marginTop: 10 }}>로그인 처리 중</Text>
        </View>
      )}
    </View>
  );
}