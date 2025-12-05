// GnbTabBar.tsx
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import { gnbIcons } from "@/components/common/GnbIcons";
import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";

export type GnbTab = "home" | "record" | "board";

interface GnbTabBarProps {
  activeTab: GnbTab;
  onTabPress: (tab: GnbTab) => void;
}

export const GnbTabBar: React.FC<GnbTabBarProps> = ({
  activeTab,
  onTabPress,
}) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <GnbItem
          tabKey="home"
          label="모음"
          isActive={activeTab === "home"}
          onPress={() => onTabPress("home")}
          style={{ marginRight: 95 }} 
        />
        <GnbItem
          tabKey="record"
          label="기록하기"
          isActive={activeTab === "record"}
          onPress={() => onTabPress("record")}
          style={{ marginRight: 95 }} 
        />
        <GnbItem
          tabKey="board"
          label="보드"
          isActive={activeTab === "board"}
          onPress={() => onTabPress("board")}
        />
      </View>
    </View>
  );
};

type GnbIconKey = keyof typeof gnbIcons;

interface GnbItemProps {
  tabKey: GnbIconKey;
  label: string;
  isActive: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

const GnbItem: React.FC<GnbItemProps> = ({
  tabKey,
  label,
  isActive,
  onPress,
  style,
}) => {
  const iconSource = isActive
    ? gnbIcons[tabKey].active
    : gnbIcons[tabKey].inactive;

  const textColor = isActive ? Colors.selected : Colors.unselected;

  return (
    <TouchableOpacity
      style={[styles.item, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image source={iconSource} style={styles.icon} />
      <Text
        style={[
          typography.body2_18_regular,
          { color: textColor, marginTop: 4 },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({

  wrapper: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  
  height: 100,
  paddingTop: 12,
  paddingBottom: 34,
  paddingHorizontal: 24,

  backgroundColor: Colors.primary150,
  borderTopLeftRadius: 15,
  borderTopRightRadius: 15,
  overflow: "hidden",

  flexDirection: "column",
  justifyContent: "flex-end", 
  alignItems: "center",

  shadowColor: "#000",
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 4,
},

  container: {
    flexDirection: "row",
    alignItems: "center",
  },

  item: {
    alignItems: "center",
  },

  icon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
});

export default GnbTabBar;
