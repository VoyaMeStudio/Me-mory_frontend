import React, { useEffect, useMemo, useState } from "react";
import {
  InteractionManager,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";

import ArchiveIcon from "@/assets/images/archive.svg";
import DeleteIcon from "@/assets/images/block_icon.svg";
import KebabMenuIcon from "@/assets/images/kebab_menu.svg";
import EditIcon from "@/assets/images/report_icon.svg";

import ConfirmDialog from "@/components/features/modals/ConfirmDialog";
import type { PreviousTrip } from "../stack.types";

type Props = {
  visible: boolean;
  trip?: PreviousTrip;
  onClose: () => void;

  onEdit: (trip: PreviousTrip) => void;
  onArchive: (id: number) => void;
  onDelete: (id: number) => void;
};

const WEEK = ["일", "월", "화", "수", "목", "금", "토"] as const;

function formatDateYMDWithDay(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const dow = WEEK[d.getDay()];
  return `${y}년 ${m}월 ${day}일 (${dow})`;
}

function toDateSafe(v: unknown): Date | null {
  if (!v) return null;
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v;

  if (typeof v === "string") {
    const s = v.includes(".") ? v.replace(/\./g, "-") : v;
    const [y, m, d] = s.split("-").map((n) => Number(n));
    if (!y || !m || !d) return null;
    const dt = new Date(y, m - 1, d);
    if (Number.isNaN(dt.getTime())) return null;
    return dt;
  }

  return null;
}

function toNumberId(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function flagEmojiFromCountryCode(code?: string) {
  if (!code) return undefined;
  const cc = String(code).trim().toUpperCase();
  if (cc.length !== 2) return undefined;

  const A = 0x1f1e6;
  const first = cc.charCodeAt(0) - 65 + A;
  const second = cc.charCodeAt(1) - 65 + A;
  if (first < A || second < A) return undefined;

  return String.fromCodePoint(first, second);
}

function normalizeCode(v: unknown) {
  const s = String(v ?? "").trim().toUpperCase();
  return s || undefined;
}

function normalizeName(v: unknown) {
  const s = String(v ?? "").trim();
  return s || undefined;
}

const CARD_BG = "#FFFFFF";
const CARD_BORDER = Colors?.primary400 ?? "#D8CCB8";
const LINE = Colors?.primary400 ?? "#D8CCB8";

const TEXT_MAIN = Colors?.primary900 ?? Colors?.grey900 ?? "#2E2A24";
const TEXT_SUB = Colors?.grey500 ?? "#8C8578";

const CHIP_BG = "#F9F8F4";
const CHIP_BORDER = Colors?.primary300 ?? "#E7E1D7";
const CHIP_TEXT = Colors?.primary900 ?? Colors?.grey900 ?? "#544C3F";

type CountryViewItem = {
  key: string;
  countryName: string;
  emoji?: string;
};

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

  const t: any = trip as any;

  const tripId = useMemo(() => {
    return toNumberId(t?.id ?? t?.tripId);
  }, [t?.id, t?.tripId]);

  const titleText = useMemo(() => {
    return (t?.tripName ?? t?.title ?? "").toString();
  }, [t?.tripName, t?.title]);

  const start = useMemo(() => toDateSafe(t?.startDate), [t?.startDate]);
  const end = useMemo(() => toDateSafe(t?.endDate), [t?.endDate]);

  useEffect(() => {
    if (!visible) return;
    setOpenMenu(false);
    setOpenArchiveConfirm(false);
    setOpenArchivedDone(false);
    setOpenDeleteConfirm(false);
    setOpenDeletedDone(false);
  }, [visible, tripId]);

  const dateText = useMemo(() => {
    if (!start || !end) return "";
    return `${formatDateYMDWithDay(start)} ~ ${formatDateYMDWithDay(end)}`;
  }, [start, end]);

  const countriesForView: CountryViewItem[] = useMemo(() => {
    if (!trip) return [];

    const visited =
      (Array.isArray(t?.visitedCountries) && t.visitedCountries) ||
      (Array.isArray(t?.visitedCountry) && t.visitedCountry) ||
      (Array.isArray(t?.visited) && t.visited) ||
      null;

    if (visited && visited.length > 0) {
      const mapped = visited
        .map((c: any) => {
          const code = normalizeCode(c?.countryCode ?? c?.code ?? c?.country_code);
          const name =
            normalizeName(c?.countryName ?? c?.name ?? c?.country_name) ??
            code; 
          const emoji =
            normalizeName(c?.emoji) ?? (code ? flagEmojiFromCountryCode(code) : undefined);

          if (!code && !name) return null;

          return {
            key: `${code ?? "NA"}-${name ?? "NA"}-${emoji ?? ""}`,
            countryName: name ?? (code ?? ""),
            emoji,
          } as CountryViewItem;
        })
        .filter(Boolean) as CountryViewItem[];

      if (mapped.length > 0) return mapped;
    }

    const codes =
      (Array.isArray(t?.countryCodes) && t.countryCodes) ||
      (Array.isArray(t?.visitedCountryCodes) && t.visitedCountryCodes) ||
      (Array.isArray(t?.countriesCodes) && t.countriesCodes) ||
      null;

    if (codes && codes.length > 0) {
      const mapped = codes
        .map((raw: any) => normalizeCode(raw))
        .filter(Boolean)
        .map((cc: string) => ({
          key: cc,
          countryName: cc,
          emoji: flagEmojiFromCountryCode(cc),
        }));
      if (mapped.length > 0) return mapped;
    }

    const names =
      (Array.isArray(t?.countries) && t.countries) ||
      (Array.isArray(t?.countryNames) && t.countryNames) ||
      null;

    if (names && names.length > 0) {
      const mapped = names
        .map((raw: any) => normalizeName(raw))
        .filter(Boolean)
        .map((nm: string) => ({
          key: nm,
          countryName: nm,
          emoji: undefined,
        }));
      if (mapped.length > 0) return mapped;
    }

    return [];
  }, [
    trip,
    t?.visitedCountries,
    t?.visitedCountry,
    t?.visited,
    t?.countryCodes,
    t?.visitedCountryCodes,
    t?.countriesCodes,
    t?.countries,
    t?.countryNames,
  ]);

  if (!trip) return null;

  const handleArchive = () => {
    if (!tripId) return;
    onArchive(tripId);
  };

  const handleDelete = () => {
    if (!tripId) return;
    onDelete(tripId);
  };

  return (
    <>
      <Modal
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        visible={visible}
        onRequestClose={() => {
          setOpenMenu(false);
          onClose();
        }}
      >
        <View style={styles.backdrop}>

          <Pressable
            style={styles.backdropPress}
            onPress={() => {
              if (openMenu) setOpenMenu(false);
              else onClose();
            }}
          />

          <View style={styles.card}>
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
                {titleText}
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

            {openMenu && (
              <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
     
                <Pressable
                  style={styles.menuOverlay}
                  onPress={() => setOpenMenu(false)}
                />

                <View style={styles.menu}>
                  <Pressable
                    style={styles.menuItem}
                    onPress={() => {
                      setOpenMenu(false);
                      InteractionManager.runAfterInteractions(() => {
                        onEdit(trip);
                      });
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
                      InteractionManager.runAfterInteractions(() => {
                        setOpenArchiveConfirm(true);
                      });
                    }}
                    disabled={!tripId}
                  >
                    <Text
                      style={[
                        styles.menuText,
                        !tripId && { color: Colors?.grey400 ?? "#A7A093" },
                      ]}
                    >
                      보관하기
                    </Text>
                    <ArchiveIcon width={22} height={22} />
                  </Pressable>

                  <View style={styles.menuDivider} />

                  <Pressable
                    style={styles.menuItem}
                    onPress={() => {
                      setOpenMenu(false);
                      InteractionManager.runAfterInteractions(() => {
                        setOpenDeleteConfirm(true);
                      });
                    }}
                    disabled={!tripId}
                  >
                    <Text
                      style={[
                        styles.menuTextDanger,
                        !tripId && { color: Colors?.grey400 ?? "#A7A093" },
                      ]}
                    >
                      삭제하기
                    </Text>
                    <DeleteIcon width={22} height={22} />
                  </Pressable>
                </View>
              </View>
            )}

            {!!dateText && <Text style={styles.date}>{dateText}</Text>}

            {!!t?.description && (
              <Text style={styles.note} numberOfLines={3}>
                {String(t.description)}
              </Text>
            )}

            {countriesForView.length > 0 && (
              <View style={styles.chips}>
                {countriesForView.map((c) => (
                  <View key={c.key} style={styles.chip}>
                    {!!c.emoji && <Text style={styles.chipEmoji}>{c.emoji}</Text>}
                    <Text style={styles.chipText}>{c.countryName}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>

      <ConfirmDialog
        visible={openArchiveConfirm}
        title="해당 여행을 보관하시겠습니까?"
        description={
          "여행을 보관하는 경우,\n해당 여행에 포함된 일기도 모두 보관전환됩니다."
        }
        confirmText="확인"
        cancelText="취소"
        onClose={() => setOpenArchiveConfirm(false)}
        onConfirm={() => {
          setOpenArchiveConfirm(false);
          handleArchive();
          InteractionManager.runAfterInteractions(() => {
            setOpenArchivedDone(true);
          });
        }}
      />

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

      <ConfirmDialog
        visible={openDeleteConfirm}
        title="해당 여행을 삭제하시겠습니까?"
        description={
          "삭제된 여행은 복구 불가능합니다.\n해당 여행에 포함된 일기도 모두 삭제됩니다."
        }
        confirmText="삭제"
        cancelText="취소"
        danger
        onClose={() => setOpenDeleteConfirm(false)}
        onConfirm={() => {
          setOpenDeleteConfirm(false);
          handleDelete();
          InteractionManager.runAfterInteractions(() => {
            setOpenDeletedDone(true);
          });
        }}
      />

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

  backdropPress: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
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
    zIndex: 10,
    elevation: 10,
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
    fontSize: 20,
    lineHeight: 24,
    textAlign: "center",
    paddingHorizontal: 32,
  },

  headerLine: {
    height: 1,
    backgroundColor: LINE,
    marginTop: 10,
  },

  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },

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
    zIndex: 30,
    elevation: 30,
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
    fontSize: 17,
    lineHeight: 21,
  },
  menuTextDanger: {
    ...typography.body4_14_regular,
    color: "#D13B3B",
    fontSize: 17,
    lineHeight: 21,
  },

  date: {
    ...typography.sub2_12_regular,
    color: TEXT_SUB,
    textAlign: "center",
    marginTop: 12,
    fontSize: 13,
    lineHeight: 17,
  },

  note: {
    ...typography.body4_14_regular,
    color: TEXT_MAIN,
    marginTop: 14,
    fontSize: 15,
    lineHeight: 21,
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
    fontSize: 14,
    lineHeight: 17,
  },
});