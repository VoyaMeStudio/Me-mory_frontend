import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

import L110 from "@/assets/images/stack_left_110.svg";
import L118 from "@/assets/images/stack_left_118.svg";
import L126 from "@/assets/images/stack_left_126.svg";
import L62 from "@/assets/images/stack_left_62.svg";
import L70 from "@/assets/images/stack_left_70.svg";
import L78 from "@/assets/images/stack_left_78.svg";
import L86 from "@/assets/images/stack_left_86.svg";
import L90 from "@/assets/images/stack_left_90.svg";
import L94 from "@/assets/images/stack_left_94.svg";

import R102 from "@/assets/images/stack_right_102.svg";
import R110 from "@/assets/images/stack_right_110.svg";
import R118 from "@/assets/images/stack_right_118.svg";
import R126 from "@/assets/images/stack_right_126.svg";
import R62 from "@/assets/images/stack_right_62.svg";
import R70 from "@/assets/images/stack_right_70.svg";
import R78 from "@/assets/images/stack_right_78.svg";
import R86 from "@/assets/images/stack_right_86.svg";
import R94 from "@/assets/images/stack_right_94.svg";

import { StackCardItem } from "@/components/features/stack.types";
import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";

type Props = {
  item: StackCardItem;
  contentW: number;
  side: "left" | "right";
  style?: ViewStyle;
  onPress?: () => void;
};

const LEFT_BG: Record<number, any> = {
  62: L62,
  70: L70,
  78: L78,
  86: L86,
  90: L90,
  94: L94,
  110: L110,
  118: L118,
  126: L126,
};

const RIGHT_BG: Record<number, any> = {
  62: R62,
  70: R70,
  78: R78,
  86: R86,
  94: R94,
  102: R102,
  110: R110,
  118: R118,
  126: R126,
};

function normalizeHeight(height: number, side: "left" | "right") {
  if (side === "left" && height === 102) return 94;
  return height;
}

export default function StackCard({ item, contentW, side, style, onPress }: Props) {
  const cardW = 306;

  const TicketBg = useMemo(() => {
    const h = normalizeHeight(item.height, side);
    return side === "left" ? (LEFT_BG[h] ?? L62) : (RIGHT_BG[h] ?? R62);
  }, [item.height, side]);

  const accentColor = item.emotionColor ?? "#D9D3C7";

  return (
    <Pressable onPress={onPress} style={[styles.wrap, { width: cardW, height: item.height }, style]}>
      <TicketBg
        width={cardW}
        height={item.height}
        preserveAspectRatio="none"
        color={accentColor}
        style={{ color: accentColor }}
      />

      <View pointerEvents="none" style={styles.textOverlay}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.titleText}>
          {item.title}
        </Text>
        <Text style={styles.dateText}>{item.dateText}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: "center", position: "relative" },
  textOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 26,
  },
  titleText: {
    ...typography.sub1_14_medium,
    color: Colors?.grey900 ?? "#2E2A24",
    fontSize: 22,
    lineHeight: 26,
    marginBottom: 8,
  },
  dateText: {
    ...typography.sub2_12_regular,
    color: Colors?.grey600 ?? "#777166",
    fontSize: 18,
    lineHeight: 22,
  },
});