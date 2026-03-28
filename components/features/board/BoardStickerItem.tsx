import type { BoardStickerResponse } from "@/types/board";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  sticker: BoardStickerResponse;
  editable?: boolean;
  selected?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
};

export default function BoardStickerItem({
  sticker,
  editable = false,
  selected = false,
  onPress,
  onDelete,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.wrapper,
        {
          left: sticker.posX,
          top: sticker.posY,
          transform: [{ rotate: `${sticker.rotation}deg` }],
        },
        selected && styles.selectedWrapper,
      ]}
    >
      <Image source={{ uri: sticker.imageUrl }} style={styles.image} />

      {editable && selected ? (
        <>
          <Pressable style={styles.deleteButton} onPress={onDelete}>
            <Text style={styles.deleteText}>×</Text>
          </Pressable>
          <View style={styles.resizeButton}>
            <Text style={styles.resizeText}>↘</Text>
          </View>
        </>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    width: 64,
    height: 64,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedWrapper: {
    borderColor: "#FFFFFF",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  deleteButton: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(49,49,49,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 18,
  },
  resizeButton: {
    position: "absolute",
    bottom: -10,
    right: -10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  resizeText: {
    color: "#666",
    fontSize: 12,
  },
});