// components/features/stack.utils.ts
import { PreviousTrip, StackCardItem } from "./stack.types";

export function formatDateYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export function diffDaysInclusive(start: Date, end: Date) {
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  const diff = Math.max(0, Math.round((e - s) / (1000 * 60 * 60 * 24)));
  return diff + 1;
}

/**
 * ✅ px 규칙(너가 보낸 기준)
 * 2일 이하: 62
 * 4일 이하: 70
 * 7일 이하: 78
 * 14일 이하: 86
 * 30일 이하: 94
 * 90일 이하: 102
 * 180일 이하: 110
 * 360일 이하: 118
 * 361일~ : 126
 */
export function ticketHeightByDays(days: number) {
  if (days <= 2) return 62;
  if (days <= 4) return 70;
  if (days <= 7) return 78;
  if (days <= 14) return 86;
  if (days <= 30) return 94;
  if (days <= 90) return 102;
  if (days <= 180) return 110;
  if (days <= 360) return 118;
  return 126;
}

export function tripToStackCardItem(t: PreviousTrip): StackCardItem {
  const days = diffDaysInclusive(t.startDate, t.endDate);
  const height = ticketHeightByDays(days);

  return {
    id: t.id,
    title: t.title,
    dateText: `${formatDateYMD(t.startDate)} ~ ${formatDateYMD(t.endDate)}`,
    height,
    emotionColor: t.emotion?.color ?? "#D9D3C7", // ✅ 감정 없으면 기본색
  };
}