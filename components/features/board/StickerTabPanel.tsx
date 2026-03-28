import type { StickerCatalogItem } from "@/types/board";
import React from "react";
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  items: StickerCatalogItem[];
  onPressItem: (catalogStickerId: number) => void;
  onPressAdd?: () => void;
};

export default function StickerTabPanel({ items, onPressItem, onPressAdd }: Props) {
  return (
    <View style={styles.gridContainer}>
   
      <Pressable style={styles.addCard} onPress={onPressAdd}>
        <Text style={styles.addPlus}>＋</Text>
      </Pressable>

      
      {items.map((item) => (
        <Pressable
          key={item.id.toString()}
          style={styles.itemButton}
          onPress={() => onPressItem(item.id)}
        >
          <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
        </Pressable>
      ))}
    </View>
  );
}


const screenWidth = Dimensions.get("window").width;
const CARD_GAP = 16;
const CARD_SIZE = Math.floor((screenWidth - 84) / 4);

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: CARD_GAP,
    rowGap: 18,
    paddingHorizontal: 0,
    paddingBottom: 24,
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
  itemButton: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EFE9E0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  itemImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
});