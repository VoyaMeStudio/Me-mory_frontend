import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";

import GlobeIllust from "@/assets/images/globe.svg";
import StackCard from "@/components/features/stack/StackCard";
import StackFab from "@/components/features/stack/StackFab";

import AddPreviousTripModal from "@/components/features/modals/AddPreviousTripModal";
import TripDetailModal from "@/components/features/modals/TripDetailModal";

import type { PreviousTrip } from "@/components/features/stack.types";
import {
  diffDaysInclusive,
  formatDateYMD,
  tripToStackCardItem,
} from "@/components/features/stack.utils";

import {
  createPastTrip,
  deletePastTrip,
  getTimeline,
  storePastTrip,
  updatePastTrip,
} from "@/api/timeline";

import { getEmotions } from "@/api/emotions";
import { timelineTripToPreviousTrip } from "@/components/features/stack/stack.adapter";

export default function StackScreen() {
  const insets = useSafeAreaInsets();

  const [openAdd, setOpenAdd] = useState(false);
  const [loading, setLoading] = useState(false);

  const [previousTrips, setPreviousTrips] = useState<PreviousTrip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [editTrip, setEditTrip] = useState<PreviousTrip | null>(null);

  const { contentW } = useMemo(() => {
    const screenW = Dimensions.get("window").width;
    const PADDING_H = 24;
    return { contentW: screenW - PADDING_H * 2 };
  }, []);

  const activeTrips = useMemo(
    () => previousTrips.filter((t) => !t.isArchived),
    [previousTrips]
  );

  useEffect(() => {
    console.log(
      "[StackScreen] previousTrips emotion:",
      previousTrips.map((t) => ({
        id: t.id,
        emotionId: t.emotionId,
        emotionName: t.emotionName,
        emotionColor: t.emotionColor,
        name: t.tripName,
      }))
    );
  }, [previousTrips]);

  const stackItems = useMemo(() => {
    const sorted = [...activeTrips].sort(
      (a, b) => b.startDate.getTime() - a.startDate.getTime()
    );
    return sorted.map(tripToStackCardItem);
  }, [activeTrips]);

  const selectedTrip = useMemo(() => {
    if (!selectedTripId) return undefined;
    return previousTrips.find((t) => t.id === selectedTripId);
  }, [selectedTripId, previousTrips]);

  const totalDays = useMemo(() => {
    return activeTrips.reduce(
      (sum, t) => sum + diffDaysInclusive(t.startDate, t.endDate),
      0
    );
  }, [activeTrips]);

  const CARD_GAP = 0;
  const Z_LAYER_BASE = 200;
  const STACK_OFFSET = 60;
  const SHIFT_X = STACK_OFFSET / 2;

  const FAB_BOTTOM_GAP = 18;
  const TAB_SAFE_SPACE = 92;
  const fabBottom = insets.bottom + TAB_SAFE_SPACE + FAB_BOTTOM_GAP;

  async function refresh() {
    setLoading(true);
    try {
      const resp = await getTimeline();
      const tripsRaw = resp?.trips ?? [];
      console.log(
        "[StackScreen] tripsRaw[0]:",
        JSON.stringify(tripsRaw?.[0], null, 2)
      );

      const emotions = await getEmotions();

      const emotionByName = new Map(
        emotions.map((e) => [String(e.name).trim(), e])
      );

      const trips: PreviousTrip[] = tripsRaw.map(timelineTripToPreviousTrip);

      const normalized: PreviousTrip[] = trips.map((t) => {
  const emotionName =
    typeof t.emotionName === "string" ? t.emotionName.trim() : "";

  const matched = emotionName ? emotionByName.get(emotionName) : undefined;

  const nextEmotionId =
    typeof t.emotionId === "number" && t.emotionId > 0
      ? t.emotionId
      : matched?.id ?? 0;

  const rawColor =
    typeof t.emotionColor === "string" ? t.emotionColor.trim() : "";

  const isPlaceholderGrey = rawColor.toUpperCase() === "#EEEEEE";

  const nextEmotionColor =
    rawColor && !isPlaceholderGrey
      ? rawColor
      : matched?.colorCode ?? (rawColor || undefined);

  return {
    ...t,
    emotionName: emotionName || t.emotionName,
    emotionId: nextEmotionId,
    emotionColor: nextEmotionColor,
  };
});

      setPreviousTrips(normalized);
    } catch (e) {
      console.log("[StackScreen] refresh error:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(form: PreviousTrip) {
    setLoading(true);
    try {

      if (!form.emotionId || form.emotionId <= 0) {
        console.log("[StackScreen] create blocked: invalid emotionId", form.emotionId);
        return;
      }

      await createPastTrip({
        tripName: form.tripName,
        description: form.description,
        startDate: formatDateYMD(form.startDate),
        endDate: formatDateYMD(form.endDate),
        countryCodes: form.countryCodes ?? [],
        emotionId: form.emotionId,
      });

      setOpenAdd(false);
      await refresh();
    } catch (e) {
      console.log("[StackScreen] createPastTrip error:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(tripId: number, form: PreviousTrip) {
    setLoading(true);
    try {
      if (!form.emotionId || form.emotionId <= 0) {
        console.log("[StackScreen] update blocked: invalid emotionId", form.emotionId);
        return;
      }

      await updatePastTrip(tripId, {
        tripName: form.tripName,
        description: form.description,
        startDate: formatDateYMD(form.startDate),
        endDate: formatDateYMD(form.endDate),
        countryCodes: form.countryCodes ?? [],
        emotionId: form.emotionId,
      });

      setEditTrip(null);
      await refresh();
    } catch (e) {
      console.log("[StackScreen] updatePastTrip error:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(tripId: number) {
    setLoading(true);
    try {
      await deletePastTrip(tripId);
      setSelectedTripId(null);
      setPreviousTrips((prev) => prev.filter((t) => t.id !== tripId));
    } catch (e) {
      console.log("[StackScreen] deletePastTrip error:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleArchive(tripId: number) {
    setLoading(true);
    try {
      await storePastTrip(tripId, true);
      setSelectedTripId(null);
      setPreviousTrips((prev) =>
        prev.map((t) => (t.id === tripId ? { ...t, isArchived: true } : t))
      );
    } catch (e) {
      console.log("[StackScreen] storePastTrip error:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.paperBg} />
        <View style={styles.paperOverlay} />
      </View>

      <FlatList
        data={stackItems}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: fabBottom + 90 },
        ]}
        keyboardShouldPersistTaps="handled"
        refreshing={loading}
        onRefresh={refresh}
        ListHeaderComponent={
          <View style={styles.topWrap}>
            <GlobeIllust width={92} height={92} />
            <Text style={styles.summaryText}>
              오늘까지 총{" "}
              <Text style={styles.summaryStrong}>{totalDays}일</Text>을 여행
              했습니다!
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
                onPress={() => setSelectedTripId(Number(item.id))}
              />
            </View>
          );
        }}
      />

      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <View style={[styles.fabWrap, { bottom: fabBottom }]}>
          <StackFab onPress={() => setOpenAdd(true)} />
        </View>
      </View>

      <AddPreviousTripModal
        visible={openAdd}
        mode="create"
        onClose={() => setOpenAdd(false)}
        onSubmit={handleCreate}
      />

      <AddPreviousTripModal
        visible={!!editTrip}
        mode="edit"
        initial={editTrip ?? undefined}
        onClose={() => setEditTrip(null)}
        onSubmit={(form) => {
          if (!editTrip) return;
          handleUpdate(editTrip.id, form);
        }}
      />

      <TripDetailModal
        visible={!!selectedTripId}
        trip={selectedTrip}
        onClose={() => setSelectedTripId(null)}
        onEdit={(trip) => {
          setSelectedTripId(null);
          requestAnimationFrame(() => setEditTrip(trip));
        }}
        onArchive={(id) => handleArchive(id)}
        onDelete={(id) => handleDelete(id)}
      />
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
  listContent: { paddingTop: 12, paddingHorizontal: 24, paddingBottom: 24 },
  topWrap: { alignItems: "center", marginTop: 8, marginBottom: 14, gap: 10 },
  summaryText: {
    ...typography.body4_14_regular,
    color: Colors?.grey700 ?? "#6B665B",
  },
  summaryStrong: {
    ...typography.sub1_14_medium,
    color: Colors?.grey900 ?? "#2E2A24",
  },
  fabWrap: { position: "absolute", right: 24 },
});