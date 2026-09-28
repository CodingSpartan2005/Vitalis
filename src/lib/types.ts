export type HabitView = {
  id: number;
  title: string;
  icon: string;
  color: string;
  weekCount: number;
  total: number;
  streak: number;
  best: number;
  logs: string[];
};

export type WorkoutLogView = {
  id: number;
  routineId: string;
  routineTitle: string;
  durationMinutes: number;
  caloriesBurned: number;
  day: string;
};

export type RecipeLogView = {
  id: number;
  recipeId: string;
  recipeTitle: string;
  calories: number;
  proteinGrams: number;
  day: string;
};

export type InboxMessageView = {
  id: number;
  subject: string;
  sender: string;
  verificationCode: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

export type DashboardData = {
  habits: HabitView[];
  week: string[];
  heatmap: { day: string; count: number; total: number }[];
  totals: {
    completions: number;
    weekCompletions: number;
    weekGoal: number;
    activeHabits: number;
    bestStreak: number;
    perfectDays: number;
    dailyAverage: number;
  };
  favoriteQuoteIds: number[];
  savedRoutineIds: string[];
  savedRecipeIds: string[];
  level: { level: number; xp: number; xpForNext: number; progress: number; title: string };
  workoutLogs: WorkoutLogView[];
  recipeLogs: RecipeLogView[];
  inboxMessages: InboxMessageView[];
  userContent: UserContent;
};

import type { UserContent } from "@/lib/content-options";

export type QuoteView = {
  id: number;
  body: string;
  author: string;
  category: string;
  favorite?: boolean;
  userOwned?: boolean;
  dbId?: number;
};
