import type { BoardThemeId } from "@/types/board";

export const BOARD_THEME_OPTIONS: {
  id: BoardThemeId;
  label: string;
}[] = [
  { id: 1, label: "칠판" },
  { id: 2, label: "코르크" },
  { id: 3, label: "체크" },
  { id: 4, label: "빈티지" },
];

export const BOARD_THEME_LABEL_MAP: Record<BoardThemeId, string> = {
  1: "칠판",
  2: "코르크",
  3: "체크",
  4: "빈티지",
};