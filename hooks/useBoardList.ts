import { createBoard, getBoards } from "@/api/board";
import type { BoardListItemResponse, BoardThemeId } from "@/types/board";
import { useCallback, useEffect, useState } from "react";

export default function useBoardList() {
  const [boards, setBoards] = useState<BoardListItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBoards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getBoards();
      setBoards(data);
    } catch (e) {
      console.error("[useBoardList] fetchBoards error:", e);
      setError("보드 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreateBoard = useCallback(
    async (title: string, boardThemeId: BoardThemeId) => {
      try {
        setIsCreating(true);
        await createBoard({ title, boardThemeId });
        await fetchBoards();
        return true;
      } catch (e) {
        console.error("[useBoardList] createBoard error:", e);
        setError("보드를 생성하지 못했습니다.");
        return false;
      } finally {
        setIsCreating(false);
      }
    },
    [fetchBoards]
  );

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  return {
    boards,
    isLoading,
    isCreating,
    error,
    fetchBoards,
    handleCreateBoard,
  };
}