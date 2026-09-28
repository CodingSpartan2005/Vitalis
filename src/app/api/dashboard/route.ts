import { ensureSeed } from "@/db/seed";
import { getSessionUser } from "@/lib/auth";
import { getDashboardData, getQuotes } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await ensureSeed().catch(() => undefined);
  const user = await getSessionUser(request);
  if (!user) {
    return Response.json({ user: null, data: null, quotes: [] }, { status: 401 });
  }

  const [data, quotes] = await Promise.all([getDashboardData(user.id), getQuotes(user.id)]);
  return Response.json({ user, data, quotes });
}
