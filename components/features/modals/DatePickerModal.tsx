import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { FlatList as FlatListType } from "react-native";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  initialStartDate: Date;
  initialEndDate: Date;
  minDate?: Date;
  maxDate?: Date;
  onClose: () => void;
  onConfirmRange: (start: Date, end: Date) => void;
};

const WEEK = ["S", "M", "T", "W", "T", "F", "S"];

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function clampDate(d: Date, min?: Date, max?: Date) {
  const t = d.getTime();
  if (min && t < startOfDay(min).getTime()) return startOfDay(min);
  if (max && t > startOfDay(max).getTime()) return startOfDay(max);
  return d;
}
function ymd(d: Date) {
  return { y: d.getFullYear(), m: d.getMonth(), day: d.getDate() };
}
function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}
function startWeekday(y: number, m: number) {
  return new Date(y, m, 1).getDay();
}
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const WHEEL_ITEM_H = 36;
const WHEEL_PAD_ITEMS = 3;
const WHEEL_VISIBLE = 5;

type WheelItem<T> = T | null;

export default function DatePickerOverlay({
  visible,
  initialStartDate,
  initialEndDate,
  minDate,
  maxDate,
  onClose,
  onConfirmRange,
}: Props) {
  const [start, setStart] = useState<Date>(startOfDay(initialStartDate));
  const [end, setEnd] = useState<Date>(startOfDay(initialEndDate));

  const [viewDate, setViewDate] = useState<Date>(() => startOfDay(initialStartDate));
  const [wheelOpen, setWheelOpen] = useState(false);

  const [phase, setPhase] = useState<"pickStart" | "pickEnd">("pickStart");

  const TODAY_COLOR = "#827765";
  const today = useMemo(() => startOfDay(new Date()), []);

  useEffect(() => {
    if (!visible) return;

    const s0 = clampDate(startOfDay(initialStartDate), minDate, maxDate);
    const e0 = clampDate(startOfDay(initialEndDate), minDate, maxDate);
    const ordered = e0.getTime() < s0.getTime() ? [e0, s0] : [s0, e0];

    setStart(ordered[0]);
    setEnd(ordered[1]);
    setViewDate(ordered[0]);
    setWheelOpen(false);

    setPhase("pickStart");
  }, [visible, initialStartDate, initialEndDate, minDate, maxDate]);

  const { y, m } = useMemo(() => ymd(viewDate), [viewDate]);

  const goMonth = (delta: number) => {
    const next = new Date(y, m + delta, 1);
    setViewDate(next);
  };

  const isDisabledDay = (d: Date) => {
    const t = startOfDay(d).getTime();
    if (minDate && t < startOfDay(minDate).getTime()) return true;
    if (maxDate && t > startOfDay(maxDate).getTime()) return true;
    return false;
  };

  const grid = useMemo(() => {
    const first = startWeekday(y, m);
    const dim = daysInMonth(y, m);
    const cells: Array<{ type: "empty" | "day"; date?: Date }> = [];
    for (let i = 0; i < first; i++) cells.push({ type: "empty" });
    for (let d = 1; d <= dim; d++) cells.push({ type: "day", date: new Date(y, m, d) });
    while (cells.length < 42) cells.push({ type: "empty" });
    return cells;
  }, [y, m]);

  const range = useMemo(() => {
    const s = startOfDay(start);
    const e = startOfDay(end);
    const st = Math.min(s.getTime(), e.getTime());
    const en = Math.max(s.getTime(), e.getTime());
    return { s: new Date(st), e: new Date(en), st, en };
  }, [start, end]);

  const isInRange = (d: Date) => {
    const t = startOfDay(d).getTime();
    return t >= range.st && t <= range.en;
  };
  const isStart = (d: Date) => isSameDay(d, range.s);
  const isEnd = (d: Date) => isSameDay(d, range.e);

  const onPickDay = (d: Date) => {
    if (wheelOpen) setWheelOpen(false);

    const picked = startOfDay(d);
    if (isDisabledDay(picked)) return;

    if (phase === "pickStart") {
      setStart(picked);
      setEnd(picked);
      setPhase("pickEnd");
      return;
    }

    const s = startOfDay(start);
    const ordered = picked.getTime() < s.getTime() ? [picked, s] : [s, picked];

    setStart(ordered[0]);
    setEnd(ordered[1]);

    onConfirmRange(ordered[0], ordered[1]);
    onClose();

    setPhase("pickStart");
  };

  const years = useMemo(() => {
    const nowY = new Date().getFullYear();
    const startY = (minDate?.getFullYear() ?? nowY - 10) - 2;
    const endY = (maxDate?.getFullYear() ?? nowY + 10) + 2;
    const arr: number[] = [];
    for (let yy = startY; yy <= endY; yy++) arr.push(yy);
    return arr;
  }, [minDate, maxDate]);

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  const [wheelY, setWheelY] = useState(y);
  const [wheelM, setWheelM] = useState(m + 1);

  useEffect(() => {
    if (!visible) return;
    setWheelY(y);
    setWheelM(m + 1);
  }, [visible, y, m]);

  const yearWheelData = useMemo<WheelItem<number>[]>(() => {
    return [
      ...Array.from({ length: WHEEL_PAD_ITEMS }, () => null),
      ...years,
      ...Array.from({ length: WHEEL_PAD_ITEMS }, () => null),
    ];
  }, [years]);

  const monthWheelData = useMemo<WheelItem<number>[]>(() => {
    return [
      ...Array.from({ length: WHEEL_PAD_ITEMS }, () => null),
      ...months,
      ...Array.from({ length: WHEEL_PAD_ITEMS }, () => null),
    ];
  }, [months]);

  const yearListRef = useRef<FlatListType<WheelItem<number>> | null>(null);
  const monthListRef = useRef<FlatListType<WheelItem<number>> | null>(null);

  const selectedCenterIndex = Math.floor(WHEEL_VISIBLE / 2);

  const getWheelItemLayout = (
    data: ArrayLike<WheelItem<number>> | null | undefined,
    index: number
  ) => ({
    length: WHEEL_ITEM_H,
    offset: WHEEL_ITEM_H * index,
    index,
  });

  const safeScrollToValue = (
    ref: React.RefObject<FlatListType<WheelItem<number>> | null>,
    data: WheelItem<number>[],
    value: number
  ) => {
    const realIndex = data.findIndex((v) => v === value);
    const targetIndex = realIndex < 0 ? WHEEL_PAD_ITEMS : realIndex;
    const startIndex = clamp(
      targetIndex - selectedCenterIndex,
      0,
      Math.max(0, data.length - 1)
    );

    ref.current?.scrollToIndex({ index: startIndex, animated: false });
  };

  useEffect(() => {
    if (!visible) return;
    if (!wheelOpen) return;

    requestAnimationFrame(() => {
      safeScrollToValue(yearListRef, yearWheelData, wheelY);
      safeScrollToValue(monthListRef, monthWheelData, wheelM);
    });
  }, [wheelOpen, visible, yearWheelData, monthWheelData, wheelY, wheelM]);

  const onWheelEnd =
    (kind: "year" | "month", data: WheelItem<number>[]) =>
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = e.nativeEvent.contentOffset.y;
      const rawIndex = Math.round(offset / WHEEL_ITEM_H);
      const centerIndex = rawIndex + selectedCenterIndex;
      const picked = data[clamp(centerIndex, 0, data.length - 1)];
      if (picked == null) return;

      if (kind === "year") setWheelY(picked);
      else setWheelM(picked);
    };

  useEffect(() => {
    if (!wheelOpen) return;
    setViewDate(new Date(wheelY, wheelM - 1, 1));
  }, [wheelY, wheelM, wheelOpen]);

  const monthTextTop = `${y}년`;
  const monthTextBottom = `${m + 1}월`;

  const PRIMARY_700 = Colors?.primary700 ?? "#2F5BFF";
  const PRIMARY_150 = Colors?.primary150 ?? "#DDE7FF";
  const WEEK_BG = PRIMARY_150;

  if (!visible) return null;

  return (
    <View style={styles.absoluteFill}>
      <Pressable style={styles.overlayBackdrop} onPress={onClose} />

      <View style={styles.center} pointerEvents="box-none">
        <View style={styles.popup}>
          <View style={styles.calendarTop}>
            <Pressable
              onPress={() => {
                if (wheelOpen) setWheelOpen(false);
                goMonth(-1);
              }}
              style={styles.arrowBtn}
              hitSlop={10}
            >
              <Text style={styles.arrowText}>‹</Text>
            </Pressable>

            <Pressable onPress={() => setWheelOpen((v) => !v)} style={styles.monthCenterBtn}>
              <Text style={styles.monthYear}>{monthTextTop}</Text>
              <Text style={styles.monthMonth}>{monthTextBottom}</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                if (wheelOpen) setWheelOpen(false);
                goMonth(+1);
              }}
              style={styles.arrowBtn}
              hitSlop={10}
            >
              <Text style={styles.arrowText}>›</Text>
            </Pressable>
          </View>

          <View style={[styles.weekRowWrap, { backgroundColor: WEEK_BG }]}>
            <View style={styles.weekRow}>
              {WEEK.map((w, i) => (
                <Text key={`${w}-${i}`} style={styles.weekText}>
                  {w}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.grid}>
            {grid.map((c, idx) => {
              if (c.type === "empty") return <View key={`e-${idx}`} style={styles.cell} />;

              const d = c.date!;
              const disabled = isDisabledDay(d);

              const inRange = isInRange(d);
              const startMark = isStart(d);
              const endMark = isEnd(d);
              const isToday = isSameDay(d, today);

              const rangeBgStyle =
                inRange
                  ? [
                      styles.rangeBgBase,
                      { backgroundColor: PRIMARY_150 },
                      startMark && !endMark ? styles.rangeBgLeftRound : null,
                      endMark && !startMark ? styles.rangeBgRightRound : null,
                      startMark && endMark ? styles.rangeBgBothRound : null,
                    ]
                  : null;

              const circleBg = startMark || endMark ? { backgroundColor: PRIMARY_700 } : null;

              return (
                <Pressable
                  key={`d-${idx}`}
                  style={[styles.cell, styles.dayCell, disabled && styles.disabledCell]}
                  disabled={disabled}
                  onPress={() => onPickDay(d)}
                >
                  {inRange ? <View style={[styles.rangeBg, ...(rangeBgStyle ?? [])]} /> : null}

                  <View style={[styles.dayCircle, circleBg]}>
                    <Text
                      style={[
                        styles.dayText,
              
                        isToday && !(startMark || endMark) && styles.todayText,
                        (startMark || endMark) && styles.dayTextSelected,
                        disabled && styles.disabledText,
                      ]}
                    >
                      {d.getDate()}
                    </Text>

                    {isToday && !(startMark || endMark) && !disabled && (
                      <View style={styles.todayDot} />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {wheelOpen && (
            <View style={styles.wheelOverlay} pointerEvents="box-none">
              <View style={styles.wheelSheet} pointerEvents="auto">
                <View pointerEvents="none" style={styles.wheelHighlight} />

                <View pointerEvents="none" style={styles.fadeTop} />
                <View pointerEvents="none" style={styles.fadeBottom} />

                <View style={styles.wheelCols}>
                  <View style={styles.wheelCol}>
                    <FlatList
                      ref={yearListRef}
                      data={yearWheelData}
                      keyExtractor={(_, i) => `yy-${i}`}
                      renderItem={({ item }) => {
                        if (item == null) return <View style={{ height: WHEEL_ITEM_H }} />;
                        const active = item === wheelY;
                        return (
                          <View style={styles.wheelItem}>
                            <Text style={[styles.wheelText, active && styles.wheelTextActive]}>
                              {item}년
                            </Text>
                          </View>
                        );
                      }}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={WHEEL_ITEM_H}
                      decelerationRate="fast"
                      getItemLayout={getWheelItemLayout}
                      onMomentumScrollEnd={onWheelEnd("year", yearWheelData)}
                      onScrollEndDrag={onWheelEnd("year", yearWheelData)}
                      onScrollToIndexFailed={() => {
                        requestAnimationFrame(() =>
                          safeScrollToValue(yearListRef, yearWheelData, wheelY)
                        );
                      }}
                    />
                  </View>

                  <View style={styles.wheelCol}>
                    <FlatList
                      ref={monthListRef}
                      data={monthWheelData}
                      keyExtractor={(_, i) => `mm-${i}`}
                      renderItem={({ item }) => {
                        if (item == null) return <View style={{ height: WHEEL_ITEM_H }} />;
                        const active = item === wheelM;
                        return (
                          <View style={styles.wheelItem}>
                            <Text style={[styles.wheelText, active && styles.wheelTextActive]}>
                              {item}월
                            </Text>
                          </View>
                        );
                      }}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={WHEEL_ITEM_H}
                      decelerationRate="fast"
                      getItemLayout={getWheelItemLayout}
                      onMomentumScrollEnd={onWheelEnd("month", monthWheelData)}
                      onScrollEndDrag={onWheelEnd("month", monthWheelData)}
                      onScrollToIndexFailed={() => {
                        requestAnimationFrame(() =>
                          safeScrollToValue(monthListRef, monthWheelData, wheelM)
                        );
                      }}
                    />
                  </View>
                </View>
              </View>

              <Pressable style={styles.wheelOutsideTouch} onPress={() => setWheelOpen(false)} />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const { height: H } = Dimensions.get("window");

const styles = StyleSheet.create({
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  popup: {
    width: 316,
    maxHeight: Math.floor(H * 0.72),
    borderRadius: 18,
    backgroundColor: "#fff",
    overflow: "hidden",
    paddingBottom: 14,
  },

  calendarTop: {
    marginTop: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  arrowBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  arrowText: { fontSize: 22, color: Colors?.grey900 ?? "#2E2A24" },

  monthCenterBtn: { alignItems: "center", justifyContent: "center", minWidth: 120 },
  monthYear: {
    ...typography.sub2_12_regular,
    color: Colors?.grey600 ?? "#777166",
    marginBottom: 4,
    fontSize: 16,
    lineHeight: 18,
  },
  monthMonth: {
    ...typography.sub1_14_medium,
    color: Colors?.grey900 ?? "#2E2A24",
    fontSize: 20,
    lineHeight: 24,
  },

  weekRowWrap: {
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 0,
    overflow: "hidden",
  },
  weekRow: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    flexDirection: "row",
  },
  weekText: {
    width: `${100 / 7}%` as any,
    textAlign: "center",
    ...typography.sub3_9_bold,
    color: Colors?.grey900 ?? "#2E2A24",
    fontSize: 18,
    lineHeight: 20,
  },

  grid: {
    paddingHorizontal: 16,
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: `${100 / 7}%` as any,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCell: { position: "relative" },

  rangeBg: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 38,
    top: (44 - 38) / 2,
  },
  rangeBgBase: { borderRadius: 0 },
  rangeBgLeftRound: { borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  rangeBgRightRound: { borderTopRightRadius: 12, borderBottomRightRadius: 12 },
  rangeBgBothRound: { borderRadius: 12 },

  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  dayText: {
    ...typography.body4_14_regular,
    color: Colors?.grey900 ?? "#2E2A24",
    fontSize: 20,
    lineHeight: 22,
  },
  dayTextSelected: { color: "#fff" },
  disabledCell: { opacity: 0.35 },
  disabledText: { color: Colors?.grey500 ?? "#8C8578" },

  todayText: { color: "#827765" },
  todayDot: {
    position: "absolute",
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#827765",
  },

  wheelOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },

  wheelSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },

  wheelOutsideTouch: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 220,
    bottom: 0,
  },

  wheelCols: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  wheelCol: {
    flex: 1,
    height: WHEEL_ITEM_H * WHEEL_VISIBLE,
    overflow: "hidden",
  },
  wheelHighlight: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 14 + WHEEL_ITEM_H * Math.floor(WHEEL_VISIBLE / 2),
    height: WHEEL_ITEM_H,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  wheelItem: {
    height: WHEEL_ITEM_H,
    justifyContent: "center",
    alignItems: "center",
  },
  wheelText: {
    ...typography.body4_14_regular,
    color: Colors?.grey500 ?? "#8C8578",
    fontSize: 20,
    lineHeight: 34,
  },
  wheelTextActive: {
    color: Colors?.grey900 ?? "#2E2A24",
  },

  fadeTop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 14,
    height: 56,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  fadeBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 10,
    height: 56,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
});