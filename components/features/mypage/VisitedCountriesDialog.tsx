import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
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

export default function VisitedCountriesDialog({
  visible,
  countries,
  onClose,
  userName,
}: Props) {
  const leftColumn = countries.filter((_, index) => index % 2 === 0);
  const rightColumn = countries.filter((_, index) => index % 2 === 1);

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
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.columns}>
                <View style={styles.column}>{renderColumn(leftColumn)}</View>
                <View style={styles.column}>{renderColumn(rightColumn)}</View>
              </View>
            </ScrollView>

            <View style={styles.fakeScrollBarTrack}>
              <View style={styles.fakeScrollBarThumb} />
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
    maxWidth: 340,
    minHeight: 320,
    maxHeight: 420,
    backgroundColor: "#FFFDF9",
    borderRadius: 24,
    paddingTop: 24,
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
    color: Colors.grey900,
    marginTop: 8,
  },
  countText: {
    ...typography.body4_14_regular,
    textAlign: "center",
    color: Colors.grey600,
    marginTop: 6,
    marginBottom: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#D9D0C5",
    marginBottom: 14,
  },
  listContainer: {
    flexDirection: "row",
  },
  scrollContent: {
    paddingRight: 16,
    paddingBottom: 8,
  },
  columns: {
    flexDirection: "row",
    columnGap: 20,
  },
  column: {
    width: 100,
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
    color: Colors.grey800,
    fontSize: 12,
  },
  fakeScrollBarTrack: {
    width: 4,
    borderRadius: 999,
    backgroundColor: "#EFE8DE",
    marginLeft: 2,
    marginTop: 4,
    marginBottom: 4,
  },
  fakeScrollBarThumb: {
    width: 4,
    height: 56,
    borderRadius: 999,
    backgroundColor: "#D8CFC2",
    marginTop: 24,
  },
});