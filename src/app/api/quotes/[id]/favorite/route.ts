import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { favoriteQuotes } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(request);
  if (!user) return Response.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const quoteId = Number(id);
  if (!Number.isFinite(quoteId)) {
    return Response.json({ error: "Id inválido" }, { status: 400 });
  }

  const existing = await db
    .select({ id: favoriteQuotes.id })
    .from(favoriteQuotes)
    .where(and(eq(favoriteQuotes.userId, user.id), eq(favoriteQuotes.quoteId, quoteId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(favoriteQuotes).where(eq(favoriteQuotes.id, existing[0].id));
    return Response.json({ favorite: false });
  }

  await db.insert(favoriteQuotes).values({ userId: user.id, quoteId }).onConflictDoNothing();
  return Response.json({ favorite: true });
}
