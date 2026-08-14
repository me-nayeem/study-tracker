const DHAKA_TZ = "Asia/Dhaka";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function getDhakaDateParts(date: Date): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: DHAKA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return { year: Number(map.year), month: Number(map.month), day: Number(map.day) };
}

export function getDailyKey(date: Date): string {
  const { year, month, day } = getDhakaDateParts(date);
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function getWeeklyKey(date: Date): string {
  const { year, month, day } = getDhakaDateParts(date);
  const anchor = new Date(Date.UTC(year, month - 1, day));
  const weekday = anchor.getUTCDay();
  anchor.setUTCDate(anchor.getUTCDate() - weekday);
  return `${anchor.getUTCFullYear()}-${pad(anchor.getUTCMonth() + 1)}-${pad(anchor.getUTCDate())}`;
}

export function getMonthlyKey(date: Date): string {
  const { year, month } = getDhakaDateParts(date);
  return `${year}-${pad(month)}`;
}

export const ALL_TIME_KEY = "ALL";
