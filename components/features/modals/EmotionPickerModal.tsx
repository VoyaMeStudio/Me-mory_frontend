import CheckSvg from "@/assets/images/check.svg";
import type { TripEmotion } from "@/components/features/stack.types";
import { useEmotions } from "@/hooks/useEmotions";
import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;

  value?: TripEmotion;

  onClose: () => void;

  onConfirm: (e: TripEmotion) => void;
};

const PRIMARY_400 = Colors?.primary400 ?? "#D8CCB8";
const BTN_BROWN = Colors?.primary900 ?? "#544C3F";
const BTN_TEXT = "#FFFFFF";

export default function EmotionPickerOverlay({
  visible,
  value,
  onClose,
  onConfirm,
}: Props) {
  const { emotions, loading, error } = useEmotions(visible);

  const [temp, setTemp] = useState<TripEmotion | undefined>(value);

  useEffect(() => {
    if (!visible) return;
    setTemp(value);
  }, [visible, value]);

  const canConfirm = useMemo(() => !!temp, [temp]);

  if (!visible) return null;

  return (
    <View style={styles.absoluteFill}>
      <Pressable style={styles.overlayBackdrop} onPress={onClose} />

      <View style={styles.popup}>
        <View style={styles.topBar}>
          <Pressable onPress={onClose} style={styles.backBtn} hitSlop={10}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View style={styles.sideSlot} />
          <Text style={styles.title}>감정색 선택</Text>
          <View style={styles.sideSlot} />
        </View>

        <View style={styles.dividerLine} />

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator />
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {emotions.map((e) => {
              const selected = temp?.id === e.id;

              return (
                <Pressable
                  key={e.id}
                  style={styles.item}
                  onPress={() => setTemp(e)}
                  hitSlop={8}
                >
                  <View style={[styles.dot, { backgroundColor: e.color }]}>
                    {selected && <CheckSvg width={18} height={18} />}
                  </View>

                  <Text style={[styles.label, selected && styles.labelSelected]}>
                    {e.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <Pressable
          style={[styles.confirmBtn, !canConfirm && styles.confirmBtnDisabled]}
          disabled={!canConfirm}
          onPress={() => temp && onConfirm(temp)}
        >
          <Text style={[styles.confirmText, !canConfirm && styles.confirmTextDisabled]}>
            확인
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  popup: {
    width: 295,
    borderRadius: 24,
    backgroundColor: "#fff",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: PRIMARY_400,
    paddingTop: 6,
    paddingBottom: 10,
  },

  topBar: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  backBtn: {
    position: "absolute",
    left: 8,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    fontSize: 26,
    color: Colors?.grey500 ?? "#8C8578",
    marginTop: -2,
  },

  sideSlot: { width: 36 },

  title: {
    ...typography.sub1_14_medium,
    color: Colors?.grey900 ?? "#2E2A24",
    fontSize: 20,
    lineHeight: 24,
    textAlign: "center",
    flexShrink: 0,
  },

  dividerLine: {
    height: 1,
    backgroundColor: PRIMARY_400,
    marginHorizontal: 18,
    marginBottom: 6,
  },

  loadingBox: { paddingVertical: 22 },
  errorBox: { paddingVertical: 18, paddingHorizontal: 18 },
  errorText: { color: Colors?.grey700 ?? "#5b564d" },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 18,
    paddingTop: 6,
    rowGap: 14,
    justifyContent: "space-between",
  },
  item: {
    width: "23%" as any,
    alignItems: "center",
  },

  dot: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    marginTop: 6,
    ...typography.sub3_9_bold,
    color: Colors?.grey600 ?? "#777166",
    fontSize: 14,
    lineHeight: 16,
    fontWeight: "400",
  },
  labelSelected: {
    color: Colors?.grey900 ?? "#2E2A24",
    fontWeight: "700",
  },

  confirmBtn: {
    marginTop: 12,
    marginHorizontal: 18,
    height: 50,
    borderRadius: 999,
    backgroundColor: BTN_BROWN,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    ...typography.sub1_14_medium,
    color: BTN_TEXT,
    fontSize: 20,
    lineHeight: 24,
  },

  confirmBtnDisabled: {
    backgroundColor: Colors?.grey200 ?? "#E7E1D7",
  },
  confirmTextDisabled: {
    color: Colors?.grey400 ?? "#A7A093",
  },
});