import { Colors } from "@/styles/colors";
import type { BoardThemeId } from "@/types/board";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import ThemeSquare1 from "@/assets/images/board_square.svg";
import ThemeSquare2 from "@/assets/images/board_square2.svg";
import ThemeSquare3 from "@/assets/images/board_square3.svg";
import ThemeSquare4 from "@/assets/images/board_square4.svg";

type Props = {
  selectedThemeId: BoardThemeId | null;
  onSelect: (themeId: BoardThemeId) => void;
};

const THEME_COMPONENT_MAP: Record<
  BoardThemeId,
  React.ComponentType<{ width?: number | string; height?: number | string }>
> = {
  1: ThemeSquare1,
  2: ThemeSquare2,
  3: ThemeSquare3,
  4: ThemeSquare4,
};

const THEME_IDS: BoardThemeId[] = [1, 2, 3, 4];

export default function BoardThemeSelector({
  selectedThemeId,
  onSelect,
}: Props) {
  const hasSelected = selectedThemeId !== null;

  return (
    <View style={styles.grid}>
      {THEME_IDS.map((themeId) => {
        const ThemeSvg = THEME_COMPONENT_MAP[themeId];
        const selected = selectedThemeId === themeId;
        const shouldDim = hasSelected && !selected;

        return (
          <Pressable
            key={themeId}
            style={[styles.item, selected && styles.itemSelected]}
            onPress={() => onSelect(themeId)}
          >
            <View style={styles.imageWrapper}>
              <ThemeSvg width="100%" height="100%" />
              {shouldDim && <View style={styles.dimOverlay} />}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
  },
  item: {
    width: "48.5%",
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.primary200,
    backgroundColor: Colors.primary100,
  },
  itemSelected: {
    borderWidth: 2,
    borderColor: "#D59B6A",
  },
  imageWrapper: {
    flex: 1,
    position: "relative",
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
});