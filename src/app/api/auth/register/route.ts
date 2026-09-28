import { eq } from "drizzle-orm";
import { db } from "@/db";
import { habits, inboxMessages, users } from "@/db/schema";
import { createSession, hashPassword, isValidEmail } from "@/lib/auth";
import { isHabitColor } from "@/lib/colors";
import { buildWelcomeEmail } from "@/lib/fitness-content";
import { ensureSeed } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // Sembrar contenido de ejemplo nunca debe bloquear el alta o el acceso.
    await ensureSeed().catch(() => undefined);
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      avatar?: string;
      goal?: string;
      initialHabits?: { title: string; icon: string; color: string }[];
    };

    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    const goal = (body.goal ?? "").trim() || "Construir mi mejor versión";

    if (name.length < 2) {
      return Response.json({ error: "Tu nombre necesita al menos 2 caracteres." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return Response.json({ error: "Ese email no parece válido." }, { status: 400 });
    }
    if (password.length < 6) {
      return Response.json({ error: "La contraseña necesita 6 caracteres o más." }, { status: 400 });
    }

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return Response.json({ error: "Ese email ya está registrado. Inicia sesión directamente." }, { status: 409 });
    }

    const [created] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash: hashPassword(password),
        avatar: (body.avatar ?? "🔥").slice(0, 4),
        goal: goal.slice(0, 140),
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        goal: users.goal,
      });

    if (!created) {
      return Response.json({ error: "No pudimos crear tu cuenta." }, { status: 500 });
    }

    const providedHabits = Array.isArray(body.initialHabits)
      ? body.initialHabits
          .map((h) => ({
            title: (h.title ?? "").trim().slice(0, 60),
            icon: (h.icon ?? "💪").slice(0, 4) || "💪",
            color: isHabitColor(h.color ?? "") ? h.color : "violet",
          }))
          .filter((h) => h.title.length >= 2)
      : [];

    const starterHabits =
      providedHabits.length > 0
        ? providedHabits
        : [
            { title: `Meta: ${goal.slice(0, 42)}`, icon: "🎯", color: "violet" },
            { title: "Entrenar mi rutina del día", icon: "🏋️", color: "cyan" },
            { title: "Comer receta alta en proteína", icon: "🥗", color: "lime" },
          ];

    await db.insert(habits).values(starterHabits.map((h) => ({ ...h, userId: created.id })));

    const code = String(100000 + Math.floor(Math.random() * 900000));
    const welcome = buildWelcomeEmail({
      name: created.name,
      email: created.email,
      goal: created.goal,
      code,
    });

    const [savedMail] = await db
      .insert(inboxMessages)
      .values({
        userId: created.id,
        subject: welcome.subject,
        verificationCode: code,
        body: welcome.body,
        isRead: false,
      })
      .returning();

    const token = await createSession(created.id);

    return Response.json({
      token,
      user: created,
      welcomeEmail: savedMail
        ? {
            id: savedMail.id,
            subject: savedMail.subject,
            sender: savedMail.sender,
            verificationCode: savedMail.verificationCode,
            body: savedMail.body,
          }
        : null,
    });
  } catch (error) {
    console.error("register failed", error);
    return Response.json({ error: "Algo se rompió en el servidor." }, { status: 500 });
  }
}
