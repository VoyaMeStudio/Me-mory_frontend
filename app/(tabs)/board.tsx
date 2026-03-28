import { deleteBoard, updateBoardStickers } from "@/api/board";
import AddBoardModal from "@/components/features/board/AddBoardModal";
import BoardBottomSheet from "@/components/features/board/BoardBottomSheet";
import BoardCanvas from "@/components/features/board/BoardCanvas";
import BoardFloatingButton from "@/components/features/board/BoardFloatingButton";
import BoardList from "@/components/features/board/BoardList";
import BoardMoreMenu from "@/components/features/board/BoardMoreMenu";
import BoardToast from "@/components/features/board/BoardToast";
import DeleteBoardDialog from "@/components/features/board/DeleteBoardDialog";
import CollectionHeader from "@/components/features/home/homeHeader";
import { STICKER_CATALOG_MOCK } from "@/constants/boardAssets";
import useBoardEdit from "@/hooks/useBoardEdit";
import useBoardList from "@/hooks/useBoardList";
import { Colors } from "@/styles/colors";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  const [deleteTargetBoardId, setDeleteTargetBoardId] = useState<number | null>(null);
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
  const [isDeleteToastVisible, setIsDeleteToastVisible] = useState(false);

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


  const selectedBoard = useMemo(() => {
    if (selectedBoardId == null) return null;
    const basicInfo = boards.find((b) => b.boardId === selectedBoardId);
    if (!basicInfo) return null;

    
    return editingBoard && editingBoard.boardId === selectedBoardId
      ? editingBoard
      : { ...basicInfo, stickers: [] }; 
  }, [boards, selectedBoardId, editingBoard]);

  const handlePressBoard = (boardId: number) => {
    setSelectedBoardId(boardId);
    setMenuBoardId(null);
    setMode("detail");
  };

  const handleMoveToEdit = () => {
    if (menuBoardId != null) {
      setSelectedBoardId(menuBoardId);
    }
    setMenuBoardId(null);
    setMode("edit");
  };

  const handleCancelEdit = () => {
    setMode("detail");
  };

  const handleSaveEdit = async () => {
    if (!selectedBoardId || !editingBoard) return;

    try {
      await updateBoardStickers(selectedBoardId, editingBoard.stickers);
      
      await fetchBoardDetail();
      await fetchBoards(); 
      setMode("detail");
    } catch (error) {
      console.error("보드 저장 실패:", error);
      alert("저장에 실패했습니다.");
    }
  };

  const handleSaveBoard = async (title: string, boardThemeId: 1 | 2 | 3 | 4) => {
    const ok = await handleCreateBoard(title, boardThemeId);
    if (ok) setIsAddModalVisible(false);
  };

  const handleDeleteBoard = async () => {
    if (deleteTargetBoardId == null) return;
    try {
      await deleteBoard(deleteTargetBoardId);
      setIsDeleteDialogVisible(false);
      setMenuBoardId(null);
      if (selectedBoardId === deleteTargetBoardId) {
        setSelectedBoardId(null);
        setMode("list");
      }
      setDeleteTargetBoardId(null);
      await fetchBoards();
      setIsDeleteToastVisible(true);
    } catch (error) {
      console.error("보드 삭제 실패:", error);
    }
  };

  const renderHeader = () => {
    if (mode === "edit") {
      return (
        <View style={styles.editHeader}>
          <TouchableOpacity onPress={handleCancelEdit} hitSlop={20}>
            <Text style={styles.editHeaderActionText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSaveEdit} hitSlop={20}>
            <Text style={[styles.editHeaderActionText, styles.editHeaderActionTextBold]}>저장</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return <CollectionHeader title="보드" />;
  };

  const renderDetailContent = () => {
   
    const board = selectedBoard as any; 
    if (!board) return null;

    return (
      <View style={styles.detailWrapper}>
        <BoardCanvas
          title={board.title}
          boardThemeId={board.boardThemeId}
          stickers={board.stickers || []} 
          showMenuButton
          onPressMenu={() => setMenuBoardId(board.boardId)}
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
            showMenuButton={false}
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
            onCompleteCreateCustomIcon={fetchBoardDetail}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, mode === "edit" && styles.safeAreaEdit]}>
      <View style={[styles.container, mode === "edit" && styles.containerEdit]}>
        {renderHeader()}
        {isLoading ? (
          <View style={styles.loaderContainer}><ActivityIndicator size="small" color={Colors.primary700} /></View>
        ) : mode === "list" ? (
          <>
            <BoardList boards={boards} onPressBoard={handlePressBoard} />
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
          onPressEdit={handleMoveToEdit}
          onPressDelete={() => {
            setDeleteTargetBoardId(menuBoardId);
            setMenuBoardId(null);
            setIsDeleteDialogVisible(true);
          }}
        />
        <AddBoardModal visible={isAddModalVisible} isCreating={isCreating} onClose={() => setIsAddModalVisible(false)} onSave={handleSaveBoard} />
        <DeleteBoardDialog visible={isDeleteDialogVisible} onClose={() => setIsDeleteDialogVisible(false)} onConfirm={handleDeleteBoard} />
        <BoardToast visible={isDeleteToastVisible} message="보드가 삭제되었습니다." onHide={() => setIsDeleteToastVisible(false)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.primary50 },
  safeAreaEdit: { backgroundColor: Colors.grey800 },
  container: { flex: 1, backgroundColor: Colors.primary50 },
  containerEdit: { flex: 1, backgroundColor: Colors.grey800 },
  editHeader: {
    position: "absolute", top: 0, left: 0, right: 0, height: 52,
    paddingHorizontal: 24, flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", backgroundColor: Colors.grey800,
    zIndex: 9999, elevation: 10,
  },
  editHeaderActionText: { fontFamily: "Nanum NeuRisNeuRisCe", fontSize: 20, color: "#B0AA9F" },
  editHeaderActionTextBold: { color: "#FFFFFF", fontWeight: "600" },
  loaderContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  detailWrapper: { flex: 1, paddingBottom: 20, position: "relative" },
  editWrapper: { flex: 1, position: "relative", marginTop: 52 },
  editCanvasArea: { flex: 1, paddingTop: 8, paddingBottom: 250 },
  bottomSheetArea: { position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10 },
});