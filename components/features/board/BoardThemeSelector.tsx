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

const GAP = 12;

/** Fixed tile: 100×116, aspect 25/29 — matches design spec */
const TILE_WIDTH = 100;
const TILE_HEIGHT = 116;

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
  /** 3 columns × n rows, 12px between tiles; each tile 100×116 (25:29) */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: GAP,
    rowGap: GAP,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  item: {
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 13,
    paddingRight: 13,
    gap: 10,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1.6,
    borderColor: Colors.grey700,
    backgroundColor: Colors.primary100,
  },
  itemSelected: {
    borderWidth: 1.6,
    borderColor: "#D59B6A",
  },
  imageWrapper: {
    flex: 1,
    alignSelf: "stretch",
    position: "relative",
    minHeight: 0,
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
});