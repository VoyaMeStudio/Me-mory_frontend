import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";

import GlobeIllust from "@/assets/images/globe.svg";
import StackCard from "@/components/features/stack/StackCard";
import StackFab from "@/components/features/stack/StackFab";

import AddPreviousTripModal from "@/components/features/modals/AddPreviousTripModal";
import TripDetailModal from "@/components/features/modals/TripDetailModal";

import { PreviousTrip } from "@/components/features/stack.types";
import { diffDaysInclusive, tripToStackCardItem } from "@/components/features/stack.utils";

export default function StackScreen() {
  const insets = useSafeAreaInsets();

  const [openAdd, setOpenAdd] = useState(false);

  useEffect(() => {
    console.log("[StackScreen] openAdd =", openAdd);
  }, [openAdd]);

  const [previousTrips, setPreviousTrips] = useState<PreviousTrip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [editTrip, setEditTrip] = useState<PreviousTrip | null>(null);

  const { contentW } = useMemo(() => {
    const screenW = Dimensions.get("window").width;
    const PADDING_H = 24;
    return { contentW: screenW - PADDING_H * 2 };
  }, []);

  const activeTrips = useMemo(() => previousTrips.filter((t) => !t.isArchived), [previousTrips]);

  const stackItems = useMemo(() => {
    const sorted = [...activeTrips].sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    return sorted.map(tripToStackCardItem);
  }, [activeTrips]);

  const selectedTrip = useMemo(() => {
    if (!selectedTripId) return undefined;
    return previousTrips.find((t) => t.id === selectedTripId);
  }, [selectedTripId, previousTrips]);

  const totalDays = useMemo(() => {
    return activeTrips.reduce((sum, t) => sum + diffDaysInclusive(t.startDate, t.endDate), 0);
  }, [activeTrips]);

  const CARD_GAP = 0;     
  const Z_LAYER_BASE = 200; 

  const STACK_OFFSET = 60;
  const SHIFT_X = STACK_OFFSET / 2;

  const FAB_BOTTOM_GAP = 18;
  const TAB_SAFE_SPACE = 92;
  const fabBottom = insets.bottom + TAB_SAFE_SPACE + FAB_BOTTOM_GAP;

  const upsertTrip = (trip: PreviousTrip) => {
    setPreviousTrips((prev) => {
      const idx = prev.findIndex((x) => x.id === trip.id);
      if (idx === -1) return [trip, ...prev];
      const next = [...prev];
      next[idx] = trip;
      return next;
    });
  };

  const archiveTrip = (id: string) => {
    setPreviousTrips((prev) => prev.map((t) => (t.id === id ? { ...t, isArchived: true } : t)));
  };

  const deleteTrip = (id: string) => {
    setPreviousTrips((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.paperBg} />
        <View style={styles.paperOverlay} />
      </View>

      <FlatList
        data={stackItems}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: fabBottom + 90 }]}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.topWrap}>
            <GlobeIllust width={92} height={92} />
            <Text style={styles.summaryText}>
              오늘까지 총 <Text style={styles.summaryStrong}>{totalDays}일</Text>을 여행 했습니다!
            </Text>
            <View style={{ height: 6 }} />
          </View>
        }
        renderItem={({ item, index }) => {
          const isLeft = index % 2 === 0;
          const shiftX = isLeft ? -SHIFT_X : SHIFT_X;

          return (
            <View
              style={{
                marginTop: index === 0 ? 0 : CARD_GAP,
                position: "relative",
                zIndex: Z_LAYER_BASE - index,
                elevation: Z_LAYER_BASE - index,
                alignItems: "center",
              }}
            >
              <StackCard
                item={item}
                contentW={contentW}
                side={isLeft ? "left" : "right"}
                style={{ transform: [{ translateX: shiftX }] }}
                onPress={() => setSelectedTripId(item.id)}
              />
            </View>
          );
        }}
      />

      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <View style={[styles.fabWrap, { bottom: fabBottom }]}>
          <StackFab
            onPress={() => {
              console.log("[StackScreen] FAB pressed");
              setOpenAdd(true);
            }}
          />
        </View>
      </View>

      <AddPreviousTripModal
        visible={openAdd}
        mode="create"
        onClose={() => setOpenAdd(false)}
        onSubmit={(trip) => upsertTrip(trip)}
      />

      <AddPreviousTripModal
        visible={!!editTrip}
        mode="edit"
        initial={editTrip ?? undefined}
        onClose={() => setEditTrip(null)}
        onSubmit={(trip) => upsertTrip(trip)}
      />

      <TripDetailModal
        visible={!!selectedTripId}
        trip={selectedTrip}
        onClose={() => setSelectedTripId(null)}
        onEdit={(trip) => {
          setSelectedTripId(null);
          requestAnimationFrame(() => setEditTrip(trip));
        }}
        onArchive={(id) => archiveTrip(id)}
        onDelete={(id) => deleteTrip(id)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors?.primary50 ?? "#F7F5F0" },

  paperBg: { ...StyleSheet.absoluteFillObject, backgroundColor: Colors?.primary50 ?? "#F7F5F0" },
  paperOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "#FFFFFF", opacity: 0.18 },

  listContent: { paddingTop: 12, paddingHorizontal: 24, paddingBottom: 24 },

  topWrap: { alignItems: "center", marginTop: 8, marginBottom: 14, gap: 10 },

  summaryText: { ...typography.body4_14_regular, color: Colors?.grey700 ?? "#6B665B" },
  summaryStrong: { ...typography.sub1_14_medium, color: Colors?.grey900 ?? "#2E2A24" },

  fabWrap: {
    position: "absolute",
    right: 24,
  },
});