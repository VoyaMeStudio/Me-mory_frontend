import SettingsBackIcon from "@/assets/images/back_button.svg";
import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";
import { useRouter } from "expo-router";
import React from "react";
import {
    Linking,
    Pressable,
    StyleSheet,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationScreen() {
  const router = useRouter();

  const openAppSettings = () => {
    Linking.openSettings();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.push("/(tabs)/settings")}
            style={styles.backButton}
            hitSlop={12}
          >
            <SettingsBackIcon width={28} height={28} />
          </Pressable>

          <Text style={styles.headerTitle}>알림 설정</Text>
        </View>

        <View style={styles.listSection}>
          <Pressable style={styles.menuRow} onPress={openAppSettings}>
            <Text style={styles.menuText}>알림 권한</Text>
            <View style={styles.divider} />
          </Pressable>

          <Pressable style={styles.menuRow} onPress={openAppSettings}>
            <Text style={styles.menuText}>위치 권한 설정</Text>
            <View style={styles.divider} />
          </Pressable>
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
  paddingTop: 14, 
},

  header: {
    flexDirection: "row",
    alignItems: "center",
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
    paddingHorizontal: 8,
  },

  menuRow: {
    paddingTop: 20,
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