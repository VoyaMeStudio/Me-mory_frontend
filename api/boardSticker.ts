import axiosInstance from "@/lib/axiosInstance";
import type { AddBoardStickerRequest, ApiResponse } from "@/types/board";

export async function addBoardSticker(
  boardId: number,
  boardStickerId: number,
  body: AddBoardStickerRequest
) {
  const res = await axiosInstance.patch<ApiResponse<{}>>(
    `/api/users/me/boards/${boardId}/stickers/${boardStickerId}`,
    body
  );
  return res.data.data;
}

export async function deleteBoardSticker(boardId: number, boardStickerId: number) {
  const res = await axiosInstance.delete<ApiResponse<{}>>(
    `/api/users/me/boards/${boardId}/stickers/${boardStickerId}`
  );
  return res.data.data;
}