import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export type CountryItem = {
  countryCode: string;
  countryName: string;
  emoji?: string;
};

type ApiResponse = {
  code: number;
  message: string;
  data: CountryItem[];
};

type InlineProps = {
  value: CountryItem[];
  onChange: (next: CountryItem[]) => void;
  maxSelect?: number;
};

const TEXT = Colors?.grey900 ?? "#2E2A24";
const SUBTEXT = Colors?.grey600 ?? "#777166";
const PLACEHOLDER = Colors?.grey400 ?? "#A7A093";
const DIVIDER = Colors?.grey100 ?? "#EFECE6";

const UNDERLINE = Colors?.grey200 ?? "#E7E1D7";


const CHIP_BG = "#F9F8F4";
const CHIP_BORDER = Colors?.primary300 ?? "#D8CCB8";
const CHIP_TEXT = Colors?.primary900 ?? Colors?.grey900 ?? "#2E2A24";
const CHIP_X = Colors?.primary400 ?? "#C6B9A5";

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL ?? "";
const COUNTRY_SEARCH_PATH = "/api/countries";

async function fetchCountries(keyword: string): Promise<CountryItem[]> {
  const q = keyword.trim();
  if (!q) return [];

  const url = `${BASE_URL}${COUNTRY_SEARCH_PATH}?keyword=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error(`Country search failed: ${res.status}`);

  const json = (await res.json()) as ApiResponse;
  return Array.isArray(json?.data) ? json.data : [];
}

export function CountryInlineInput({ value, onChange, maxSelect = 20 }: InlineProps) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<CountryItem[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView | null>(null);
  const [contentH, setContentH] = useState(1);
  const [viewH, setViewH] = useState(1);
  const [scrollY, setScrollY] = useState(0);

  const showSuggest = q.trim().length > 0 && (loading || rows.length > 0 || !!err);

  useEffect(() => {
    const keyword = q.trim();
    if (!keyword) {
      setRows([]);
      setErr(null);
      return;
    }

    const t = setTimeout(async () => {
      try {
        setLoading(true);
        setErr(null);

        const data = await fetchCountries(keyword);


        const selectedCodeSet = new Set(value.map((v) => v.countryCode).filter(Boolean));
        const selectedNameSet = new Set(value.map((v) => v.countryName.trim()));

        const filtered = data.filter((d) => {
          const codeOk = d.countryCode ? !selectedCodeSet.has(d.countryCode) : true;
          const nameOk = !selectedNameSet.has(d.countryName.trim());
          return codeOk && nameOk;
        });

        setRows(filtered.slice(0, 30));
      } catch (e: any) {
        setErr(e?.message ?? "검색 실패");
        setRows([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [q, value]);

  const selectedCodeSet = useMemo(() => new Set(value.map((v) => v.countryCode)), [value]);
  const selectedNameSet = useMemo(() => new Set(value.map((v) => v.countryName.trim())), [value]);

  const add = (c: CountryItem) => {
    if (value.length >= maxSelect) return;
    if (c.countryCode && selectedCodeSet.has(c.countryCode)) return;
    if (selectedNameSet.has(c.countryName.trim())) return;

    onChange([...value, c]);

    setQ("");
    setRows([]);
    setErr(null);

    setScrollY(0);
    setContentH(1);
    setViewH(1);
  };

  const remove = (codeOrName: string) => {
    onChange(
      value.filter((v) => {

        if (v.countryCode) return v.countryCode !== codeOrName;
        return v.countryName.trim() !== codeOrName;
      })
    );
  };

  const trackH = 140;
  const pad = 10;
  const thumbMin = 22;

  const thumbH = useMemo(() => {
    const ratio = Math.min(1, viewH / Math.max(1, contentH));
    return Math.max(thumbMin, (trackH - pad * 2) * ratio);
  }, [contentH, viewH]);

  const thumbTop = useMemo(() => {
    const maxScroll = Math.max(1, contentH - viewH);
    const ratio = Math.min(1, Math.max(0, scrollY) / maxScroll);
    const travel = (trackH - pad * 2) - thumbH;
    return pad + travel * ratio;
  }, [contentH, viewH, scrollY, thumbH]);

  const onSuggestScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollY(e.nativeEvent.contentOffset.y);
  };

  return (
    <View>

      <View style={styles.underlineWrap}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="국가명을 입력해주세요."
          placeholderTextColor={PLACEHOLDER}
          style={styles.underlineInput}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      {showSuggest && (
        <View style={styles.suggestBox}>
          <View style={styles.suggestInner}>
            <ScrollView
              ref={scrollRef}
              style={{ maxHeight: trackH }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              scrollEventThrottle={16}
              onScroll={onSuggestScroll}
              onLayout={(e) => setViewH(e.nativeEvent.layout.height)}
              onContentSizeChange={(_, h) => setContentH(h)}
            >
              {loading || err || rows.length === 0 ? (
                <View style={styles.emptyRow}>
                  <Text style={styles.emptyText}>
                    {loading ? "검색 중..." : "검색 결과 없음"}
                  </Text>
                </View>
              ) : (
                rows.map((item, idx) => {
                  const isLast = idx === rows.length - 1;
                  return (
                    <View key={`${item.countryCode || item.countryName}-${idx}`}>
                      <Pressable style={styles.suggestRow} onPress={() => add(item)}>
                        <Text style={styles.suggestText}>
                          {item.countryName}
                        </Text>
                      </Pressable>
                      {!isLast && <View style={styles.divider} />}
                    </View>
                  );
                })
              )}
            </ScrollView>

            {rows.length > 0 && contentH > viewH && (
              <View pointerEvents="none" style={styles.scrollbar}>
                <View style={styles.scrollbarTrack}>
                  <View style={[styles.scrollbarThumb, { height: thumbH, top: thumbTop }]} />
                </View>
              </View>
            )}
          </View>
        </View>
      )}


      {value.length > 0 && (
        <View style={styles.chipsWrap}>
          {value.map((c, i) => {
            const key = c.countryCode ? c.countryCode : `${c.countryName}-${i}`;
            const removeKey = c.countryCode ? c.countryCode : c.countryName.trim();

            return (
              <View key={key} style={styles.chipSelected}>
                <Text style={styles.chipTextSelected}>
                  {c.countryName}
                </Text>

                <Pressable onPress={() => remove(removeKey)} style={styles.chipX} hitSlop={8}>
                  <Text style={styles.chipXText}>×</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  underlineWrap: {
    borderBottomWidth: 1,
    borderBottomColor: UNDERLINE,
    paddingBottom: 10,
  },
  underlineInput: {
    ...typography.body4_14_regular,
    color: TEXT,
    fontSize: 20,
    lineHeight: 26,
    paddingVertical: 0,
  },

  suggestBox: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: UNDERLINE,
    borderRadius: 14,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  suggestInner: { position: "relative" },

  suggestRow: {
    height: 44,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  suggestText: {
    ...typography.body4_14_regular,
    color: TEXT,
    fontSize: 20,
    lineHeight: 26,
  },
  divider: { height: 1, backgroundColor: DIVIDER },

  emptyRow: { height: 60, alignItems: "center", justifyContent: "center" },
  emptyText: {
    ...typography.sub2_12_regular,
    color: SUBTEXT,
    fontSize: 16,
  },

  scrollbar: {
    position: "absolute",
    right: 6,
    top: 0,
    bottom: 0,
    width: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollbarTrack: {
    width: 4,
    height: 140,
    borderRadius: 999,
    overflow: "hidden",
  },
  scrollbarThumb: {
    position: "absolute",
    left: 0,
    right: 0,
    borderRadius: 999,
    backgroundColor: "#F0EAE1",
  },

  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 20, 
    paddingTop: 2,
  },

  chipSelected: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: CHIP_BORDER,
    backgroundColor: CHIP_BG, 
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 999,
  },
  chipTextSelected: {
    ...typography.sub2_12_regular,
    color: CHIP_TEXT,
    fontSize: 18,
    lineHeight: 20,
  },

  chipX: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  chipXText: {
    color: CHIP_X,
    fontSize: 18,
    marginTop: -2,
  },
});

const CountryPickerOverlay = { CountryInlineInput };
export default CountryPickerOverlay;