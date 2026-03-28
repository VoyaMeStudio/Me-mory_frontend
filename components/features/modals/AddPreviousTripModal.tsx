import {
  CountryInlineInput,
  CountryItem,
} from "@/components/features/modals/CountryPickerModal";
import DatePickerOverlay from "@/components/features/modals/DatePickerModal";
import EmotionPickerOverlay from "@/components/features/modals/EmotionPickerModal";
import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useEmotions } from "@/hooks/useEmotions";
import type { PreviousTrip, TripEmotion } from "../stack.types";

type Mode = "create" | "edit";
type Props = {
  visible: boolean;
  mode?: Mode;
  initial?: PreviousTrip;
  onClose: () => void;
  onSubmit: (trip: PreviousTrip) => void;
};

type Overlay = null | "period" | "emotion";

const WEEK_KR = ["일", "월", "화", "수", "목", "금", "토"];

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatDateKR(d: Date) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  const w = WEEK_KR[d.getDay()];
  return `${y}년 ${m}월 ${day}일 (${w})`;
}

function toCountryItems(codes: string[]): CountryItem[] {
  return codes.map((code) => ({
    countryCode: code,
    countryName: code,
  }));
}

export default function AddPreviousTripModal({
  visible,
  mode = "create",
  initial,
  onClose,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [note, setNote] = useState("");

  const [selectedCountries, setSelectedCountries] = useState<CountryItem[]>([]);

  const [emotionId, setEmotionId] = useState<number | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(null);

  const scrollRef = useRef<ScrollView | null>(null);

  const { findById } = useEmotions(visible);

  const emotion: TripEmotion | undefined = useMemo(() => {
    return findById(emotionId ?? undefined);
  }, [findById, emotionId]);

  useEffect(() => {
    if (!visible) return;

    setTitle(initial?.tripName ?? "");
    setNote(initial?.description ?? "");

    if (mode === "edit" && initial?.startDate && initial?.endDate) {
      setStartDate(initial.startDate);
      setEndDate(initial.endDate);
    } else {
      setStartDate(null);
      setEndDate(null);
    }

    setSelectedCountries(toCountryItems(initial?.countryCodes ?? []));

    setEmotionId(initial?.emotionId ?? null);

    setOverlay(null);

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    });
  }, [visible, initial, mode]);

  const canSave = useMemo(() => {
    const t = title.trim();
    if (!t) return false;
    if (!startDate || !endDate) return false;
    if (endDate.getTime() < startDate.getTime()) return false;

    const codes = selectedCountries.map((c) => c.countryCode).filter(Boolean);
    if (codes.length === 0) return false;

    if (!emotionId) return false;
    return true;
  }, [title, startDate, endDate, selectedCountries, emotionId]);

  const modalTitle = mode === "edit" ? "과거 여행 수정" : "과거 여행 추가";

  const submit = () => {
    if (!canSave || !startDate || !endDate || !emotionId) return;

    const payload: PreviousTrip = {
      id: mode === "edit" ? initial?.id ?? 0 : 0,
      tripName: title.trim(),
      description: note.trim(),
      startDate,
      endDate,

      countryCodes: selectedCountries.map((c) => c.countryCode).filter(Boolean),

      emotionId,
      isArchived: initial?.isArchived ?? false,
      representativeImageUrl: initial?.representativeImageUrl ?? null,
      emotionName: initial?.emotionName,
      emotionColor: initial?.emotionColor,
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      hardwareAccelerated
      onRequestClose={onClose}
    >
      <View style={styles.backdrop} />
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

      <View style={styles.center} pointerEvents="box-none">
        <View style={styles.card}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>{modalTitle}</Text>
              <Pressable onPress={onClose} style={styles.xBtn} hitSlop={10}>
                <Text style={styles.xText}>×</Text>
              </Pressable>
            </View>
            <View style={styles.headerLine} />

            <ScrollView
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.thumbnailBox} />

              {/* 여행명 */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>
                  여행명 <Text style={styles.req}>*</Text>
                </Text>

                <View style={styles.underlineInputWrap}>
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="공백 포함 최대 14자"
                    placeholderTextColor={Colors?.grey400 ?? "#A7A093"}
                    style={styles.underlineInput}
                    maxLength={14}
                  />
                </View>

                <Text style={styles.counterUnder}>({title.length}/14)</Text>
              </View>

              {/* 여행 기간 */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>
                  여행 기간 <Text style={styles.req}>*</Text>
                </Text>

                <Pressable
                  style={styles.periodRow}
                  onPress={() => setOverlay("period")}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text
                    style={[
                      styles.periodText,
                      {
                        color:
                          startDate && endDate
                            ? (Colors?.grey900 ?? "#2E2A24")
                            : "#A4A4A4",
                      },
                    ]}
                  >
                    {startDate && endDate
                      ? `${formatDateKR(startDate)} ~ ${formatDateKR(endDate)}`
                      : "여행 기간을 선택해주세요"}
                  </Text>
                </Pressable>
              </View>

              {/* 여행 설명 */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>여행 설명</Text>

                <View style={styles.noteBox}>
                  <TextInput
                    value={note}
                    onChangeText={(t) => t.length <= 54 && setNote(t)}
                    placeholder="여행에 대한 설명을 입력해주세요."
                    placeholderTextColor={Colors?.grey400 ?? "#A7A093"}
                    style={styles.noteInput}
                    multiline
                    textAlignVertical="top"
                  />
                </View>

                <Text style={styles.counterBelowBox}>({note.length}/54)</Text>
              </View>

              {/* 여행한 국가들 */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>여행한 국가들</Text>

                <CountryInlineInput
                  value={selectedCountries}
                  onChange={(next) => {
                    setSelectedCountries(next);
                    requestAnimationFrame(() => {
                      scrollRef.current?.scrollToEnd({ animated: true });
                    });
                  }}
                  maxSelect={20}
                />
              </View>

              {/* 감정색 */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>감정색</Text>

                <Pressable
                  style={styles.emotionRow}
                  onPress={() => setOverlay("emotion")}
                >
                  <View
                    style={[
                      styles.emotionDot,
                      {
                        backgroundColor:
                          emotion?.color ?? (Colors?.grey200 ?? "#E7E1D7"),
                      },
                    ]}
                  />
                  <Text style={styles.text20}>{emotion?.label ?? "기본"}</Text>
                </Pressable>
              </View>

              {/* 저장 */}
              <Pressable
                style={[styles.saveBtn, !canSave && styles.saveDisabled]}
                onPress={submit}
                disabled={!canSave}
              >
                <Text
                  style={[styles.saveText, !canSave && styles.saveTextDisabled]}
                >
                  저장
                </Text>
              </Pressable>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>

      {/* 기간 선택 오버레이 */}
      <DatePickerOverlay
        visible={overlay === "period"}
        initialStartDate={startDate ?? new Date()}
        initialEndDate={endDate ?? (startDate ?? new Date())}
        minDate={undefined}
        maxDate={undefined}
        onClose={() => setOverlay(null)}
        onConfirmRange={(s, e) => {
          setStartDate(s);
          setEndDate(e);
          setOverlay(null);
        }}
      />

      {/* 감정 선택 오버레이 */}
      <EmotionPickerOverlay
        visible={overlay === "emotion"}
        value={emotion}
        onClose={() => setOverlay(null)}
        onConfirm={(e: TripEmotion) => {
          setEmotionId(e.id);
          setOverlay(null);
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  center: {
    flex: 1,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    width: 296,
    height: 620,
    borderRadius: 20,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    overflow: "hidden",
  },

  headerRow: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  headerLine: {
    height: 1,
    backgroundColor: Colors?.grey200 ?? "#E7E1D7",
    marginBottom: 8,
  },
  headerTitle: {
    ...typography.sub1_14_medium,
    color: Colors?.grey900 ?? "#2E2A24",
    fontSize: 24,
    paddingTop: 10,
  },
  xBtn: {
    position: "absolute",
    right: 0,
    top: -5,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  xText: { fontSize: 22, color: Colors?.grey600 ?? "#777166" },

  scrollContent: {
    paddingBottom: 18,
    paddingTop: 4,
  },

  thumbnailBox: {
    width: "100%",
    aspectRatio: 1.06,
    borderRadius: 14,
    backgroundColor: Colors?.grey100 ?? "#EFECE6",
    marginBottom: 14,
  },

  fieldBlock: {
    marginBottom: 18,
  },

  label: {
    ...typography.sub2_12_regular,
    color: Colors?.grey700 ?? "#6B665B",
    marginBottom: 10,
    fontSize: 20,
    lineHeight: 24,
  },
  req: { color: "#C03A2B" },

  underlineInputWrap: {
    borderBottomWidth: 1,
    borderBottomColor: Colors?.grey200 ?? "#E7E1D7",
    paddingBottom: 10,
  },
  underlineInput: {
    ...typography.body4_14_regular,
    color: Colors?.grey900 ?? "#2E2A24",
    fontSize: 20,
    lineHeight: 26,
    paddingVertical: 0,
  },
  counterUnder: {
    marginTop: 8,
    alignSelf: "flex-end",
    ...typography.sub3_9_bold,
    color: Colors?.grey400 ?? "#A7A093",
    fontSize: 16,
    lineHeight: 18,
  },

  periodRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors?.grey200 ?? "#E7E1D7",
  },
  periodText: {
    ...typography.body4_14_regular,
    fontSize: 20,
    lineHeight: 26,
  },

  noteBox: {
    borderWidth: 1,
    borderColor: Colors?.grey200 ?? "#E7E1D7",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    minHeight: 120,
  },
  noteInput: {
    ...typography.body4_14_regular,
    color: Colors?.grey900 ?? "#2E2A24",
    fontSize: 20,
    lineHeight: 26,
    padding: 0,
    margin: 0,
  },
  counterBelowBox: {
    marginTop: 8,
    alignSelf: "flex-end",
    ...typography.sub3_9_bold,
    color: Colors?.grey400 ?? "#A7A093",
    fontSize: 16,
    lineHeight: 18,
  },

  emotionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors?.grey200 ?? "#E7E1D7",
    paddingHorizontal: 14,
  },
  emotionDot: { width: 16, height: 16, borderRadius: 999 },

  text20: {
    ...typography.body4_14_regular,
    color: Colors?.grey900 ?? "#A7A4A0",
    fontSize: 20,
    lineHeight: 26,
  },

  saveBtn: {
    marginTop: 10,
    height: 54,
    borderRadius: 999,
    backgroundColor: "#544C3F",
    alignItems: "center",
    justifyContent: "center",
  },
  saveDisabled: { backgroundColor: Colors?.grey200 ?? "#E7E1D7" },

  saveText: { ...typography.sub1_14_medium, color: "#fff", fontSize: 18 },
  saveTextDisabled: { color: Colors?.grey400 ?? "#A7A093" },
});