import type { BoardListItemResponse } from "@/types/board";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import BoardCard from "./BoardCard";

type Props = {
  boards: BoardListItemResponse[];
  onPressBoard: (boardId: number) => void;
};

export default function BoardList({ boards, onPressBoard }: Props) {
  if (!boards.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>아직 생성된 보드가 없습니다.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={boards}
      keyExtractor={(item) => item.boardId.toString()}
      renderItem={({ item }) => (
        <BoardCard
          board={item}
          onPress={() => onPressBoard(item.boardId)}
        />
      )}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 160,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    fontSize: 15,
    color: "#8A8478",
  },
});