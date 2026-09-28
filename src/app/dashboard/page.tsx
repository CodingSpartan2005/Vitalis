import { redirect } from "next/navigation";
import HomeShell from "@/components/HomeShell";
import type { ActiveHubTab } from "@/components/Nav";
import { ensureSeed } from "@/db/seed";
import { getSessionUser, getUserFromToken } from "@/lib/auth";
import { getDashboardData, getQuotes } from "@/lib/data";

export const dynamic = "force-dynamic";

const VALID_TABS: ActiveHubTab[] = [
  "overview",
  "tracker",
  "routines",
  "recipes",
  "quotes",
  "inbox",
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; s?: string }>;
}) {
  await ensureSeed().catch(() => undefined);
  const params = await searchParams;
  const requestedTab = VALID_TABS.includes(params.tab as ActiveHubTab)
    ? (params.tab as ActiveHubTab)
    : "overview";

  if (params.s) {
    const lockedUser = await getUserFromToken(params.s);
    if (lockedUser) {
      redirect(`/?s=${encodeURIComponent(params.s)}&tab=${requestedTab}`);
    }
  }

  const user = await getSessionUser();
  if (user) {
    const [data, quotes] = await Promise.all([
      getDashboardData(user.id),
      getQuotes(user.id),
    ]);
    return (
      <HomeShell
        serverUser={user}
        serverData={data}
        serverQuotes={quotes}
        initialTab={requestedTab}
        forceAuthRedirect
      />
    );
  }

  return (
    <HomeShell
      serverUser={null}
      serverData={null}
      serverQuotes={[]}
      initialTab={requestedTab}
      forceAuthRedirect
    />
  );
}
