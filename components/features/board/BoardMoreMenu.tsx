import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import BlockIcon from "@/assets/images/block_icon.svg";
import ReportIcon from "@/assets/images/report_icon.svg";

type Props = {
  visible: boolean;
  onPressEdit: () => void;
  onPressDelete: () => void;
  onRequestClose: () => void;
};

export default function BoardMoreMenu({
  visible,
  onPressEdit,
  onPressDelete,
  onRequestClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onRequestClose} />

        <View style={styles.container}>
          <Pressable style={styles.item} onPress={onPressEdit}>
            <Text style={styles.text}>수정하기</Text>
            <ReportIcon width={22} height={22} />
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.item} onPress={onPressDelete}>
            <Text style={styles.text}>삭제하기</Text>
            <BlockIcon width={22} height={22} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  container: {
    position: "absolute",
    top: 150,
    right: 20,
    width: 150, 
    backgroundColor: "#FFFFFF",
    borderRadius: 18,

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,

    overflow: "hidden",
  },

  item: {
    height: 50,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  text: {
    color: "#1A1A1A",
    fontFamily: "Nanum NeuRisNeuRisCe",
    fontSize: 16, 
    fontWeight: "400",
    lineHeight: 16,
    letterSpacing: -0.16,
  },

  divider: {
    height: 1,
    backgroundColor: "#E8E3DB",
  },
});