import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  favoriteQuotes,
  habitLogs,
  habits,
  inboxMessages,
  quotes as quotesTable,
  recipeLogs,
  savedRecipes,
  savedRoutines,
  users,
  workoutLogs,
} from "@/db/schema";
import { computeBestStreak, computeStreak, lastNDays, todayISO, weekDates } from "@/lib/dates";
import { buildWelcomeEmail } from "@/lib/fitness-content";
import { getUserContent } from "@/lib/user-content";
import { computeTotals, levelFromXp, weekCountFor, xpFromTotals } from "@/lib/stats";
import type { DashboardData, HabitView, QuoteView } from "@/lib/types";

export async function getHabitsWithLogs(userId: number): Promise<HabitView[]> {
  const rows = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, userId), eq(habits.archived, false)))
    .orderBy(asc(habits.id));

  if (rows.length === 0) return [];

  const logs = await db
    .select({ habitId: habitLogs.habitId, day: habitLogs.day })
    .from(habitLogs)
    .where(eq(habitLogs.userId, userId))
    .orderBy(asc(habitLogs.day));

  const byHabit = new Map<number, string[]>();
  for (const log of logs) {
    const list = byHabit.get(log.habitId);
    if (list) list.push(log.day);
    else byHabit.set(log.habitId, [log.day]);
  }

  const week = weekDates(todayISO());

  return rows.map((habit) => {
    const days = byHabit.get(habit.id) ?? [];
    return {
      id: habit.id,
      title: habit.title,
      icon: habit.icon,
      color: habit.color,
      logs: days,
      weekCount: weekCountFor(days, week),
      total: days.length,
      streak: computeStreak(days),
      best: computeBestStreak(days),
    };
  });
}

export async function ensureUserWelcomeEmail(userId: number): Promise<void> {
  const existing = await db
    .select({ id: inboxMessages.id })
    .from(inboxMessages)
    .where(eq(inboxMessages.userId, userId))
    .limit(1);

  if (existing.length > 0) return;

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return;

  const code = String(100000 + ((user.id * 17389) % 900000));
  const mail = buildWelcomeEmail({
    name: user.name,
    email: user.email,
    goal: user.goal,
    code,
  });

  await db.insert(inboxMessages).values({
    userId: user.id,
    subject: mail.subject,
    verificationCode: code,
    body: mail.body,
    isRead: false,
  });
}

export async function getDashboardData(userId: number): Promise<DashboardData> {
  await ensureUserWelcomeEmail(userId);
  const habitViews = await getHabitsWithLogs(userId);
  const today = todayISO();
  const week = weekDates(today);
  const window = lastNDays(91);

  const { totals, perDay } = computeTotals(habitViews, week, window);

  const heatmap = window.map((day) => ({
    day,
    count: perDay.get(day) ?? 0,
    total: habitViews.length || 1,
  }));

  const [favorites, workouts, recipes, inbox, userSavedRoutines, userSavedRecipes] =
    await Promise.all([
      db
        .select({ quoteId: favoriteQuotes.quoteId })
        .from(favoriteQuotes)
        .where(eq(favoriteQuotes.userId, userId)),
      db
        .select()
        .from(workoutLogs)
        .where(eq(workoutLogs.userId, userId))
        .orderBy(desc(workoutLogs.createdAt))
        .limit(20),
      db
        .select()
        .from(recipeLogs)
        .where(eq(recipeLogs.userId, userId))
        .orderBy(desc(recipeLogs.createdAt))
        .limit(20),
      db
        .select()
        .from(inboxMessages)
        .where(eq(inboxMessages.userId, userId))
        .orderBy(desc(inboxMessages.createdAt)),
      db
        .select({ routineId: savedRoutines.routineId })
        .from(savedRoutines)
        .where(eq(savedRoutines.userId, userId)),
      db
        .select({ recipeId: savedRecipes.recipeId })
        .from(savedRecipes)
        .where(eq(savedRecipes.userId, userId)),
    ]);

  const extraXp = workouts.length * 50 + recipes.length * 15;

  return {
    habits: habitViews,
    week,
    heatmap,
    totals,
    favoriteQuoteIds: favorites.map((fav) => fav.quoteId),
    savedRoutineIds: userSavedRoutines.map((r) => r.routineId),
    savedRecipeIds: userSavedRecipes.map((r) => r.recipeId),
    userContent: await getUserContent(userId),
    level: levelFromXp(xpFromTotals(totals) + extraXp),
    workoutLogs: workouts.map((w) => ({
      id: w.id,
      routineId: w.routineId,
      routineTitle: w.routineTitle,
      durationMinutes: w.durationMinutes,
      caloriesBurned: w.caloriesBurned,
      day: w.day,
    })),
    recipeLogs: recipes.map((r) => ({
      id: r.id,
      recipeId: r.recipeId,
      recipeTitle: r.recipeTitle,
      calories: r.calories,
      proteinGrams: r.proteinGrams,
      day: r.day,
    })),
    inboxMessages: inbox.map((m) => ({
      id: m.id,
      subject: m.subject,
      sender: m.sender,
      verificationCode: m.verificationCode,
      body: m.body,
      isRead: m.isRead,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}

export async function getQuotes(userId?: number): Promise<QuoteView[]> {
  const rows = await db.select().from(quotesTable).orderBy(asc(quotesTable.id));

  if (!userId) return rows.map((row) => ({ ...row, favorite: false }));

  const favorites = await db
    .select({ quoteId: favoriteQuotes.quoteId })
    .from(favoriteQuotes)
    .where(eq(favoriteQuotes.userId, userId));
  const favSet = new Set(favorites.map((fav) => fav.quoteId));

  return rows.map((row) => ({ ...row, favorite: favSet.has(row.id) }));
}
