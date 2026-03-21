import { getBoardDetail } from "@/api/board";
import { addBoardSticker, deleteBoardSticker } from "@/api/boardSticker";
import { STICKER_CATALOG_MOCK } from "@/constants/boardAssets";
import type { BoardDetailResponse, BoardStickerResponse } from "@/types/board";
import { useCallback, useEffect, useState } from "react";

export default function useBoardEdit(boardId: number | null) {
  const [board, setBoard] = useState<BoardDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBoardStickerId, setSelectedBoardStickerId] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<"custom" | "sticker">("custom");
  const [error, setError] = useState<string | null>(null);

  const fetchBoardDetail = useCallback(async () => {
    if (boardId == null) {
      setBoard(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getBoardDetail(boardId);
      setBoard(data);
    } catch (e) {
      console.error("[useBoardEdit] fetchBoardDetail error:", e);
      setError("보드 편집 정보를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  const handleAddSticker = useCallback(
    async (catalogStickerId: number) => {
      if (boardId == null) return;

      try {
        await addBoardSticker(boardId, catalogStickerId, {
          posX: 120,
          posY: 140,
          rotation: 0,
        });
        await fetchBoardDetail();
      } catch (e) {
        console.error("[useBoardEdit] addBoardSticker error:", e);
        setError("스티커를 추가하지 못했습니다.");
      }
    },
    [boardId, fetchBoardDetail]
  );

  const handleDeleteSticker = useCallback(
    async (boardStickerId: number) => {
      if (boardId == null) return;

      try {
        await deleteBoardSticker(boardId, boardStickerId);
        setSelectedBoardStickerId(null);
        await fetchBoardDetail();
      } catch (e) {
        console.error("[useBoardEdit] deleteBoardSticker error:", e);
        setError("스티커를 삭제하지 못했습니다.");
      }
    },
    [boardId, fetchBoardDetail]
  );

  const handleSelectSticker = useCallback((boardStickerId: number) => {
    setSelectedBoardStickerId((prev) => (prev === boardStickerId ? null : boardStickerId));
  }, []);

  const getSelectedSticker = useCallback((): BoardStickerResponse | null => {
    if (!board || selectedBoardStickerId == null) return null;
    return board.stickers.find((item) => item.boardStickerId === selectedBoardStickerId) ?? null;
  }, [board, selectedBoardStickerId]);

  useEffect(() => {
    if (boardId == null) return;
    fetchBoardDetail();
  }, [boardId, fetchBoardDetail]);

  return {
    board,
    isLoading,
    error,
    selectedTab,
    setSelectedTab,
    selectedBoardStickerId,
    stickerCatalog: STICKER_CATALOG_MOCK,
    fetchBoardDetail,
    handleAddSticker,
    handleDeleteSticker,
    handleSelectSticker,
    getSelectedSticker,
  };
}