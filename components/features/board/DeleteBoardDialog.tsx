import { typography } from "@/styles/typography";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteBoardDialog({
  visible,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <Text style={styles.title}>해당 보드를 삭제하시겠습니까?</Text>
          <Text style={styles.desc}>삭제된 보드는 다시 복구할 수 없습니다.</Text>

          <View style={styles.buttonRow}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>취소</Text>
            </Pressable>
            <Pressable style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.confirmText}>확인</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.32)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  dialog: {
    width: 296,
    height: 160,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 18,
  },
  title: {
    ...typography.head4_22_regular,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "400",
    color: "#3E372D",
  },
  desc: {
    ...typography.sub1_14_medium,
    marginTop: 10,
    textAlign: "center",
    fontSize: 18,
    color: "#6B6252",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#D9D2C8",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    ...typography.sub1_14_medium,
    fontSize: 20,
    color: "#988D7A",
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#5F5848",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    ...typography.sub1_14_medium,
    fontSize: 20,
    color: "#F9F8F4",
    fontWeight: "600",
  },
});