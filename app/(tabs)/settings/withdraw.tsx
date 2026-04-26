import SettingsBackIcon from "@/assets/images/back_button.svg";
import { useAuth } from "@/context/authContext";
import axiosInstance from "@/lib/axiosInstance";
import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";
import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function WithdrawScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  const [isModalVisible, setIsModalVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsModalVisible(true);
      return () => {};
    }, [])
  );

  const handleWithdraw = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const token = await SecureStore.getItemAsync("access_token");
      console.log("[WITHDRAW TOKEN]", token);

      const res = await axiosInstance.delete("/api/users/me");
      console.log("[WITHDRAW SUCCESS]", res.data);

      await logout();

      router.replace("/onboarding");
    } catch (e: any) {
      console.log("[WITHDRAW] 회원탈퇴 실패");
      console.log("[WITHDRAW] 응답 상태:", e?.response?.status);
      console.log("[WITHDRAW] 응답 데이터:", e?.response?.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    router.back();
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
      </View>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
        presentationStyle="overFullScreen"
      >
        <View style={styles.modalDim}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>회원 탈퇴</Text>

            <Text style={styles.modalDesc}>
              정말 회원을 탈퇴하시겠습니까?{"\n"}
              지금까지의 여행 기록이 모두 사라집니다.
            </Text>

            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.modalButton, styles.withdrawButton]}
                onPress={handleWithdraw}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={Colors.primary900} />
                ) : (
                  <Text style={styles.withdrawButtonText}>탈퇴</Text>
                )}
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancel}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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

  modalDim: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  modalBox: {
    backgroundColor: "#FFFFFF",
    paddingTop: 34,
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: "center",
    width: 296,
    minHeight: 195,
    borderRadius: 24,
  },

  modalTitle: {
    ...typography.head4_22_regular,
    color: Colors.primary950,
    fontSize: 24,
    marginBottom: 20,
  },

  modalDesc: {
    ...typography.body2_18_regular,
    color: Colors.primary900,
    fontSize: 18,
    lineHeight: 26,
    textAlign: "center",
    marginBottom: 20,
  },

  buttonRow: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
  },

  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  withdrawButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#B8AA96",
  },

  cancelButton: {
    backgroundColor: Colors.primary900,
  },

  withdrawButtonText: {
    ...typography.body2_18_regular,
    color: "#8A7B66",
    fontSize: 18,
  },

  cancelButtonText: {
    ...typography.body2_18_regular,
    color: Colors.primary50,
    fontSize: 18,
  },
});