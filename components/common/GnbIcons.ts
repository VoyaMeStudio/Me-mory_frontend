import { ImageSourcePropType } from "react-native";

type GnbIconSet = {
  active: ImageSourcePropType;
  inactive: ImageSourcePropType;
};

export const gnbIcons: Record<"home" | "record" | "board", GnbIconSet> = {
  home: {
    active: require("@/assets/images/home_icon_active.png"),
    inactive: require("@/assets/images/home_icon_inactive.png"),
  },
  record: {
    active: require("@/assets/images/record_icon_active.png"),
    inactive: require("@/assets/images/record_icon_inactive.png"),
  },
  board: {
    active: require("@/assets/images/board_icon_active.png"),
    inactive: require("@/assets/images/board_icon_inactive.png"),
  },
};
