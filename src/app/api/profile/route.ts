import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return Response.json({ error: "No autenticado" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    goal?: string;
    avatar?: string;
  };

  const name = (body.name ?? user.name).trim().slice(0, 60) || user.name;
  const goal = (body.goal ?? user.goal).trim().slice(0, 140) || user.goal;
  const avatar = (body.avatar ?? user.avatar).trim().slice(0, 4) || user.avatar;

  const [updated] = await db
    .update(users)
    .set({ name, goal, avatar })
    .where(eq(users.id, user.id))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      avatar: users.avatar,
      goal: users.goal,
    });

  return Response.json({ user: updated });
}
