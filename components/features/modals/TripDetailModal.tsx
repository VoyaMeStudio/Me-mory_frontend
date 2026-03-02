// TripDetailModal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";

import ArchiveIcon from "@/assets/images/archive.svg";
import DeleteIcon from "@/assets/images/block_icon.svg";
import KebabMenuIcon from "@/assets/images/kebab_menu.svg";
import EditIcon from "@/assets/images/report_icon.svg";

import ConfirmDialog from "@/components/features/modals/ConfirmDialog";
import { PreviousTrip } from "../stack.types";

type Props = {
  visible: boolean;
  trip?: PreviousTrip;
  onClose: () => void;
  onEdit: (trip: PreviousTrip) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
};

type CountryItem = {
  countryCode: string;
  countryName: string;
  emoji?: string; // ✅ 국기 이모지
};

type ApiResponse = {
  code: number;
  message: string;
  data: CountryItem[];
};

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL ?? "";
const COUNTRY_SEARCH_PATH = "/api/countries";

async function fetchCountriesByKeyword(keyword: string): Promise<CountryItem[]> {
  const q = keyword.trim();
  if (!q) return [];
  const url = `${BASE_URL}${COUNTRY_SEARCH_PATH}?keyword=${encodeURIComponent(q)}`;
  const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Country search failed: ${res.status}`);
  const json = (await res.json()) as ApiResponse;
  return Array.isArray(json?.data) ? json.data : [];
}

function normalizeName(s: string) {
  return (s ?? "").trim().toLowerCase();
}

// ✅ 요일까지 포함
const WEEK = ["일", "월", "화", "수", "목", "금", "토"] as const;
function formatDateYMDWithDay(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const dow = WEEK[d.getDay()];
  return `${y}년 ${m}월 ${day}일 (${dow})`;
}

const CARD_BG = "#FFFFFF";
const CARD_BORDER = Colors?.primary400 ?? "#D8CCB8";
const LINE = Colors?.primary400 ?? "#D8CCB8";

const TEXT_MAIN = Colors?.primary900 ?? Colors?.grey900 ?? "#2E2A24";
const TEXT_SUB = Colors?.grey500 ?? "#8C8578";

const CHIP_BG = "#F9F8F4";
const CHIP_BORDER = Colors?.primary300 ?? "#E7E1D7";
const CHIP_TEXT = Colors?.primary900 ?? Colors?.grey900 ?? "#544C3F";

export default function TripDetailModal({
  visible,
  trip,
  onClose,
  onEdit,
  onArchive,
  onDelete,
}: Props) {
  const [openMenu, setOpenMenu] = useState(false);

  const [openArchiveConfirm, setOpenArchiveConfirm] = useState(false);
  const [openArchivedDone, setOpenArchivedDone] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openDeletedDone, setOpenDeletedDone] = useState(false);

  // ✅ 국가 이모지 캐시
  const cacheRef = useRef<Record<string, CountryItem>>({});
  const [countryMap, setCountryMap] = useState<Record<string, CountryItem>>({});
  const [countryLoading, setCountryLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setOpenMenu(false);
    setOpenArchiveConfirm(false);
    setOpenArchivedDone(false);
    setOpenDeleteConfirm(false);
    setOpenDeletedDone(false);
  }, [visible, trip?.id]);

  const dateText = useMemo(() => {
    if (!trip) return "";
    return `${formatDateYMDWithDay(trip.startDate)} ~ ${formatDateYMDWithDay(trip.endDate)}`;
  }, [trip]);

  // ✅ trip의 countries 이름 → emoji 붙인 데이터 만들기
  useEffect(() => {
    if (!visible || !trip) return;

    let mounted = true;

    const load = async () => {
      try {
        setCountryLoading(true);

        const names = (trip.countries ?? []).map((c) => (c ?? "").trim()).filter(Boolean);

        const need = names.filter((n) => !cacheRef.current[normalizeName(n)]);
        if (need.length === 0) {
          if (mounted) setCountryMap({ ...cacheRef.current });
          return;
        }

        const results = await Promise.all(
          need.map(async (name) => {
            try {
              const list = await fetchCountriesByKeyword(name);
              const exact = list.find((x) => normalizeName(x.countryName) === normalizeName(name));
              return [name, exact ?? list[0] ?? null] as const;
            } catch {
              return [name, null] as const;
            }
          })
        );

        if (!mounted) return;

        for (const [name, item] of results) {
          const key = normalizeName(name);
          cacheRef.current[key] =
            item ?? ({ countryCode: "", countryName: name, emoji: undefined } as CountryItem);
        }

        setCountryMap({ ...cacheRef.current });
      } finally {
        if (mounted) setCountryLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [visible, trip?.id]);

  const countriesForView = useMemo(() => {
    if (!trip) return [];
    const names = (trip.countries ?? []).map((c) => (c ?? "").trim()).filter(Boolean);
    return names.map((name) => {
      const item = countryMap[normalizeName(name)];
      return item ?? ({ countryCode: "", countryName: name, emoji: undefined } as CountryItem);
    });
  }, [trip, countryMap]);

  if (!trip) return null;

  return (
    <>
      <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
        <View style={styles.backdrop}>
          {/* 바깥 터치: 메뉴 열려있으면 메뉴만 닫고, 아니면 모달 닫기 */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => (openMenu ? setOpenMenu(false) : onClose())}
          />

          <Pressable style={styles.card} onPress={() => {}}>
            {/* 헤더 */}
            <View style={styles.header}>
              <Pressable
                onPress={() => {
                  setOpenMenu(false);
                  onClose();
                }}
                style={styles.xBtn}
                hitSlop={12}
              >
                <Text style={styles.xText}>×</Text>
              </Pressable>

              <Text style={styles.title} numberOfLines={1}>
                {trip.title}
              </Text>

              <Pressable
                onPress={() => setOpenMenu((v) => !v)}
                style={styles.kebabBtn}
                hitSlop={12}
              >
                <KebabMenuIcon width={18} height={18} />
              </Pressable>
            </View>

            <View style={styles.headerLine} />

            {/* ✅ 메뉴 */}
            {openMenu && (
              <>
                {/* ❗중요: 이 오버레이가 메뉴를 덮지 않게 zIndex를 낮게 */}
                <Pressable
                  style={styles.menuOverlay}
                  onPress={() => setOpenMenu(false)}
                />

                <View style={styles.menu}>
                  <Pressable
                    style={styles.menuItem}
                    onPress={() => {
                      setOpenMenu(false);
                      onEdit(trip);
                    }}
                  >
                    <Text style={styles.menuText}>수정하기</Text>
                    <EditIcon width={22} height={22} />
                  </Pressable>

                  <View style={styles.menuDivider} />

                  <Pressable
                    style={styles.menuItem}
                    onPress={() => {
                      setOpenMenu(false);
                      setOpenArchiveConfirm(true);
                    }}
                  >
                    <Text style={styles.menuText}>보관하기</Text>
                    <ArchiveIcon width={22} height={22} />
                  </Pressable>

                  <View style={styles.menuDivider} />

                  <Pressable
                    style={styles.menuItem}
                    onPress={() => {
                      setOpenMenu(false);
                      setOpenDeleteConfirm(true);
                    }}
                  >
                    <Text style={styles.menuTextDanger}>삭제하기</Text>
                    <DeleteIcon width={22} height={22} />
                  </Pressable>
                </View>
              </>
            )}

            {/* 날짜 */}
            <Text style={styles.date}>{dateText}</Text>

            {/* 설명 */}
            {!!trip.note && (
              <Text style={styles.note} numberOfLines={3}>
                {trip.note}
              </Text>
            )}

            {/* 국가 칩 (emoji 포함) */}
            <View style={styles.chips}>
              {countriesForView.map((c) => (
                <View key={`${c.countryName}-${c.countryCode || "n"}`} style={styles.chip}>
                  {!!c.emoji && <Text style={styles.chipEmoji}>{c.emoji}</Text>}
                  <Text style={styles.chipText}>{c.countryName}</Text>
                </View>
              ))}
            </View>

            {countryLoading && (
              <Text style={styles.loadingText}>국가 정보를 불러오는 중…</Text>
            )}
          </Pressable>
        </View>
      </Modal>

      {/* 보관 confirm */}
      <ConfirmDialog
        visible={openArchiveConfirm}
        title="해당 여행을 보관하시겠습니까?"
        description={"여행을 보관하는 경우,\n해당 여행에 포함된 일기도 모두 보관전환됩니다."}
        confirmText="확인"
        cancelText="취소"
        onClose={() => setOpenArchiveConfirm(false)}
        onConfirm={() => {
          setOpenArchiveConfirm(false);
          onArchive(trip.id);
          setOpenArchivedDone(true);
        }}
      />

      {/* 보관 완료 */}
      <ConfirmDialog
        visible={openArchivedDone}
        title="보관되었습니다."
        description={
          "보관된 여행은\n마이페이지 > 설정 > 보관된 여행 및 일기 관리\n에서 확인 및 복구할 수 있습니다 :)"
        }
        confirmText="확인"
        cancelText="되돌리기"
        onClose={() => setOpenArchivedDone(false)}
        onConfirm={() => {
          setOpenArchivedDone(false);
          onClose();
        }}
      />

      {/* 삭제 confirm */}
      <ConfirmDialog
        visible={openDeleteConfirm}
        title="해당 여행을 삭제하시겠습니까?"
        description={"삭제된 여행은 복구 불가능합니다.\n해당 여행에 포함된 일기도 모두 삭제됩니다."}
        confirmText="삭제"
        cancelText="취소"
        danger
        onClose={() => setOpenDeleteConfirm(false)}
        onConfirm={() => {
          setOpenDeleteConfirm(false);
          onDelete(trip.id);
          setOpenDeletedDone(true);
        }}
      />

      {/* 삭제 완료 */}
      <ConfirmDialog
        visible={openDeletedDone}
        title="삭제되었습니다."
        description={"이 페이지를 벗어나면\n삭제된 여행을 복구할 수 없습니다."}
        confirmText="확인"
        cancelText="되돌리기"
        onClose={() => setOpenDeletedDone(false)}
        onConfirm={() => {
          setOpenDeletedDone(false);
          onClose();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  card: {
    width: 295,
    borderRadius: 24,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 18,
    position: "relative",
  },

  header: {
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  xBtn: {
    position: "absolute",
    left: -6,
    top: -6,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  xText: {
    fontSize: 24,
    color: TEXT_SUB,
  },

  kebabBtn: {
    position: "absolute",
    right: -6,
    top: -6,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    ...typography.sub1_14_medium,
    color: TEXT_MAIN,
    fontSize: 18,
    lineHeight: 22,
    textAlign: "center",
    paddingHorizontal: 32,
  },

  headerLine: {
    height: 1,
    backgroundColor: LINE,
    marginTop: 10,
  },

  // ✅ 메뉴 밖 터치 오버레이: 메뉴 아래로 깔기
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },

  // ✅ 메뉴: 오버레이보다 위로
  menu: {
    position: "absolute",
    right: 18,
    top: 62,
    width: 180,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors?.grey200 ?? "#E7E1D7",
    overflow: "hidden",
    zIndex: 2,
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },

  menuItem: {
    height: 52,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors?.grey100 ?? "#EFECE6",
  },
  menuText: {
    ...typography.body4_14_regular,
    color: TEXT_MAIN,
    fontSize: 16,
    lineHeight: 20,
  },
  menuTextDanger: {
    ...typography.body4_14_regular,
    color: "#D13B3B",
    fontSize: 16,
    lineHeight: 20,
  },

  date: {
    ...typography.sub2_12_regular,
    color: TEXT_SUB,
    textAlign: "center",
    marginTop: 12,
    fontSize: 12,
    lineHeight: 16,
  },

  note: {
    ...typography.body4_14_regular,
    color: TEXT_MAIN,
    marginTop: 14,
    fontSize: 14,
    lineHeight: 20,
  },

  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    marginTop: 14,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: CHIP_BORDER,
    backgroundColor: CHIP_BG,
    justifyContent: "center",
  },
  chipEmoji: {
    fontSize: 16,
    lineHeight: 18,
    marginTop: 1,
  },
  chipText: {
    ...typography.sub2_12_regular,
    color: CHIP_TEXT,
    fontSize: 13,
    lineHeight: 16,
  },

  loadingText: {
    marginTop: 12,
    textAlign: "center",
    ...typography.sub2_12_regular,
    color: TEXT_SUB,
    fontSize: 12,
  },
});