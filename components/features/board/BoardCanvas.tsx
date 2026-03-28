import type {
  BoardStickerResponse,
  BoardThemeId,
} from "@/types/board";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";

import BoardView1 from "@/assets/images/chalkboard.svg";
import BoardView2 from "@/assets/images/chalkboard2.svg";
import BoardView3 from "@/assets/images/chalkboard3.svg";
import BoardView4 from "@/assets/images/chalkboard4.svg";

import BoardStickerItem from "./BoardStickerItem";

type Props = {
  title: string;
  boardThemeId: BoardThemeId;
  stickers: BoardStickerResponse[];
  editable?: boolean;
  selectedBoardStickerId?: number | null;
  onPressSticker?: (boardStickerId: number) => void;
  onDeleteSticker?: (boardStickerId: number) => void | Promise<void>;
  showMenuButton?: boolean;
  onPressMenu?: () => void;
};

const BOARD_VIEW_MAP: Record<
  BoardThemeId,
  React.ComponentType<{ width?: number | string; height?: number | string }>
> = {
  1: BoardView1,
  2: BoardView2,
  3: BoardView3,
  4: BoardView4,
};

export default function BoardCanvas({
  title,
  boardThemeId,
  stickers,
  editable = false,
  selectedBoardStickerId = null,
  onPressSticker,
  onDeleteSticker,
  showMenuButton = false,
  onPressMenu,
}: Props) {
  const BoardSvg = BOARD_VIEW_MAP[boardThemeId];
  const titleColor = Colors.primary900;

  return (
    <View style={styles.wrapper}>
      <View style={styles.titleRow}>
        <Text
          style={[styles.boardTitle, { color: titleColor }]}
          numberOfLines={1}
          pointerEvents="none"
        >
          {title}
        </Text>

        {showMenuButton ? (
          <Pressable
            style={styles.menuButton}
            onPress={() => {
              console.log("BoardCanvas kebab pressed");
              onPressMenu?.();
            }}
            hitSlop={12}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={18}
              color={titleColor}
              pointerEvents="none"
            />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.canvas}>
        <BoardSvg width="100%" height="100%" />

        <View style={styles.stickerLayer} pointerEvents="box-none">
          {stickers.map((sticker) => (
            <BoardStickerItem
              key={sticker.boardStickerId}
              sticker={sticker}
              editable={editable}
              selected={selectedBoardStickerId === sticker.boardStickerId}
              onPress={() => onPressSticker?.(sticker.boardStickerId)}
              onDelete={() => onDeleteSticker?.(sticker.boardStickerId)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: "center",
    paddingTop: 32,
  },

  titleRow: {
    width: 353,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 0,
    zIndex: 10,
    elevation: 10,
  },

  boardTitle: {
    ...typography.body4_14_regular,
    fontSize: 24,
    textAlign: "center",
    maxWidth: 260,
    paddingHorizontal: 28,
  },

  menuButton: {
    position: "absolute",
    right: 0,
    top: "50%",
    marginTop: -16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    elevation: 20,
  },

  canvas: {
    width: 353,
    aspectRatio: 0.55,
    position: "relative",
    marginTop: -25,
    zIndex: 0,
    elevation: 0,
  },

  stickerLayer: {
    ...StyleSheet.absoluteFillObject,
  },
});