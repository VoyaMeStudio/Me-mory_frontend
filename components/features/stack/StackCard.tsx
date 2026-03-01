import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";
import React, { useMemo } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

import L102 from "@/assets/images/stack_left_102.svg";
import L110 from "@/assets/images/stack_left_110.svg";
import L118 from "@/assets/images/stack_left_118.svg";
import L126 from "@/assets/images/stack_left_126.svg";
import L62 from "@/assets/images/stack_left_62.svg";
import L70 from "@/assets/images/stack_left_70.svg";
import L78 from "@/assets/images/stack_left_78.svg";
import L86 from "@/assets/images/stack_left_86.svg";
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

export type StackCardItem = {
  id: string;
  title: string;
  dateText: string;
  height: number;          
  emotionColor: string;    
};

type HeightKey = 62 | 70 | 78 | 86 | 94 | 102 | 110 | 118 | 126;

const HEIGHTS: HeightKey[] = [62, 70, 78, 86, 94, 102, 110, 118, 126];

function normalizeHeight(h: number): HeightKey {
  let best: HeightKey = 62;
  let bestDiff = Number.POSITIVE_INFINITY;
  for (const v of HEIGHTS) {
    const d = Math.abs(h - v);
    if (d < bestDiff) {
      best = v;
      bestDiff = d;
    }
  }
  return best;
}

const LEFT_BG: Record<HeightKey, any> = {
  62: L62, 70: L70, 78: L78, 86: L86, 94: L94, 102: L102, 110: L110, 118: L118, 126: L126,
};

const RIGHT_BG: Record<HeightKey, any> = {
  62: R62, 70: R70, 78: R78, 86: R86, 94: R94, 102: R102, 110: R110, 118: R118, 126: R126,
};

type Props = {
  item: StackCardItem;
  contentW: number;
  side: "left" | "right";
  style?: ViewStyle;
};

export default function StackCard({ item, contentW, side, style }: Props) {
  const cardW = Math.min(contentW, 360);
  const hKey = useMemo(() => normalizeHeight(item.height), [item.height]);

  const TicketBg = useMemo(() => {
    return side === "left" ? LEFT_BG[hKey] : RIGHT_BG[hKey];
  }, [side, hKey]);


  const accentColor = item.emotionColor;

  return (
    <View style={[styles.wrap, { width: cardW, height: item.height }, style]}>

      <TicketBg
        width={cardW}
        height={item.height}
        preserveAspectRatio="none"
        color={accentColor}
      />

      <View pointerEvents="none" style={styles.textOverlay}>
        <Text numberOfLines={1} style={styles.titleText}>
          {item.title}
        </Text>
        <Text style={styles.dateText}>{item.dateText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "center",
    position: "relative",
  },
  textOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
  },
  titleText: {
    ...typography.sub2_12_regular,
    color: Colors?.grey900 ?? "#2E2A24",
  },
  dateText: {
    ...typography.sub3_9_bold,
    color: Colors?.grey500 ?? "#8C8578",
  },
});