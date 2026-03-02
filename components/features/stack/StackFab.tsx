// StackFab.tsx
import React from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import AddPreviousIcon from "@/assets/images/addprevious.svg";

type Props = {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  size?: number;
};

export default function StackFab({ onPress, style, size = 56 }: Props) {
  const handlePress = () => {
    console.log("[StackFab] pressed");

    if (onPress) {
      console.log("[StackFab] calling parent onPress");
      onPress();
    } else {
      console.log("[StackFab] parent onPress NOT PROVIDED");
    }
  };

  return (
    <Pressable
      onPressIn={() => console.log("[StackFab] pressIn")}
      onPress={handlePress}
      hitSlop={20}
      style={({ pressed }) => [
        styles.wrapper,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.iconWrap}>
        <AddPreviousIcon width={size} height={size} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
  },

  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.7,
  },
});