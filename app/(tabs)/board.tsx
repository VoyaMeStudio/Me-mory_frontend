import AddBoardModal from "@/components/features/board/AddBoardModal";
import BoardBottomSheet from "@/components/features/board/BoardBottomSheet";
import BoardCanvas from "@/components/features/board/BoardCanvas";
import BoardFloatingButton from "@/components/features/board/BoardFloatingButton";
import BoardList from "@/components/features/board/BoardList";
import BoardMoreMenu from "@/components/features/board/BoardMoreMenu";
import DeleteBoardDialog from "@/components/features/board/DeleteBoardDialog";
import CollectionHeader from "@/components/features/home/homeHeader";
import { STICKER_CATALOG_MOCK } from "@/constants/boardAssets";
import useBoardEdit from "@/hooks/useBoardEdit";
import useBoardList from "@/hooks/useBoardList";
import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type BoardScreenMode = "list" | "detail" | "edit";

export default function BoardTabScreen() {
  const { boards, isLoading, isCreating, handleCreateBoard, fetchBoards } =
    useBoardList();

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [mode, setMode] = useState<BoardScreenMode>("list");
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [menuBoardId, setMenuBoardId] = useState<number | null>(null);
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);

  const selectedBoard = useMemo(() => {
    if (selectedBoardId == null) return null;
    return boards.find((board) => board.boardId === selectedBoardId) ?? null;
  }, [boards, selectedBoardId]);

  const menuBoard = useMemo(() => {
    if (menuBoardId == null) return null;
    return boards.find((board) => board.boardId === menuBoardId) ?? null;
  }, [boards, menuBoardId]);

 const {
  board: editingBoard,
  isLoading: isEditLoading,
  selectedTab,
  setSelectedTab,
  selectedBoardStickerId,
  stickerCatalog,
  handleAddSticker,
  handleDeleteSticker,
  handleSelectSticker,
  fetchBoardDetail,
} = useBoardEdit(selectedBoardId);

  const handlePressBoard = (boardId: number) => {
    setSelectedBoardId(boardId);
    setMenuBoardId(null);
    setMode("detail");
  };

  const handleBackToList = () => {
    setMode("list");
    setSelectedBoardId(null);
    setMenuBoardId(null);
  };

  const handleMoveToEdit = () => {
    if (menuBoardId != null) {
      setSelectedBoardId(menuBoardId);
    }
    setMenuBoardId(null);
    setMode("edit");
  };

  const handleSaveBoard = async (
    title: string,
    boardThemeId: 1 | 2 | 3 | 4
  ) => {
    const ok = await handleCreateBoard(title, boardThemeId);
    if (ok) {
      setIsAddModalVisible(false);
    }
  };

  const handleDeleteBoard = async () => {
    setIsDeleteDialogVisible(false);
    setMenuBoardId(null);
    setMode("list");
    setSelectedBoardId(null);
    await fetchBoards();
  };

  const renderHeader = () => {
    if (mode === "edit") {
      return (
        <View style={styles.editHeader}>
          <Pressable onPress={() => setMode("detail")}>
            <Text style={styles.editHeaderText}>취소</Text>
          </Pressable>

          <Pressable onPress={() => setMode("detail")}>
            <Text style={styles.editHeaderText}>저장</Text>
          </Pressable>
        </View>
      );
    }

    return <CollectionHeader title="보드" />;
  };

  const renderListContent = () => {
    if (boards.length === 0) {
      return (
        <View style={styles.loaderContainer}>
          <Text style={styles.emptyText}>아직 생성된 보드가 없습니다.</Text>
        </View>
      );
    }

    if (boards.length === 1) {
      const onlyBoard = boards[0];

      return (
        <View style={styles.singleBoardDetailWrapper}>
          <BoardCanvas
            title={onlyBoard.title}
            boardThemeId={onlyBoard.boardThemeId}
            stickers={[]}
            showMenuButton
            onPressMenu={() => {
              setSelectedBoardId(onlyBoard.boardId);
              setMenuBoardId(onlyBoard.boardId);
            }}
          />
        </View>
      );
    }

    return <BoardList boards={boards} onPressBoard={handlePressBoard} />;
  };

  const renderDetailContent = () => {
    if (!selectedBoard) {
      return (
        <View style={styles.loaderContainer}>
          <Text style={styles.emptyText}>보드를 찾을 수 없습니다.</Text>
        </View>
      );
    }

    return (
      <View style={styles.detailWrapper}>
        <BoardCanvas
          title={selectedBoard.title}
          boardThemeId={selectedBoard.boardThemeId}
          stickers={[]}
          showMenuButton
          onPressMenu={() => {
            setMenuBoardId(selectedBoard.boardId);
          }}
        />
      </View>
    );
  };

  const renderEditContent = () => {
    if (isEditLoading || !editingBoard) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={Colors.primary50} />
        </View>
      );
    }

    return (
      <View style={styles.editWrapper}>
        <View style={styles.editCanvasArea}>
          <BoardCanvas
            title={editingBoard.title}
            boardThemeId={editingBoard.boardThemeId}
            stickers={editingBoard.stickers}
            editable
            selectedBoardStickerId={selectedBoardStickerId}
            onPressSticker={handleSelectSticker}
            onDeleteSticker={handleDeleteSticker}
          />
        </View>

        <View style={styles.bottomSheetArea}>
         <BoardBottomSheet
  selectedTab={selectedTab}
  onChangeTab={setSelectedTab}
  stickerItems={stickerCatalog ?? STICKER_CATALOG_MOCK}
  onPressSticker={handleAddSticker}
  onCompleteCreateCustomIcon={async () => {
    await fetchBoardDetail();
  }}
/>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, mode === "edit" && styles.safeAreaEdit]}
    >
      <View style={[styles.container, mode === "edit" && styles.containerEdit]}>
        {renderHeader()}

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={Colors.primary700} />
          </View>
        ) : mode === "list" ? (
          <>
            {renderListContent()}
            <BoardFloatingButton onPress={() => setIsAddModalVisible(true)} />
          </>
        ) : mode === "detail" ? (
          renderDetailContent()
        ) : (
          renderEditContent()
        )}

        <BoardMoreMenu
          visible={menuBoardId != null}
          onRequestClose={() => setMenuBoardId(null)}
          onPressEdit={() => {
            handleMoveToEdit();
          }}
          onPressDelete={() => {
            setMenuBoardId(null);
            setIsDeleteDialogVisible(true);
          }}
        />

        <AddBoardModal
          visible={isAddModalVisible}
          isCreating={isCreating}
          onClose={() => setIsAddModalVisible(false)}
          onSave={handleSaveBoard}
        />

        <DeleteBoardDialog
          visible={isDeleteDialogVisible}
          onClose={() => setIsDeleteDialogVisible(false)}
          onConfirm={handleDeleteBoard}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary50,
  },
  safeAreaEdit: {
    backgroundColor: Colors.grey800,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.primary50,
  },
  containerEdit: {
    flex: 1,
    backgroundColor: Colors.grey800,
  },

  editHeader: {
    minHeight: 44,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  editHeaderText: {
    ...typography.body4_14_regular,
    color: Colors.primary50,
  },

  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    ...typography.body4_14_regular,
    color: Colors.grey600,
  },

  singleBoardDetailWrapper: {
    flex: 1,
    paddingTop: 6,
    paddingBottom: 24,
    position: "relative",
  },

  detailWrapper: {
    flex: 1,
    paddingBottom: 20,
    position: "relative",
  },

  editWrapper: {
    flex: 1,
  },
  editCanvasArea: {
    flex: 1,
    paddingTop: 8,
  },
  bottomSheetArea: {
    width: "100%",
  },
});