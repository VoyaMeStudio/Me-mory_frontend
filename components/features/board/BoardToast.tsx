import { typography } from "@/styles/typography";
import React, { useEffect } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  message: string;
  onHide: () => void;
};

export default function BoardToast({ visible, message, onHide }: Props) {
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.delay(1600),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  }, [visible, opacity, onHide]);

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={styles.wrapper}>
      <Animated.View style={[styles.toast, { opacity }]}>
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 110,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 30,
  },

  toast: {
    width: 296,
    paddingVertical: 7,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: "rgba(62, 55, 45, 0.80)",
    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    ...typography.body4_14_regular,
    fontSize:20,
    color: "#FEFEFE",
    lineHeight: 20,
    textAlign: "center",
  },
});