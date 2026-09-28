import { and, eq, ilike } from "drizzle-orm";
import { db } from "@/db";
import { habitLogs, habits, recipeLogs } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { todayISO } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return Response.json({ error: "No autenticado" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    recipeId?: string;
    recipeTitle?: string;
    calories?: number;
    proteinGrams?: number;
  };

  const recipeId = (body.recipeId ?? "custom").slice(0, 80);
  const recipeTitle = (body.recipeTitle ?? "Receta saludable VITALIS").slice(0, 120);
  const calories = Number(body.calories) || 450;
  const proteinGrams = Number(body.proteinGrams) || 35;
  const today = todayISO();

  const [logged] = await db
    .insert(recipeLogs)
    .values({
      userId: user.id,
      recipeId,
      recipeTitle,
      calories,
      proteinGrams,
      day: today,
    })
    .returning();

  // Also automatically mark user's healthy meal habit for today if present
  const mealHabits = await db
    .select({ id: habits.id })
    .from(habits)
    .where(and(eq(habits.userId, user.id), ilike(habits.title, "%comer%")))
    .limit(1);

  let markedHabitId: number | null = null;
  if (mealHabits[0]) {
    markedHabitId = mealHabits[0].id;
    await db
      .insert(habitLogs)
      .values({ habitId: markedHabitId, userId: user.id, day: today })
      .onConflictDoNothing();
  }

  return Response.json({
    recipeLog: {
      id: logged.id,
      recipeId: logged.recipeId,
      recipeTitle: logged.recipeTitle,
      calories: logged.calories,
      proteinGrams: logged.proteinGrams,
      day: logged.day,
    },
    markedHabitId,
    day: today,
  });
}
