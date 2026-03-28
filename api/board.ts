import axiosInstance from "@/lib/axiosInstance";
import type {
  ApiResponse,
  BoardDetailResponse,
  BoardListItemResponse,
  CreateBoardRequest,
  CreateBoardResponse,
} from "@/types/board";

export async function getBoards() {
  const res = await axiosInstance.get<ApiResponse<{ boards: BoardListItemResponse[] }>>(
    "/api/users/me/boards"
  );
  return res.data.data.boards;
}

export async function createBoard(body: CreateBoardRequest) {
  const res = await axiosInstance.post<ApiResponse<CreateBoardResponse>>(
    "/api/users/me/boards",
    body
  );
  return res.data.data;
}

export async function getBoardDetail(boardId: number) {
  const res = await axiosInstance.get<ApiResponse<BoardDetailResponse>>(
    `/api/users/me/boards/${boardId}`
  );
  return res.data.data;
}

export async function deleteBoard(boardId: number) {
  const res = await axiosInstance.delete<ApiResponse<{}>>(
    `/api/users/me/boards/${boardId}`
  );
  return res.data.data;
}

export async function updateBoardStickers(boardId: number, stickers: any[]) {
  const payload = {
    stickers: stickers.map((s) => ({
      boardStickerId: s.boardStickerId,
      stickerId: s.stickerId,
      x: s.x,
      y: s.y,
      rotation: s.rotation,
      scale: s.scale,
      zIndex: s.zIndex,
    })),
  };
  const res = await axiosInstance.put<ApiResponse<{}>>(
    `/api/v1/boards/${boardId}/stickers`, 
    payload
  );
  return res.data.data;
}