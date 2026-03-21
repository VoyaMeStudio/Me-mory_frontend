import type { StickerCatalogItem } from "@/types/board";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import CustomIconTabPanel from "./CustomIconTabPanel";
import StickerTabPanel from "./StickerTabPanel";

type Props = {
  selectedTab: "custom" | "sticker";
  onChangeTab: (tab: "custom" | "sticker") => void;
  stickerItems: StickerCatalogItem[];
  onPressSticker: (catalogStickerId: number) => void;
  onCompleteCreateCustomIcon: () => Promise<void> | void;
};

export default function BoardBottomSheet({
  selectedTab,
  onChangeTab,
  stickerItems,
  onPressSticker,
  onCompleteCreateCustomIcon,
}: Props) {
  return (
    <View style={styles.sheet}>
      <View style={styles.handle} />

      <View style={styles.tabRow}>
        <Pressable style={styles.tab} onPress={() => onChangeTab("custom")}>
          <View style={styles.tabInner}>
            <Text
              style={[
                styles.tabText,
                selectedTab === "custom" && styles.tabTextActive,
              ]}
            >
              커스텀 아이콘
            </Text>

            <View
              style={[
                styles.tabIndicator,
                selectedTab === "custom" && styles.tabIndicatorActive,
              ]}
            />
          </View>
        </Pressable>

        <Pressable style={styles.tab} onPress={() => onChangeTab("sticker")}>
          <View style={styles.tabInner}>
            <Text
              style={[
                styles.tabText,
                selectedTab === "sticker" && styles.tabTextActive,
              ]}
            >
              스티커
            </Text>

            <View
              style={[
                styles.tabIndicator,
                selectedTab === "sticker" && styles.tabIndicatorActive,
              ]}
            />
          </View>
        </Pressable>
      </View>

      <View style={styles.content}>
        {selectedTab === "custom" ? (
          <CustomIconTabPanel
            onCompleteCreate={onCompleteCreateCustomIcon}
          />
        ) : (
          <StickerTabPanel
            items={stickerItems}
            onPressItem={onPressSticker}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    width: "100%",
    minHeight: 220,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },

  handle: {
    width: 64,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#DDD7CD",
    alignSelf: "center",
    marginBottom: 12,
  },

  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EFE9DF",
    paddingHorizontal: 20,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  tabInner: {
    width: "100%",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 0,
  },

  tabText: {
    color: "#827765",
    textAlign: "center",
    fontFamily: "Nanum NeuRisNeuRisCe",
    fontSize: 24,
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: 24,
    letterSpacing: -0.24,
    opacity: 0.7,
  },

  tabTextActive: {
    opacity: 1,
  },

  tabIndicator: {
    marginTop: 16,
    width: "100%",
    height: 3,
    backgroundColor: "transparent",
  },

  tabIndicatorActive: {
    backgroundColor: "#827765",
  },

  content: {
    paddingTop: 16,
    flex: 1,
  },
});