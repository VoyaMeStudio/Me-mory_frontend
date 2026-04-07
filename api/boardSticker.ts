import axiosInstance from "@/lib/axiosInstance";
import type {
  AddBoardStickerRequest,
  ApiResponse,
  GetStickersResponse,
  StickerData,
} from "@/types/board";

// 1. 보드에 스티커 붙이기
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

// 2. 보드에서 스티커 삭제
export async function deleteBoardSticker(
  boardId: number,
  boardStickerId: number
) {
  const res = await axiosInstance.delete<ApiResponse<{}>>(
    `/api/users/me/boards/${boardId}/stickers/${boardStickerId}`
  );
  return res.data.data;
}

// 3. AI 스티커 생성 API
export const createAiSticker = async (imageUri: string) => {
  if (!imageUri) {
    throw new Error("이미지 URI가 비어 있습니다.");
  }

  const formData = new FormData();

  const filename = imageUri.split("/").pop() || "image.png";
  const lower = filename.toLowerCase();

  let type = "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
    type = "image/jpeg";
  } else if (lower.endsWith(".webp")) {
    type = "image/webp";
  }

  formData.append(
    "image",
    {
      uri: imageUri,
      name: filename,
      type,
    } as any
  );

  const res = await axiosInstance.post<ApiResponse<StickerData>>(
    "/api/users/me/stickers",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 0, 
    }
  );

  return res.data.data;
};

// 4. 내 스티커 목록 전체 조회
export async function getMyStickers() {
  const res = await axiosInstance.get<ApiResponse<GetStickersResponse>>(
    "/api/users/me/stickers"
  );

  return res.data.data;
}