import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";
import React, { useMemo } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
export type CollectionTabKey = "card" | "stack" | "timeline";

const TABS: { key: CollectionTabKey; label: string }[] = [
  { key: "card", label: "카드" },
  { key: "stack", label: "쌓아보기" },
  { key: "timeline", label: "타임라인" },
];

type Props = {
  value: CollectionTabKey;
  onChange: (v: CollectionTabKey) => void;
  sidePadding?: number;
};

const LINE_H = 1;

export default function CollectionTabs({ value, onChange, sidePadding = 24 }: Props) {
  const activeIndex = useMemo(
    () => Math.max(0, TABS.findIndex((t) => t.key === value)),
    [value]
  );

  const screenW = Dimensions.get("window").width;
  const contentW = screenW - sidePadding * 2;
  const fullLineW = screenW;
  const leftShift = -((fullLineW - contentW) / 2);
  const activeW = fullLineW / TABS.length;
  const activeLeft = activeW * activeIndex;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {TABS.map((t) => {
          const active = t.key === value;
          return (
            <Pressable
              key={t.key}
              onPress={() => onChange(t.key)}
              style={styles.item}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.textBase, active ? styles.textActive : styles.textIdle]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.lineArea}>

        <View
          style={[
            styles.baseLine,
            {
              width: fullLineW,
              left: leftShift,
            },
          ]}
        />

        <View
          style={[
            styles.activeLine,
            {
              width: activeW,
              left: leftShift + activeLeft, 
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 10,
    paddingBottom: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  item: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },

  textBase: {
    ...typography.sub1_14_medium,
    letterSpacing: -0.2,
    fontSize:22,
    lineHeight:30,
    includeFontPadding:false,
    textAlignVertical:"center"

  },

  textIdle: {
    color: Colors?.grey400 ?? "#B0AAA0",
    fontWeight: "400",
  },

  textActive: {
    color: Colors?.grey900 ?? "#2E2A24",
    fontWeight: "600",
  },

  lineArea: {
    marginTop: 8,
    height: LINE_H,
    position: "relative",
    overflow: "visible",
  },

  baseLine: {
    position: "absolute",
    top: 0,
    height: LINE_H,
    backgroundColor: Colors?.grey200 ?? "#E6E1D8",
  },

  activeLine: {
    position: "absolute",
    top: 0,
    height: LINE_H,
    backgroundColor: Colors?.grey900 ?? "#2E2A24",
  },
});