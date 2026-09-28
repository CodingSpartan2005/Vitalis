import { sql } from "drizzle-orm";
import { db } from "@/db";
import { habitLogs, habits, quotes, users } from "@/db/schema";
import { HABIT_PRESETS, QUOTE_SEED } from "@/lib/quotes-data";
import { hashPassword } from "@/lib/auth";
import { lastNDays, shiftDays, todayISO } from "@/lib/dates";

export const DEMO_EMAIL = "demo@vitalis.app";
export const DEMO_PASSWORD = "vitalis123";

let seedPromise: Promise<void> | null = null;

async function seedQuotes(): Promise<void> {
  // Solo inserta las frases que falten. `onConflictDoNothing()` sin objetivo
  // es válido exista o no un índice único, así que la siembra nunca rompe
  // aunque la base todavía no tenga la restricción aplicada.
  const existing = await db.select({ body: quotes.body }).from(quotes);
  const known = new Set(existing.map((row) => row.body));
  const missing = QUOTE_SEED.filter((quote) => !known.has(quote.body));

  if (missing.length === 0) return;

  await db.insert(quotes).values(missing).onConflictDoNothing();
}

async function seed(): Promise<void> {
  // El catálogo de frases es contenido secundario: si falla, el registro y el
  // login deben seguir funcionando igualmente.
  try {
    await seedQuotes();
  } catch (error) {
    console.error("seed quotes skipped", error);
  }

  const existingDemo = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`${users.email} = ${DEMO_EMAIL}`)
    .limit(1);

  if (existingDemo.length > 0) return;

  const [demo] = await db
    .insert(users)
    .values({
      email: DEMO_EMAIL,
      name: "Atleta Demo",
      passwordHash: hashPassword(DEMO_PASSWORD),
      avatar: "⚡",
      goal: "12 semanas de consistencia brutal",
    })
    .returning({ id: users.id });

  if (!demo) return;

  const created = await db
    .insert(habits)
    .values(HABIT_PRESETS.map((preset) => ({ ...preset, userId: demo.id })))
    .returning({ id: habits.id });

  const today = todayISO();
  const logs: { habitId: number; userId: number; day: string }[] = [];
  created.forEach((habit, index) => {
    // Deterministic pseudo-random history so every habit looks different.
    const threshold = [0.14, 0.32, 0.44, 0.52, 0.6][index] ?? 0.45;
    const days = new Set(
      lastNDays(84).filter((_, dayIndex) => {
        const noise = Math.sin((dayIndex + 1) * 12.9898 + index * 78.233) * 43758.5453;
        return noise - Math.floor(noise) > threshold;
      }),
    );

    // Guarantee an active streak for the first habits, break one on purpose.
    const streakLen = [13, 7, 4, 0, 2][index] ?? 3;
    for (let i = 0; i < streakLen; i += 1) days.add(shiftDays(today, -i));
    if (index === 3) {
      days.delete(shiftDays(today, -1));
      days.delete(today);
    }

    days.forEach((day) => logs.push({ habitId: habit.id, userId: demo.id, day }));
  });

  if (logs.length > 0) {
    await db.insert(habitLogs).values(logs).onConflictDoNothing();
  }
}

export async function ensureSeed(): Promise<void> {
  if (!seedPromise) {
    seedPromise = seed().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  await seedPromise;
}
