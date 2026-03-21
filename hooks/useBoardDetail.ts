import { deleteBoard, getBoardDetail } from "@/api/board";
import type { BoardDetailResponse } from "@/types/board";
import { useCallback, useEffect, useState } from "react";

export default function useBoardDetail(boardId: number) {
  const [board, setBoard] = useState<BoardDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBoardDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getBoardDetail(boardId);
      setBoard(data);
    } catch (e) {
      console.error("[useBoardDetail] fetchBoardDetail error:", e);
      setError("보드 상세 정보를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  const handleDeleteBoard = useCallback(async () => {
    try {
      setIsDeleting(true);
      await deleteBoard(boardId);
      return true;
    } catch (e) {
      console.error("[useBoardDetail] deleteBoard error:", e);
      setError("보드를 삭제하지 못했습니다.");
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [boardId]);

  useEffect(() => {
    fetchBoardDetail();
  }, [fetchBoardDetail]);

  return {
    board,
    isLoading,
    isDeleting,
    error,
    fetchBoardDetail,
    handleDeleteBoard,
    setBoard,
  };
}