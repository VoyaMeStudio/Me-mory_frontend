import type { StickerCatalogItem } from "@/types/board";
import React from "react";
import {
    FlatList,
    Image,
    Pressable,
    StyleSheet
} from "react-native";

type Props = {
  items: StickerCatalogItem[];
  onPressItem: (catalogStickerId: number) => void;
};

export default function StickerTabPanel({ items, onPressItem }: Props) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id.toString()}
      numColumns={4}
      contentContainerStyle={styles.contentContainer}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => (
        <Pressable
          style={styles.itemButton}
          onPress={() => onPressItem(item.id)}
        >
          <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
        </Pressable>
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  row: {
    justifyContent: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  itemButton: {
    width: 58,
    height: 58,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EFE9E0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  itemImage: {
    width: 34,
    height: 34,
    borderRadius: 8,
  },
});