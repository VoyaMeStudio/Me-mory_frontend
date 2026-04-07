import { typography } from "@/styles/typography";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import BackIcon from "@/assets/images/back_button.svg";
import SettingsIcon from "@/assets/images/Settings.svg";

type Props = {
  title?: string;
  onPressBack?: () => void;
  onPressSettings?: () => void;
};

export default function MypageHeader({
  title = "마이페이지",
  onPressBack,
  onPressSettings,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.leftGroup}>
        <Pressable
          onPress={onPressBack}
          hitSlop={12}
          style={styles.iconButton}
        >
          <BackIcon width={24} height={24} />
        </Pressable>

        <Text style={styles.title}>{title}</Text>
      </View>

      <Pressable
        onPress={onPressSettings}
        hitSlop={12}
        style={styles.iconButton}
      >
        <SettingsIcon width={24} height={24} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...typography.head6_18_regular,
    marginLeft: 4,
    marginTop:5,
    color: "#161616",
    fontSize: 26,
  },
});