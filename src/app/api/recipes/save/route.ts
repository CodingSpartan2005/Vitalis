import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { savedRecipes } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return Response.json({ error: "No autenticado" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { recipeId?: string };
  const recipeId = (body.recipeId ?? "").trim();
  if (!recipeId) {
    return Response.json({ error: "Receta inválida" }, { status: 400 });
  }

  const existing = await db
    .select({ id: savedRecipes.id })
    .from(savedRecipes)
    .where(and(eq(savedRecipes.userId, user.id), eq(savedRecipes.recipeId, recipeId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(savedRecipes).where(eq(savedRecipes.id, existing[0].id));
    return Response.json({ saved: false, recipeId });
  }

  await db
    .insert(savedRecipes)
    .values({ userId: user.id, recipeId })
    .onConflictDoNothing();

  return Response.json({ saved: true, recipeId });
}
