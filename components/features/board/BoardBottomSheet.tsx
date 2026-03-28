import { typography } from "@/styles/typography";
import type { StickerCatalogItem } from "@/types/board";
import React, { useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import CustomIconTabPanel from "./CustomIconTabPanel";
import StickerTabPanel from "./StickerTabPanel";

type Props = {
  selectedTab: "custom" | "sticker";
  onChangeTab: (tab: "custom" | "sticker") => void;
  stickerItems: StickerCatalogItem[];

  customItems?: any[];
  onPressSticker: (catalogStickerId: number) => void;
  onCompleteCreateCustomIcon: () => Promise<void> | void;
};

export default function BoardBottomSheet({
  selectedTab,
  onChangeTab,
  stickerItems,
  customItems = [],
  onPressSticker,
  onCompleteCreateCustomIcon,
}: Props) {
  const [isCreatingCustomIcon, setIsCreatingCustomIcon] = useState(false);

  const handleOpenCustomCreator = () => {
    setIsCreatingCustomIcon(true);
  };

  const handleCloseCustomCreator = () => {
    setIsCreatingCustomIcon(false);
  };

  const handleCompleteCreate = async () => {
    await onCompleteCreateCustomIcon();
    setIsCreatingCustomIcon(false);
  };

  const renderCustomContent = () => {
    if (isCreatingCustomIcon) {
      return (
        <CustomIconTabPanel
          visible={isCreatingCustomIcon}
          onClose={handleCloseCustomCreator}
          onCompleteCreate={handleCompleteCreate}
        />
      );
    }

    return (
      <View style={styles.customGridWrap}>
        <View style={styles.customGrid}>
    
          <Pressable style={styles.addCard} onPress={handleOpenCustomCreator}>
            <Text style={styles.addPlus}>＋</Text>
          </Pressable>

          {customItems.map((item, index) => (
            <View key={index} style={styles.customItem}>
              <Text style={styles.customItemIcon}>🖼️</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.sheet}>
      <View style={styles.handle} />

      <View style={styles.tabRow}>
        <Pressable
          style={styles.tabButton}
          onPress={() => {
            onChangeTab("custom");
            setIsCreatingCustomIcon(false);
          }}
        >
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
                styles.indicator,
                selectedTab === "custom" && styles.indicatorActive,
              ]}
            />
          </View>
        </Pressable>

        <Pressable
          style={styles.tabButton}
          onPress={() => {
            onChangeTab("sticker");
            setIsCreatingCustomIcon(false);
          }}
        >
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
                styles.indicator,
                selectedTab === "sticker" && styles.indicatorActive,
              ]}
            />
          </View>
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === "custom" ? (
          renderCustomContent()
        ) : (
          <StickerTabPanel
            items={stickerItems}
            onPressItem={onPressSticker}
            onPressAdd={() => console.log("스티커 추가 버튼 클릭")}
          />
        )}
      </ScrollView>

      <View style={styles.bottomGrabber} />
    </View>
  );
}


const screenWidth = Dimensions.get("window").width;
const CARD_GAP = 16;
const CARD_SIZE = Math.floor((screenWidth - 84) / 4);

const styles = StyleSheet.create({
  sheet: {
    width: "100%",
    maxHeight: "85%",
    minHeight: 250,
    backgroundColor: "#F7F7F5",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
    overflow: "hidden",
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#D6D1C8",
    alignSelf: "center",
    marginTop: 2,
    marginBottom: 14,
  },
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 0,
  },
  tabButton: {
    flex: 1,
  },
  tabInner: {
    alignItems: "center",
  },
  tabText: {
    ...typography.body4_14_regular,
    fontFamily: "Nanum NeuRisNeuRisCe",
    fontSize: 16,
    lineHeight: 20,
    color: "#A29B8E",
  },
  tabTextActive: {
    color: "#827765",
  },
  indicator: {
    marginTop: 10,
    width: "100%",
    height: 2,
    backgroundColor: "transparent",
  },
  indicatorActive: {
    backgroundColor: "#827765",
  },
  content: {
    paddingTop: 14,
    paddingHorizontal: 18,
  },
  customGridWrap: {
    marginBottom: 20,
  },
  customGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: CARD_GAP,
    rowGap: 18,
  },
  addCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#D4CEC3",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAF8",
  },
  addPlus: {
    color: "#B7B0A3",
    fontSize: 24,
    lineHeight: 24,
  },
  customItem: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ECE7DE",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  customItemIcon: {
    fontSize: 18,
  },
  bottomGrabber: {
    alignSelf: "center",
    width: 108,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#D9D5CD",
    marginBottom: 12,
  },
});