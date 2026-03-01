// StackScreen.tsx
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";

import GlobeIllust from "@/assets/images/globe.svg";
import StackCard, { StackCardItem } from "@/components/features/stack/StackCard";
import StackFab from "@/components/features/stack/StackFab";

export default function StackScreen() {
  const [openAdd, setOpenAdd] = useState(false);

  const { contentW } = useMemo(() => {
    const screenW = Dimensions.get("window").width;
    const PADDING_H = 24;
    return { contentW: screenW - PADDING_H * 2 };
  }, []);


  const data: StackCardItem[] = useMemo(
    () => [
      {
        id: "1",
        title: "여행명 공백포함 최대 12자 (2일 이하)",
        dateText: "2026.00.00 ~ 2026.00.00",
        height: 62,
        emotionColor: "#F5C7CF",
      },
      {
        id: "2",
        title: "여행명 공백포함 최대 12자 (4일 이하)",
        dateText: "2026.00.00 ~ 2026.00.00",
        height: 70,
        emotionColor: "#BFD9C8",
      },
      {
        id: "3",
        title: "여행명 공백포함 최대 12자 (7일 이하)",
        dateText: "2026.00.00 ~ 2026.00.00",
        height: 78,
        emotionColor: "#76B7D6",
      },
      {
        id: "4",
        title: "여행명 공백포함 최대 12자 (30일 이하)",
        dateText: "2026.00.00 ~ 2026.00.00",
        height: 94,
        emotionColor: "#F2B8C0",
      },
      {
        id: "5",
        title: "여행명 공백포함 최대 12자 (내일 이하)",
        dateText: "2026.00.00 ~ 2026.00.00",
        height: 86,
        emotionColor: "#5B4B7A",
      },
      {
        id: "6",
        title: "여행명 공백포함 최대 12자 (90일 이하)",
        dateText: "2026.00.00 ~ 2026.00.00",
        height: 102,
        emotionColor: "#7B5A57",
      },
      {
        id: "7",
        title: "여행명 공백포함 최대 12자 (180일 이하)",
        dateText: "2026.00.00 ~ 2026.00.00",
        height: 110,
        emotionColor: "#7A0018",
      },
    ],
    []
  );

  const OVERLAP = 18;
  const STACK_OFFSET = 22;

  return (
    <SafeAreaView style={styles.container}>
  
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.paperBg} />
        <View style={styles.paperOverlay} />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.topWrap}>
            <GlobeIllust width={92} height={92} />
            <Text style={styles.summaryText}>
              오늘까지 총 <Text style={styles.summaryStrong}>42일</Text>을 여행 했습니다!
            </Text>
            <View style={{ height: 16 }} />
          </View>
        }
        renderItem={({ item, index }) => {
          const isLeft = index % 2 === 0;

          const mt = index === 0 ? 0 : -OVERLAP;

          const layer = 1000 - index;


          const shiftX = isLeft ? -STACK_OFFSET / 2 : STACK_OFFSET / 2;

          return (
            <View
              style={{
                marginTop: mt,
                position: "relative",
                zIndex: layer,
                elevation: layer, 
                alignItems: "center",
              }}
            >
              <StackCard
                item={item}
                contentW={contentW}
                side={isLeft ? "left" : "right"} 
                style={{
                  transform: [{ translateX: shiftX }], 
                }}
              />
            </View>
          );
        }}
        ListFooterComponent={<View style={{ height: 140 }} />}
      />

      <StackFab onPress={() => setOpenAdd(true)} />

      <Modal
        transparent
        animationType="fade"
        visible={openAdd}
        onRequestClose={() => setOpenAdd(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setOpenAdd(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>과거 여행 추가</Text>
            <Text style={styles.modalDesc}>
              다음 이슈에서 여행명, 날짜, 국가, 감정색 입력 폼을 연결합니다.
            </Text>
            <Pressable style={styles.modalBtn} onPress={() => setOpenAdd(false)}>
              <Text style={styles.modalBtnText}>닫기</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors?.primary50 ?? "#F7F5F0" },

  paperBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors?.primary50 ?? "#F7F5F0",
  },
  paperOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    opacity: 0.18,
  },

  listContent: {
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 140,
  },

  topWrap: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 14,
    gap: 10,
  },

  summaryText: {
    ...typography.body4_14_regular,
    color: Colors?.grey700 ?? "#6B665B",
  },
  summaryStrong: {
    ...typography.sub1_14_medium,
    color: Colors?.grey900 ?? "#2E2A24",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    padding: 18,
  },
  modalTitle: {
    ...typography.head6_18_regular,
    color: Colors?.grey900 ?? "#2E2A24",
    marginBottom: 8,
  },
  modalDesc: {
    ...typography.body4_14_regular,
    color: Colors?.grey600 ?? "#777166",
    marginBottom: 14,
  },
  modalBtn: {
    alignSelf: "flex-end",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Colors?.grey100 ?? "#EFECE6",
  },
  modalBtnText: {
    ...typography.sub1_14_medium,
    color: Colors?.grey800 ?? "#3E3A32",
  },
});