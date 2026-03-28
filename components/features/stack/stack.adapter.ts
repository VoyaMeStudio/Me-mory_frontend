import type { TimelineTrip } from "@/api/timeline";
import type { PreviousTrip } from "@/components/features/stack.types";

function parseYMD(s: unknown) {
  const str = String(s ?? "");
  const normalized = str.includes(".") ? str.replace(/\./g, "-") : str;
  const [y, m, d] = normalized.split("-").map((v) => Number(v));
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

type VisitedCountryLike = {
  countryCode?: string;
  countryName?: string;
  emoji?: string;
  emotionName?: string;
  emotionColor?: string;
};

function normCode(v: unknown) {
  const s = String(v ?? "").trim().toUpperCase();
  return s;
}

function normName(v: unknown) {
  const s = String(v ?? "").trim();
  return s;
}

export function timelineTripToPreviousTrip(t: TimelineTrip): PreviousTrip {
  const anyT = t as any;

  const emotionIdRaw =
    anyT.emotionId ??
    anyT.tripEmotionId ??
    anyT.emotion_id ??
    anyT.emotion?.id ??
    anyT.emotion?.emotionId ??
    anyT.tripEmotion?.id ??
    anyT.moodId ??
    0;

  const emotionNameRaw =
    anyT.emotionName ??
    anyT.emotion?.name ??
    anyT.tripEmotion?.name ??
    anyT.moodName ??
    undefined;

  const emotionColorRaw =
    anyT.emotionColor ??
    anyT.emotionColorCode ??
    anyT.colorCode ??
    anyT.emotion?.colorCode ??
    anyT.emotion?.color ??
    anyT.tripEmotion?.colorCode ??
    anyT.tripEmotion?.color ??
    undefined;

  const emotionId = Number(emotionIdRaw) || 0;

  const emotionName =
    typeof emotionNameRaw === "string" && emotionNameRaw.trim()
      ? emotionNameRaw.trim()
      : undefined;

  const emotionColor =
    typeof emotionColorRaw === "string" && emotionColorRaw.trim()
      ? emotionColorRaw.trim()
      : undefined;

  const visitedCountriesRaw: VisitedCountryLike[] = Array.isArray(anyT.visitedCountries)
    ? anyT.visitedCountries
    : [];

  const visitedCountries =
    visitedCountriesRaw.length > 0
      ? visitedCountriesRaw
          .map((c) => {
            const code = normCode(c?.countryCode);
            if (!code) return null;

            const name = normName(c?.countryName) || code;

            return {
              countryCode: code,
              countryName: name,
              emoji: c?.emoji ? String(c.emoji) : undefined,
              emotionName: c?.emotionName ? String(c.emotionName) : undefined,
              emotionColor: c?.emotionColor ? String(c.emotionColor) : undefined,
            };
          })
          .filter(Boolean) as PreviousTrip["visitedCountries"]
      : undefined;

  const codesFromVisited = visitedCountries?.map((c) => c.countryCode) ?? [];

  const codesFromCountryCodes = Array.isArray(anyT.countryCodes)
    ? anyT.countryCodes
        .map((x: any) => normCode(x))
        .filter(Boolean)
    : [];

  const codesFromVisitedCountryCodes = Array.isArray(anyT.visitedCountryCodes)
    ? anyT.visitedCountryCodes
        .map((x: any) => normCode(x))
        .filter(Boolean)
    : [];

  const countryCodes =
    codesFromVisited.length > 0
      ? codesFromVisited
      : codesFromCountryCodes.length > 0
        ? codesFromCountryCodes
        : codesFromVisitedCountryCodes;

  return {
    id: Number(anyT.tripId ?? anyT.id),
    tripName: String(anyT.tripName ?? ""),
    description: String(anyT.description ?? ""),
    startDate: parseYMD(anyT.startDate),
    endDate: parseYMD(anyT.endDate),
    representativeImageUrl: anyT.representativeImageUrl ?? null,
    isArchived: Boolean(anyT.isStored ?? anyT.isArchived ?? false),

    visitedCountries,
    countryCodes,

    emotionId,
    emotionName,
    emotionColor,
  };
}