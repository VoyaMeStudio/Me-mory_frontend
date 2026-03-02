import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ConfirmDialog({
  visible,
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  danger,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Pressable style={styles.close} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>

          <Text style={styles.title}>{title}</Text>
          {!!description && <Text style={styles.desc}>{description}</Text>}

          <View style={styles.row}>
            <Pressable style={[styles.btn, styles.btnGhost]} onPress={onClose}>
              <Text style={styles.btnGhostText}>{cancelText}</Text>
            </Pressable>

            <Pressable
              style={[
                styles.btn,
                danger ? styles.btnDanger : styles.btnPrimary,
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.btnPrimaryText}>{confirmText}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    borderRadius: 20,
    backgroundColor: "#fff",
    padding: 18,
  },
  close: {
    position: "absolute",
    right: 10,
    top: 6,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  closeText: {
    fontSize: 24,
    color: Colors?.grey600 ?? "#777166",
  },
  title: {
    ...typography.head6_18_regular,
    color: Colors?.grey900 ?? "#2E2A24",
    textAlign: "center",
    marginTop: 10,
  },
  desc: {
    ...typography.body4_14_regular,
    color: Colors?.grey600 ?? "#777166",
    textAlign: "center",
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  btn: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  btnGhost: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors?.grey200 ?? "#E7E1D7",
  },
  btnGhostText: {
    ...typography.sub1_14_medium,
    color: Colors?.grey700 ?? "#6B665B",
  },
  btnPrimary: {
    backgroundColor: Colors?.grey900 ?? "#2E2A24",
  },
  btnDanger: {
    backgroundColor: "#B00020",
  },
  btnPrimaryText: {
    ...typography.sub1_14_medium,
    color: "#fff",
  },
});