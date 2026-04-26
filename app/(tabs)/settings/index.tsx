import SettingsBackIcon from "@/assets/images/back_button.svg";
import { useAuth } from "@/context/authContext";
import axiosInstance from "@/lib/axiosInstance";
import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const MENU_ITEMS = [
  { label: "개인정보 수정", action: "edit_profile" as const },
  { label: "보관된 여행 및 일기 관리", route: "/(tabs)/settings/archive" },
  { label: "알림 설정", route: "/(tabs)/settings/notification" },
  { label: "로그아웃", action: "logout" as const },
  { label: "회원탈퇴", route: "/(tabs)/settings/withdraw" },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleMenuPress = async (item: (typeof MENU_ITEMS)[number]) => {
    if (item.action === "edit_profile") {
      router.push({
        pathname: "/onboarding/profile-setup",
        params: { mode: "edit" },
      });
      return;
    }

    if (item.action === "logout") {
      Alert.alert("로그아웃", "로그아웃하시겠습니까?", [
        { text: "취소", style: "cancel" },
        {
          text: "로그아웃",
          style: "destructive",
          onPress: async () => {
            try {
              await axiosInstance.patch("/api/auth/logout");
              console.log("[LOGOUT] 서버 로그아웃 성공");
            } catch (e) {
              console.log("[LOGOUT] 서버 로그아웃 실패", e);
            } finally {
              await logout();
              router.replace("/onboarding");
            }
          },
        },
      ]);
      return;
    }

    if ("route" in item && item.route) {
      router.push(item.route as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={12}
          >
            <SettingsBackIcon width={28} height={28} />
          </Pressable>

          <Text style={styles.headerTitle}>설정</Text>
        </View>

        <View style={styles.listSection}>
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.label}
              style={styles.menuRow}
              onPress={() => handleMenuPress(item)}
            >
              <View style={styles.textWrapper}>
                <Text style={styles.menuText}>{item.label}</Text>
              </View>
              <View style={styles.divider} />
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary50,
  },

  inner: {
    flex: 1,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 14,
    paddingBottom: 34,
  },

  backButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "flex-start",
    marginRight: 6,
  },

  headerTitle: {
    ...typography.head4_22_regular,
    color: "#161616",
    fontSize: 26,
  },

  listSection: {
    paddingHorizontal: 0,
  },

  menuRow: {
    paddingTop: 20,
    paddingBottom: 10,
  },

  textWrapper: {
    paddingHorizontal: 8,
  },

  menuText: {
    ...typography.body2_18_regular,
    color: "#535353",
    fontSize: 24,
    marginBottom: 22,
  },

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#D9D1C3",
  },
});