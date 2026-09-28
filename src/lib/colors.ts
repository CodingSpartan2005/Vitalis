export const HABIT_COLORS = {
  violet: { from: "#a855f7", to: "#6366f1", glow: "rgba(168,85,247,0.55)", label: "Violeta" },
  cyan: { from: "#22d3ee", to: "#0ea5e9", glow: "rgba(34,211,238,0.5)", label: "Cian" },
  lime: { from: "#a3e635", to: "#22c55e", glow: "rgba(163,230,53,0.45)", label: "Lima" },
  amber: { from: "#fbbf24", to: "#f97316", glow: "rgba(251,191,36,0.5)", label: "Ámbar" },
  rose: { from: "#fb7185", to: "#e11d48", glow: "rgba(251,113,133,0.5)", label: "Rosa" },
} as const;

export type HabitColorKey = keyof typeof HABIT_COLORS;

export const HABIT_COLOR_KEYS = Object.keys(HABIT_COLORS) as HabitColorKey[];

export function isHabitColor(value: string): value is HabitColorKey {
  return value in HABIT_COLORS;
}

export function habitColor(value: string): (typeof HABIT_COLORS)[HabitColorKey] {
  return isHabitColor(value) ? HABIT_COLORS[value] : HABIT_COLORS.violet;
}
