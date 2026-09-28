import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, verifyPassword } from "@/lib/auth";
import { ensureUserWelcomeEmail } from "@/lib/data";
import { ensureSeed } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // Sembrar contenido de ejemplo nunca debe bloquear el alta o el acceso.
    await ensureSeed().catch(() => undefined);
    const body = (await request.json()) as { email?: string; password?: string };
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";

    if (!email || !password) {
      return Response.json({ error: "Introduce email y contraseña." }, { status: 400 });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return Response.json({ error: "Credenciales incorrectas." }, { status: 401 });
    }

    await ensureUserWelcomeEmail(user.id);
    const token = await createSession(user.id);

    return Response.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        goal: user.goal,
      },
    });
  } catch (error) {
    console.error("login failed", error);
    return Response.json({ error: "Algo se rompió en el servidor." }, { status: 500 });
  }
}
