import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type CollectionTabKey = "card" | "stack" | "timeline";

export default function CollectionTabs({
  value,
  onChange,
}: {
  value: CollectionTabKey;
  onChange: (v: CollectionTabKey) => void;
}) {
  return (
    <View style={styles.wrap}>
      <Tab label="카드" active={value === "card"} onPress={() => onChange("card")} />
      <Tab
        label="쌓아보기"
        active={value === "stack"}
        onPress={() => onChange("stack")}
      />
      <Tab
        label="타임라인"
        active={value === "timeline"}
        onPress={() => onChange("timeline")}
      />
    </View>
  );
}

function Tab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.item}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Text style={[styles.textBase, active ? styles.textActive : styles.textIdle]}>
        {label}
      </Text>

      <View style={[styles.underlineBase, active ? styles.underline : styles.underlineSpacer]} />
    </Pressable>
  );
}

const UNDERLINE_W = 84;

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },

  item: {
    flex: 1,
    alignItems: "center",
  },

  textBase: {
    ...typography.sub1_14_medium,
    letterSpacing: -0.2,
    fontSize:22
  },

  textIdle: {
    color: Colors?.grey400 ?? "#B0AAA0",
    fontWeight: "400",
  },

  textActive: {
    color: Colors?.grey900 ?? "#2E2A24",
    fontWeight: "600",
  },

  underlineBase: {
    marginTop: 10,
    width: UNDERLINE_W,
    height: 2,
    borderRadius: 999,
  },

  underline: {
    backgroundColor: Colors?.grey900 ?? "#2E2A24",
  },

  underlineSpacer: {
    backgroundColor: "transparent",
  },
});