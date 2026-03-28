import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";
import type { BoardThemeId } from "@/types/board";
import React, { useEffect, useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import BoardThemeSelector from "./BoardThemeSelector";

type Props = {
  visible: boolean;
  isCreating?: boolean;
  onClose: () => void;
  onSave: (title: string, boardThemeId: BoardThemeId) => Promise<void> | void;
};

export default function AddBoardModal({
  visible,
  isCreating = false,
  onClose,
  onSave,
}: Props) {
  const [title, setTitle] = useState("");
  const [selectedThemeId, setSelectedThemeId] = useState<BoardThemeId | null>(null);

  useEffect(() => {
    if (visible) {
      setTitle("");
      setSelectedThemeId(null);
    }
  }, [visible]);

  const disabled = !title.trim() || selectedThemeId === null || isCreating;

  const handlePressSave = async () => {
    if (disabled || selectedThemeId === null) return;
    await onSave(title.trim(), selectedThemeId);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>

          <Text style={styles.modalTitle}>새로운 보드 추가</Text>
          <View style={styles.titleDivider} />

          <View style={styles.section}>
            <Text style={styles.label}>보드명</Text>

            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="보드 이름을 작성해주세요."
              placeholderTextColor={Colors.grey400}
              style={styles.input}
              maxLength={16}
            />

            <Text style={styles.counter}>{title.length}/16</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>보드 테마</Text>

            <BoardThemeSelector
              selectedThemeId={selectedThemeId}
              onSelect={setSelectedThemeId}
            />
          </View>

          <Pressable
            style={[styles.saveButton, disabled && styles.saveButtonDisabled]}
            onPress={handlePressSave}
            disabled={disabled}
          >
            <Text
              style={[
                styles.saveButtonText,
                disabled && styles.saveButtonTextDisabled,
              ]}
            >
              저장
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(22, 22, 22, 0.42)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  modal: {
    width: "100%",
    maxWidth: 296,
    borderRadius: 24,
    backgroundColor: Colors.primary50,
    paddingHorizontal: 18,
    paddingTop: 25,
    paddingBottom: 15,
  },
  closeButton: {
    position: "absolute",
    top: 18,
    right: 18,
    zIndex: 10,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    ...typography.head6_18_regular,
    color: Colors.primary400,
  },
  modalTitle: {
    ...typography.head6_18_regular,
    fontSize: 24,
    color: Colors.primary950,
    textAlign: "center",
    paddingTop: 30,
  },
  titleDivider: {
    height: 1,
    backgroundColor: Colors.primary300,
    marginTop: 14,
    marginBottom: 18,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    ...typography.body4_14_regular,
    fontSize:22,
    color: Colors.primary900,
    marginBottom: 8,
  },
  input: {
    ...typography.body4_14_regular,
    fontSize:20,
    color: Colors.primary950,
    height: 36,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary300,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 4,
  },
  counter: {
    ...typography.sub2_12_regular,
    fontSize:14,
    color: Colors.grey400,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  saveButton: {
    marginTop: 4,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary900,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  saveButtonText: {
    ...typography.body4_14_regular,
    fontSize:20,
    color: Colors.primary50,
  },
  saveButtonTextDisabled: {
    color: Colors.grey300,
  },
});