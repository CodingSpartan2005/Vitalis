import { computeBestStreak, computeStreak } from "@/lib/dates";
import type { HabitView } from "@/lib/types";

export type Totals = {
  completions: number;
  weekCompletions: number;
  weekGoal: number;
  activeHabits: number;
  bestStreak: number;
  perfectDays: number;
  dailyAverage: number;
};

export const LEVEL_TITLES = [
  "Chispa",
  "Iniciado",
  "Constante",
  "Disciplinado",
  "Guerrero",
  "Maestro del hábito",
  "Leyenda Vitalis",
];

export function weekCountFor(logs: string[], week: string[]): number {
  const set = new Set(logs);
  return week.filter((day) => set.has(day)).length;
}

export function withStats(habit: HabitView): HabitView {
  return {
    ...habit,
    streak: computeStreak(habit.logs),
    best: computeBestStreak(habit.logs),
  };
}

export function computeTotals(
  habits: HabitView[],
  week: string[],
  windowDays: string[],
): { totals: Totals; perDay: Map<string, number> } {
  const perDay = new Map<string, number>();
  const windowSet = new Set(windowDays);

  for (const habit of habits) {
    for (const day of habit.logs) {
      if (windowSet.has(day)) perDay.set(day, (perDay.get(day) ?? 0) + 1);
    }
  }

  const completions = habits.reduce((sum, habit) => sum + habit.total, 0);
  const weekCompletions = habits.reduce(
    (sum, habit) => sum + weekCountFor(habit.logs, week),
    0,
  );
  const bestStreak = habits.reduce((max, habit) => Math.max(max, habit.best), 0);
  const total = habits.length || 1;
  const perfectDays = windowDays.filter((day) => (perDay.get(day) ?? 0) >= total).length;
  const dailyAverage = completions / total;

  return {
    perDay,
    totals: {
      completions,
      weekCompletions,
      weekGoal: habits.length * 7,
      activeHabits: habits.length,
      bestStreak,
      perfectDays,
      dailyAverage: Math.round(dailyAverage * 10) / 10,
    },
  };
}

export function levelFromXp(xp: number) {
  const level = Math.max(1, Math.floor(xp / 500) + 1);
  return {
    level,
    xp,
    xpForNext: level * 500,
    progress: Math.min(100, Math.round((xp / (level * 500)) * 100)),
    title: LEVEL_TITLES[Math.min(LEVEL_TITLES.length - 1, level - 1)],
  };
}

export function xpFromTotals(totals: Totals): number {
  return totals.completions * 10 + totals.perfectDays * 25;
}
