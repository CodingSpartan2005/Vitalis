import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { habits } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { getHabitsWithLogs } from "@/lib/data";
import { isHabitColor } from "@/lib/colors";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return Response.json({ error: "No autenticado" }, { status: 401 });
  const list = await getHabitsWithLogs(user.id);
  return Response.json({ habits: list });
}

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return Response.json({ error: "No autenticado" }, { status: 401 });

  const body = (await request.json()) as { title?: string; icon?: string; color?: string };
  const title = (body.title ?? "").trim();
  if (title.length < 2) {
    return Response.json({ error: "El hábito necesita un nombre." }, { status: 400 });
  }

  const color = isHabitColor(body.color ?? "") ? body.color : "violet";
  const icon = (body.icon ?? "💪").slice(0, 4) || "💪";

  const [created] = await db
    .insert(habits)
    .values({ userId: user.id, title: title.slice(0, 60), icon, color })
    .returning();

  return Response.json({ habit: created }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return Response.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!Number.isFinite(id)) {
    return Response.json({ error: "Id inválido" }, { status: 400 });
  }

  await db.delete(habits).where(and(eq(habits.id, id), eq(habits.userId, user.id)));
  return Response.json({ ok: true });
}
