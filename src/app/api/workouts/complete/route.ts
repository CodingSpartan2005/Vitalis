import { and, eq, ilike } from "drizzle-orm";
import { db } from "@/db";
import { habitLogs, habits, workoutLogs } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { todayISO } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return Response.json({ error: "No autenticado" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    routineId?: string;
    routineTitle?: string;
    durationMinutes?: number;
    caloriesBurned?: number;
  };

  const routineId = (body.routineId ?? "custom").slice(0, 80);
  const routineTitle = (body.routineTitle ?? "Entrenamiento VITALIS").slice(0, 120);
  const durationMinutes = Number(body.durationMinutes) || 45;
  const caloriesBurned = Number(body.caloriesBurned) || 380;
  const today = todayISO();

  const [logged] = await db
    .insert(workoutLogs)
    .values({
      userId: user.id,
      routineId,
      routineTitle,
      durationMinutes,
      caloriesBurned,
      day: today,
    })
    .returning();

  // Also automatically mark user's training habit for today if present
  const trainingHabits = await db
    .select({ id: habits.id })
    .from(habits)
    .where(and(eq(habits.userId, user.id), ilike(habits.title, "%entren%")))
    .limit(1);

  let markedHabitId: number | null = null;
  if (trainingHabits[0]) {
    markedHabitId = trainingHabits[0].id;
    await db
      .insert(habitLogs)
      .values({ habitId: markedHabitId, userId: user.id, day: today })
      .onConflictDoNothing();
  }

  return Response.json({
    workoutLog: {
      id: logged.id,
      routineId: logged.routineId,
      routineTitle: logged.routineTitle,
      durationMinutes: logged.durationMinutes,
      caloriesBurned: logged.caloriesBurned,
      day: logged.day,
    },
    markedHabitId,
    day: today,
  });
}
