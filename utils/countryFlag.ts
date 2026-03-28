export function countryCodeToFlagEmoji(code: string): string {
  if (!code || code.length !== 2) return "🏳️";

  const upper = code.toUpperCase();
  const A = 0x1f1e6;
  const asciiA = 65;

  const first = upper.charCodeAt(0) - asciiA + A;
  const second = upper.charCodeAt(1) - asciiA + A;

  return String.fromCodePoint(first, second);
}

export function splitFlags(flags: string): string[] {
  if (!flags) return [];
  return Array.from(flags.matchAll(/\p{Regional_Indicator}{2}/gu), (m) => m[0]);
}