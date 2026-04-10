import FrameSvg from "@/assets/images/frame.svg";
import LogoSvg from "@/assets/images/Me-mory.svg";
import SloganSvg from "@/assets/images/slogan.svg";
import axiosInstance from "@/lib/axiosInstance";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useMemo } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";

const FRAME_W = 195;
const FRAME_H = 138;

export default function SplashScreen() {
  const router = useRouter();
  const { height } = useWindowDimensions();

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = await SecureStore.getItemAsync("access_token");

        console.log("[SPLASH] token:", token);

        if (!token) {
          router.replace("/(auth)/onboarding");
          return;
        }

        await axiosInstance.get("/api/users/me");

        router.replace("/(tabs)");
      } catch (e: any) {
        console.log("[SPLASH ERROR]", e?.response?.status);

        if (e?.response?.status === 401) {
          await SecureStore.deleteItemAsync("access_token");
          await SecureStore.deleteItemAsync("refresh_token");

          router.replace("/(auth)/onboarding");
          return;
        }

        const message = e?.response?.data?.message ?? "";
        if (message.includes("회원 정보 입력")) {
          router.replace("/onboarding/profile-setup");
          return;
        }

        router.replace("/(auth)/onboarding");
      }
    };

    bootstrap();
  }, [router]);

  const { logoW, logoH, sloganW, sloganH } = useMemo(() => {
    const logoW = Math.round(FRAME_W * 0.5);
    const logoH = Math.round(logoW * 0.35);

    const sloganW = Math.round(FRAME_W * 0.6);
    const sloganH = Math.round(sloganW * 0.22);

    return { logoW, logoH, sloganW, sloganH };
  }, []);

  const TOP = Math.round(height * 0.34);

  const SLOGAN_GAP = 20;
  const logoTop = Math.round((FRAME_H - logoH) / 2);
  const sloganTop = FRAME_H + SLOGAN_GAP;

  return (
    <View style={styles.container}>
      <View style={[styles.anchor, { top: TOP }]}>
        <View style={styles.frameBox}>
          <FrameSvg width={FRAME_W} height={FRAME_H} />

          <View
            style={[
              styles.abs,
              {
                top: logoTop,
                left: "50%",
                width: logoW,
                height: logoH,
                transform: [{ translateX: -logoW / 2 }],
              },
            ]}
          >
            <LogoSvg width={logoW} height={logoH} />
          </View>

          <View
            style={[
              styles.abs,
              {
                top: sloganTop,
                left: "50%",
                width: sloganW,
                height: sloganH,
                transform: [{ translateX: -sloganW / 2 }],
              },
            ]}
          >
            <SloganSvg width={sloganW} height={sloganH} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F1E8",
  },
  anchor: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -FRAME_W / 2 }],
  },
  frameBox: {
    width: FRAME_W,
    height: FRAME_H + 60,
    position: "relative",
  },
  abs: {
    position: "absolute",
  },
});