export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function shiftDays(iso: string, delta: number): string {
  const d = new Date(`${iso}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return toISODate(d);
}

/** Monday-first week start for the given ISO date. */
export function startOfWeek(iso: string): string {
  const d = new Date(`${iso}T00:00:00.000Z`);
  const day = d.getUTCDay(); // 0 = sunday
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return toISODate(d);
}

export function weekDates(anchorISO: string): string[] {
  const start = startOfWeek(anchorISO);
  return Array.from({ length: 7 }, (_, i) => shiftDays(start, i));
}

export function lastNDays(n: number, endISO: string = todayISO()): string[] {
  return Array.from({ length: n }, (_, i) => shiftDays(endISO, -(n - 1 - i)));
}

export function dayNumber(iso: string): number {
  return Number(iso.slice(8, 10));
}

export function weekdayLabel(iso: string): string {
  const names = ["L", "M", "X", "J", "V", "S", "D"];
  const d = new Date(`${iso}T00:00:00.000Z`).getUTCDay();
  return names[d === 0 ? 6 : d - 1];
}

export function prettyDate(iso: string): string {
  const months = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic",
  ];
  const d = new Date(`${iso}T00:00:00.000Z`);
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]}`;
}

/** Consecutive days completed ending today (or yesterday, grace period). */
export function computeStreak(doneDays: string[]): number {
  const set = new Set(doneDays);
  let cursor = todayISO();
  if (!set.has(cursor)) {
    cursor = shiftDays(cursor, -1);
    if (!set.has(cursor)) return 0;
  }
  let streak = 0;
  while (set.has(cursor)) {
    streak += 1;
    cursor = shiftDays(cursor, -1);
  }
  return streak;
}

export function computeBestStreak(doneDays: string[]): number {
  const sorted = [...new Set(doneDays)].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of sorted) {
    run = prev && shiftDays(prev, 1) === day ? run + 1 : 1;
    best = Math.max(best, run);
    prev = day;
  }
  return best;
}
