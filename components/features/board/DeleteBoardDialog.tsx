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
    width: "100%",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 18,
  },
  title: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    color: "#5B5348",
  },
  desc: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 13,
    color: "#9B9488",
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
    fontSize: 14,
    color: "#7F776B",
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
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});