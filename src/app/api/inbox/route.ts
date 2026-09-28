import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { inboxMessages } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { buildWelcomeEmail } from "@/lib/fitness-content";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return Response.json({ error: "No autenticado" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    action?: "read" | "resend";
    messageId?: number;
  };

  if (body.action === "read" && body.messageId) {
    await db
      .update(inboxMessages)
      .set({ isRead: true })
      .where(and(eq(inboxMessages.id, body.messageId), eq(inboxMessages.userId, user.id)));
    return Response.json({ ok: true });
  }

  if (body.action === "resend") {
    const code = String(100000 + Math.floor(Math.random() * 900000));
    const welcome = buildWelcomeEmail({
      name: user.name,
      email: user.email,
      goal: user.goal,
      code,
    });
    const [created] = await db
      .insert(inboxMessages)
      .values({
        userId: user.id,
        subject: welcome.subject,
        verificationCode: code,
        body: welcome.body,
        isRead: false,
      })
      .returning();

    return Response.json({
      message: {
        id: created.id,
        subject: created.subject,
        sender: created.sender,
        verificationCode: created.verificationCode,
        body: created.body,
        isRead: created.isRead,
        createdAt: created.createdAt.toISOString(),
      },
    });
  }

  return Response.json({ ok: true });
}
