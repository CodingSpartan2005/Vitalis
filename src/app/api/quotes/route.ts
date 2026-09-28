import { getSessionUser } from "@/lib/auth";
import { getQuotes } from "@/lib/data";
import { ensureSeed } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await ensureSeed().catch(() => undefined);
  const user = await getSessionUser(request);
  const list = await getQuotes(user?.id);

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");

  if (mode === "random") {
    const excludeId = Number(searchParams.get("exclude"));
    const pool = list.filter((quote) => quote.id !== excludeId);
    const source = pool.length > 0 ? pool : list;
    const quote = source[Math.floor(Math.random() * source.length)];
    return Response.json({ quote });
  }

  return Response.json({ quotes: list });
}
