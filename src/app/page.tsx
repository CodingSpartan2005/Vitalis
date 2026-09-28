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

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; s?: string }>;
}) {
  await ensureSeed().catch(() => undefined);
  const params = await searchParams;
  const requestedTab = VALID_TABS.includes(params.tab as ActiveHubTab)
    ? (params.tab as ActiveHubTab)
    : "overview";

  // The login handoff token always wins over a stale demo cookie.
  if (params.s) {
    const lockedUser = await getUserFromToken(params.s);
    if (!lockedUser) {
      return (
        <HomeShell
          serverUser={null}
          serverData={null}
          serverQuotes={[]}
          initialTab={requestedTab}
        />
      );
    }
    const [data, quotes] = await Promise.all([
      getDashboardData(lockedUser.id),
      getQuotes(lockedUser.id),
    ]);
    return (
      <HomeShell
        serverUser={lockedUser}
        serverData={data}
        serverQuotes={quotes}
        initialTab={requestedTab}
        lockToken={params.s}
      />
    );
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
      />
    );
  }

  return (
    <HomeShell
      serverUser={null}
      serverData={null}
      serverQuotes={[]}
      initialTab={requestedTab}
    />
  );
}
