import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { userQuotes, userRecipes, userRoutines, type StoredExercise } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { getUserContent } from "@/lib/user-content";
import { IMAGES } from "@/lib/images";

export const dynamic = "force-dynamic";

type Kind = "routine" | "recipe" | "quote";

function isKind(value: unknown): value is Kind {
  return value === "routine" || value === "recipe" || value === "quote";
}

function toList(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => String(v ?? "").trim())
    .filter(Boolean)
    .slice(0, max);
}

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return Response.json({ error: "No autenticado" }, { status: 401 });
  return Response.json(await getUserContent(user.id));
}

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return Response.json({ error: "No autenticado" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const kind = body.kind;
  if (!isKind(kind)) return Response.json({ error: "Tipo inválido" }, { status: 400 });

  const title = String(body.title ?? "").trim();

  if (kind === "routine") {
    if (title.length < 3) return Response.json({ error: "Ponle nombre a tu rutina." }, { status: 400 });
    const rawExercises = Array.isArray(body.exercises) ? body.exercises : [];
    const exercises: StoredExercise[] = rawExercises
      .map((ex, index) => {
        const item = (ex ?? {}) as Record<string, unknown>;
        return {
          id: `ex-${index}-${Date.now()}`,
          name: String(item.name ?? "").trim(),
          sets: Math.max(1, Math.min(12, Number(item.sets) || 3)),
          reps: String(item.reps ?? "10 reps").trim().slice(0, 30),
          restSeconds: Math.max(10, Math.min(300, Number(item.restSeconds) || 60)),
          muscle: String(item.muscle ?? "Full body").trim().slice(0, 40),
          tip: String(item.tip ?? "").trim().slice(0, 220),
        };
      })
      .filter((ex) => ex.name.length > 1)
      .slice(0, 12);

    if (exercises.length === 0) {
      return Response.json({ error: "Añade al menos un ejercicio con nombre." }, { status: 400 });
    }

    const [created] = await db
      .insert(userRoutines)
      .values({
        userId: user.id,
        title: title.slice(0, 90),
        subtitle: String(body.subtitle ?? "").trim().slice(0, 160),
        level: String(body.level ?? "Intermedio").slice(0, 20),
        durationMinutes: Math.max(5, Math.min(180, Number(body.durationMinutes) || 30)),
        caloriesBurned: Math.max(0, Math.min(2000, Number(body.caloriesBurned) || 250)),
        equipment: String(body.equipment ?? "Peso corporal").trim().slice(0, 60),
        image: String(body.image ?? IMAGES.strength).slice(0, 200),
        accent: String(body.accent ?? "from-fuchsia-500 to-violet-600").slice(0, 80),
        exercises,
      })
      .returning({ id: userRoutines.id });

    return Response.json({ ok: true, id: created.id }, { status: 201 });
  }

  if (kind === "recipe") {
    if (title.length < 3) return Response.json({ error: "Ponle nombre a tu receta." }, { status: 400 });
    const ingredients = toList(body.ingredients, 20).map((i) => i.slice(0, 120));
    const steps = toList(body.steps, 15).map((s) => s.slice(0, 400));
    if (ingredients.length === 0 || steps.length === 0) {
      return Response.json(
        { error: "Añade al menos un ingrediente y un paso de preparación." },
        { status: 400 },
      );
    }

    const [created] = await db
      .insert(userRecipes)
      .values({
        userId: user.id,
        title: title.slice(0, 90),
        subtitle: String(body.subtitle ?? "").trim().slice(0, 160),
        category: String(body.category ?? "proteina").slice(0, 30),
        prepMinutes: Math.max(1, Math.min(240, Number(body.prepMinutes) || 15)),
        calories: Math.max(0, Math.min(3000, Number(body.calories) || 400)),
        protein: Math.max(0, Math.min(300, Number(body.protein) || 30)),
        carbs: Math.max(0, Math.min(400, Number(body.carbs) || 30)),
        fats: Math.max(0, Math.min(300, Number(body.fats) || 10)),
        image: String(body.image ?? IMAGES.nutrition).slice(0, 200),
        accent: String(body.accent ?? "from-lime-400 to-emerald-500").slice(0, 80),
        ingredients,
        steps,
      })
      .returning({ id: userRecipes.id });

    return Response.json({ ok: true, id: created.id }, { status: 201 });
  }

  const quoteBody = String(body.body ?? "").trim();
  if (quoteBody.length < 4) {
    return Response.json({ error: "Escribe tu frase motivacional." }, { status: 400 });
  }

  const [created] = await db
    .insert(userQuotes)
    .values({
      userId: user.id,
      body: quoteBody.slice(0, 300),
      author: String(body.author ?? "Mi mantra").trim().slice(0, 60) || "Mi mantra",
      category: String(body.category ?? "mindset").slice(0, 30),
    })
    .returning({ id: userQuotes.id });

  return Response.json({ ok: true, id: created.id }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return Response.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind");
  const id = Number(searchParams.get("id"));
  if (!isKind(kind) || !Number.isFinite(id)) {
    return Response.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  if (kind === "routine") {
    await db.delete(userRoutines).where(and(eq(userRoutines.id, id), eq(userRoutines.userId, user.id)));
  } else if (kind === "recipe") {
    await db.delete(userRecipes).where(and(eq(userRecipes.id, id), eq(userRecipes.userId, user.id)));
  } else {
    await db.delete(userQuotes).where(and(eq(userQuotes.id, id), eq(userQuotes.userId, user.id)));
  }

  return Response.json({ ok: true });
}
