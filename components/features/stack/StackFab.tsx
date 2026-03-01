import RecordAdd from "@/assets/images/record_add.svg";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

type StackFabProps = {
  onPress: () => void;
  right?: number;
  bottom?: number;
  size?: number;
};

export default function StackFab({
  onPress,
  right = 22,
  bottom = 94,
  size = 56,
}: StackFabProps) {
  return (
    <View style={[styles.wrap, { right, bottom }]} pointerEvents="box-none">
      <Pressable
        onPress={onPress}
        style={[
          styles.btn,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <RecordAdd width={size * 0.6} height={size * 0.6} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute" },

  btn: {
    backgroundColor: "rgba(226, 218, 201, 0.95)",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});