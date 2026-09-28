import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { habitLogs } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { todayISO } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(request);
  if (!user) return Response.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const habitId = Number(id);
  if (!Number.isFinite(habitId)) {
    return Response.json({ error: "Id inválido" }, { status: 400 });
  }

  const body = (await request.json().catch(() => ({}))) as { day?: string };
  const today = todayISO();
  const day = /^\d{4}-\d{2}-\d{2}$/.test(body.day ?? "") ? (body.day as string) : today;

  if (day > today) {
    return Response.json({ error: "No puedes marcar el futuro (todavía)." }, { status: 400 });
  }

  const existing = await db
    .select({ id: habitLogs.id })
    .from(habitLogs)
    .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.day, day), eq(habitLogs.userId, user.id)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(habitLogs).where(eq(habitLogs.id, existing[0].id));
    return Response.json({ done: false, day });
  }

  await db
    .insert(habitLogs)
    .values({ habitId, userId: user.id, day })
    .onConflictDoNothing();

  return Response.json({ done: true, day });
}
