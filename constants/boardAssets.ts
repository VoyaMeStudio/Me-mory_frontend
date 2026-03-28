import type { BoardThemeId } from "@/types/board";

import BoardView1 from "@/assets/images/board_view.svg";
import BoardView2 from "@/assets/images/board_view2.svg";
import BoardView3 from "@/assets/images/board_view3.svg";
import BoardView4 from "@/assets/images/board_view4.svg";

export const BOARD_VIEW_SVG_MAP: Record<
  BoardThemeId,
  React.ComponentType<{ width?: number | string; height?: number | string }>
> = {
  1: BoardView1,
  2: BoardView2,
  3: BoardView3,
  4: BoardView4,
};
export const STICKER_CATALOG_MOCK = [
  {
    id: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 4,
    imageUrl:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=400&auto=format&fit=crop",
  },
];