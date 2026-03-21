import { BOARD_VIEW_SVG_MAP } from "@/constants/boardAssets";
import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";
import type { BoardListItemResponse } from "@/types/board";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  board: BoardListItemResponse;
  onPress: () => void;
};

export default function BoardCard({ board, onPress }: Props) {
  const ThemeSvg = BOARD_VIEW_SVG_MAP[board.boardThemeId];

  const titleColor =
    board.boardThemeId === 1 ? Colors.primary50 : Colors.primary900;

  return (
    <Pressable style={styles.wrapper} onPress={onPress}>
      <View style={styles.card}>
        <ThemeSvg width="100%" height="100%" />

        {/* 제목 */}
        <View style={styles.titleWrapper}>
          <Text
            style={[styles.title, { color: titleColor }]}
            numberOfLines={1}
          >
            {board.title}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: -30,
  },

  card: {
    width: "100%",
    aspectRatio: 1.32,
    borderRadius: 22,
    overflow: "hidden",
    position: "relative",
  },

  titleWrapper: {
    position: "absolute",
    top: 50,   
    left: 25,
    right: 22,
  },

  title: {
    ...typography.body4_14_regular,
    fontSize:22,
  },
});