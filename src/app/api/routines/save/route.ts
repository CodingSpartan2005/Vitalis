import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { savedRoutines } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return Response.json({ error: "No autenticado" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { routineId?: string };
  const routineId = (body.routineId ?? "").trim();
  if (!routineId) {
    return Response.json({ error: "Rutina inválida" }, { status: 400 });
  }

  const existing = await db
    .select({ id: savedRoutines.id })
    .from(savedRoutines)
    .where(and(eq(savedRoutines.userId, user.id), eq(savedRoutines.routineId, routineId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(savedRoutines).where(eq(savedRoutines.id, existing[0].id));
    return Response.json({ saved: false, routineId });
  }

  await db
    .insert(savedRoutines)
    .values({ userId: user.id, routineId })
    .onConflictDoNothing();

  return Response.json({ saved: true, routineId });
}
