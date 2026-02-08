import { Platform, StyleSheet } from "react-native";

const FONT = {
  nanum: "Nanum",
  pretendard: "Pretendard",
};

export const typography = StyleSheet.create({
  /** ----------------------- Head ----------------------- **/
  head1_28_regular: {
    fontFamily: FONT.nanum,
    fontSize: 28,
    fontWeight: "400",
    lineHeight: 28,
    letterSpacing: -0.28,
  },
  head1_28_bold: {
    fontFamily: FONT.nanum,
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 28,
    letterSpacing: -0.28,
  },
  head1_28_bold_stroke: {
    fontFamily: FONT.nanum,
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 28,
    letterSpacing: -0.28,
    ...(Platform.OS === "ios" && {
      textShadowColor: "#000",
      textShadowRadius: 0.1,
      textShadowOffset: { width: 0, height: 0 },
    }),
  },

  head2_26_regular: {
    fontFamily: FONT.nanum,
    fontSize: 26,
    fontWeight: "400",
    lineHeight: 26,
    letterSpacing: -0.26,
  },
  head2_26_bold_stroke: {
    fontFamily: FONT.nanum,
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 26,
    letterSpacing: -0.26,
    ...(Platform.OS === "ios" && {
      textShadowColor: "#000",
      textShadowRadius: 0.2,
      textShadowOffset: { width: 0, height: 0 },
    }),
  },

  head3_24_regular: {
    fontFamily: FONT.nanum,
    fontSize: 24,
    fontWeight: "400",
    lineHeight: 24,
    letterSpacing: -0.24,
  },
  head3_24_bold_stroke: {
    fontFamily: FONT.nanum,
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 24,
    letterSpacing: -0.24,
    ...(Platform.OS === "ios" && {
      textShadowColor: "#000",
      textShadowRadius: 0.2,
      textShadowOffset: { width: 0, height: 0 },
    }),
  },

  head4_22_regular: {
    fontFamily: FONT.nanum,
    fontSize: 22,
    fontWeight: "400",
    lineHeight: 22,
    letterSpacing: -0.22,
  },

  head5_20_regular: {
    fontFamily: FONT.nanum,
    fontSize: 20,
    fontWeight: "400",
    lineHeight: 20,
    letterSpacing: -0.2,
  },

  head6_18_regular: {
    fontFamily: FONT.nanum,
    fontSize: 18,
    fontWeight: "400",
    lineHeight: 18,
    letterSpacing: -0.18,
  },

  /** ----------------------- Body ----------------------- **/
  body1_20_regular: {
    fontFamily: FONT.nanum,
    fontSize: 20,
    fontWeight: "400",
    lineHeight: 24,
    letterSpacing: -0.2,
  },

  body2_18_regular: {
    fontFamily: FONT.nanum,
    fontSize: 18,
    fontWeight: "400",
    lineHeight: 20,
    letterSpacing: -0.18,
  },

  body3_16_regular: {
    fontFamily: FONT.nanum,
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 20,
    letterSpacing: -0.16,
  },

  body4_14_regular: {
    fontFamily: FONT.nanum,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
    letterSpacing: -0.14,
  },

  /** ----------------------- Sub ----------------------- **/
  sub1_14_medium: {
    fontFamily: FONT.nanum,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 16,
    letterSpacing: -0.14,
  },

  sub2_12_regular: {
    fontFamily: FONT.nanum,
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 14,
    letterSpacing: -0.12,
  },

  sub3_9_bold: {
    fontFamily: FONT.nanum,
    fontSize: 9,
    fontWeight: "700",
    lineHeight: 12,
    letterSpacing: -0.09,
  },
});

export const shadowStyle = {
  shadowColor: "rgba(228, 230, 231, 1)",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 1,
  shadowRadius: 8,
  elevation: 4,
};