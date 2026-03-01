import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title?: string;
  onPressProfile?: () => void;
};

export default function CollectionHeader({
  title = "모음",
  onPressProfile,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>


      <Pressable
        onPress={onPressProfile}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.profileBtn}
      >
        <Feather name="user" size={22} color={Colors?.grey400 ?? "#B0AAA0"} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 44,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    ...typography.head6_18_regular,
    color: Colors?.grey900 ?? "#2E2A24",
  },

  profileBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});