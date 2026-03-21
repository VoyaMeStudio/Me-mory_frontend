import React, { useEffect } from "react";
import { Animated, StyleSheet, Text } from "react-native";

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
    <Animated.View style={[styles.toast, { opacity }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 110,
    alignSelf: "center",
    backgroundColor: "#5F5848",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    zIndex: 30,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
});