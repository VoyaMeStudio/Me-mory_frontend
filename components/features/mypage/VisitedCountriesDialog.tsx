import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type CountryItem = {
  countryCode: string;
  countryName: string;
  flag: string;
};

type Props = {
  visible: boolean;
  countries: CountryItem[];
  onClose: () => void;
  userName: string;
};

const LIST_HEIGHT = 146;
const TRACK_HEIGHT = 146;
const TRACK_PADDING = 8;
const THUMB_HEIGHT = 56;

export default function VisitedCountriesDialog({
  visible,
  countries,
  onClose,
  userName,
}: Props) {
  const leftColumn = useMemo(
    () => countries.filter((_, index) => index % 2 === 0),
    [countries]
  );
  const rightColumn = useMemo(
    () => countries.filter((_, index) => index % 2 === 1),
    [countries]
  );

  const [contentHeight, setContentHeight] = useState(1);
  const [layoutHeight, setLayoutHeight] = useState(1);
  const [scrollY, setScrollY] = useState(0);

  const renderColumn = (items: CountryItem[]) => {
    return items.map((item) => (
      <View key={item.countryCode} style={styles.countryRow}>
        <Text style={styles.flag}>{item.flag}</Text>
        <Text style={styles.countryName} numberOfLines={1}>
          {item.countryName}
        </Text>
      </View>
    ));
  };

  const maxScroll = Math.max(contentHeight - layoutHeight, 1);
  const availableThumbTravel =
    TRACK_HEIGHT - TRACK_PADDING * 2 - THUMB_HEIGHT;

  const thumbTranslateY =
    maxScroll <= 0
      ? 0
      : Math.min(
          availableThumbTravel,
          Math.max(0, (scrollY / maxScroll) * availableThumbTravel)
        );

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollY(e.nativeEvent.contentOffset.y);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.overlayTouch} onPress={onClose} />

        <View style={styles.dialog}>
          <Pressable onPress={onClose} hitSlop={10} style={styles.closeButton}>
            <Feather name="x" size={22} color={Colors.grey500} />
          </Pressable>

          <Text style={styles.title}>{userName} 님이 방문한 나라</Text>
          <Text style={styles.countText}>{countries.length}개국</Text>

          <View style={styles.divider} />

          <View style={styles.listContainer}>
            <View style={styles.scrollArea}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                onLayout={(e) => {
                  setLayoutHeight(e.nativeEvent.layout.height);
                }}
                onContentSizeChange={(_, height) => {
                  setContentHeight(height);
                }}
              >
                <View style={styles.columns}>
                  <View style={styles.column}>{renderColumn(leftColumn)}</View>
                  <View style={styles.column}>{renderColumn(rightColumn)}</View>
                </View>
              </ScrollView>

              <LinearGradient
                pointerEvents="none"
                colors={[
                  "rgba(255,253,249,0)",
                  "rgba(255,253,249,0.55)",
                  "rgba(255,253,249,0.88)",
                  "rgba(255,253,249,1)",
                ]}
                style={styles.bottomFade}
              />
            </View>

            <View style={styles.fakeScrollBarTrack}>
              <View
                style={[
                  styles.fakeScrollBarThumb,
                  {
                    transform: [{ translateY: thumbTranslateY }],
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  overlayTouch: {
    ...StyleSheet.absoluteFillObject,
  },

  dialog: {
    width: "100%",
    maxWidth: 296,
    minHeight: 316,
    maxHeight: 420,
    backgroundColor: "#FFFDF9",
    borderRadius: 24,
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 24,
    position: "relative",
  },

  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 2,
  },

  title: {
    ...typography.sub1_14_medium,
    textAlign: "center",
    color: "#3E372D",
    fontSize: 24,
    lineHeight: 32,
    marginTop: 5,
    paddingTop: 2,
  },

  countText: {
    ...typography.body4_14_regular,
    textAlign: "center",
    color: "#827765",
    fontSize: 22,
    lineHeight: 28,
    marginTop: 4,
    marginBottom: 14,
  },

  divider: {
    height: 1,
    backgroundColor: "#D9D0C5",
    marginBottom: 14,
  },

  listContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    height: LIST_HEIGHT,
  },

  scrollArea: {
    flex: 1,
    height: LIST_HEIGHT,
    position: "relative",
  },

  scrollContent: {
    paddingRight: 10,
    paddingBottom: 18,
    alignItems: "center",
  },

  columns: {
    flexDirection: "row",
    columnGap: 54,
    justifyContent: "center",
    alignSelf: "center",
  },

  column: {
    width: 86,
  },

  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  flag: {
    fontSize: 15,
    marginRight: 6,
  },

  countryName: {
    ...typography.body4_14_regular,
    flex: 1,
    color: "#3E372D",
    fontSize: 16,
    lineHeight: 20,
  },

  bottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 34,
  },

  fakeScrollBarTrack: {
    width: 4,
    height: TRACK_HEIGHT,
    borderRadius: 999,
    backgroundColor: "#EFE8DE",
    marginLeft: 6,
    marginTop: 2,
    paddingVertical: TRACK_PADDING,
    overflow: "hidden",
  },

  fakeScrollBarThumb: {
    width: 4,
    height: THUMB_HEIGHT,
    borderRadius: 999,
    backgroundColor: "#F0EAE1",
  },
});