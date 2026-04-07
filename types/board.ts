export type BoardThemeId = 1 | 2 | 3 | 4;

export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

export type BoardListItemResponse = {
  boardId: number;
  title: string;
  boardThemeId: BoardThemeId;
  createdAt: string;
  updatedAt: string;
  stickerCount: number;
  stickerUrls: string[];
};

export type CreateBoardRequest = {
  title: string;
  boardThemeId: BoardThemeId;
};

export type CreateBoardResponse = {
  boardId: number;
  title: string;
  boardThemeId: BoardThemeId;
  createdAt: string;
  updatedAt: string;
};

export type BoardStickerResponse = {
  boardStickerId: number;
  stickerId: number;
  imageUrl: string;
  posX: number;
  posY: number;
  rotation: number;
};

export type BoardDetailResponse = {
  boardId: number;
  title: string;
  boardThemeId: BoardThemeId;
  thumbnailUrl: string;
  createdAt: string;
  updatedAt: string;
  stickers: BoardStickerResponse[];
};

export type AddBoardStickerRequest = {
  posX: number;
  posY: number;
  rotation: number;
};

export type StickerCatalogItem = {
  id: number;
  imageUrl: string;
};

export interface StickerData {
  stickerId: number;
  name: string;
  imageUrl: string;
}

export interface GetStickersResponse {
  stickers: StickerData[];
}