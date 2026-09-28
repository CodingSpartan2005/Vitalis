"use client";

import { useEffect, useState } from "react";
import Nav, { type ActiveHubTab } from "@/components/Nav";
import ScrollProgress from "@/components/ScrollProgress";
import Hero from "@/components/Hero";
import Pillars from "@/components/landing/Pillars";
import TrackerPreview from "@/components/landing/TrackerPreview";
import FitnessPreview from "@/components/landing/FitnessPreview";
import QuotesSection from "@/components/landing/QuotesSection";
import Community from "@/components/landing/Community";
import Footer from "@/components/Footer";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { BrandLoader, IntroLoader } from "@/components/fx";
import {
  authFetch,
  clearClientSession,
  getStoredToken,
  getStoredUser,
  saveClientSession,
  type ClientUser,
} from "@/lib/client-auth";
import type { DashboardData, QuoteView } from "@/lib/types";

type Props = {
  serverUser: ClientUser | null;
  serverData: DashboardData | null;
  serverQuotes: QuoteView[];
  initialTab?: ActiveHubTab;
  forceAuthRedirect?: boolean;
  lockToken?: string;
};

export default function HomeShell({
  serverUser,
  serverData,
  serverQuotes,
  initialTab = "overview",
  forceAuthRedirect = false,
  lockToken,
}: Props) {
  const [user, setUser] = useState<ClientUser | null>(serverUser);
  const [data, setData] = useState<DashboardData | null>(serverData);
  const [quotes, setQuotes] = useState<QuoteView[]>(serverQuotes);
  // Never block the first paint: the server-rendered view (landing or dashboard)
  // is shown immediately and only swapped when a *different* local session wins.
  const [checkingToken, setCheckingToken] = useState<boolean>(false);

  useEffect(() => {
    if (lockToken && serverUser && serverData) {
      saveClientSession(lockToken, serverUser);
      setUser(serverUser);
      setData(serverData);
      setQuotes(serverQuotes);
      const url = new URL(window.location.href);
      if (url.searchParams.has("s")) {
        url.searchParams.delete("s");
        window.history.replaceState({}, "", `${url.pathname}${url.search}`);
      }
      return;
    }

    const token = getStoredToken();
    const storedUser = getStoredUser();

    if (!token) {
      if (!serverUser && forceAuthRedirect) {
        window.location.href = "/entrar";
      }
      return;
    }

    // The server already rendered this exact account -> adopt it, no fetch.
    if (serverUser && serverData && (!storedUser || storedUser.id === serverUser.id)) {
      saveClientSession(token, serverUser);
      setUser(serverUser);
      setData(serverData);
      setQuotes(serverQuotes);
      return;
    }

    // A different account is stored locally than the one just rendered:
    // show the loader only for this identity switch.
    setCheckingToken(true);

    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch("/api/dashboard");
        if (!res.ok) {
          if (!cancelled) {
            if (serverUser && serverData && !storedUser) {
              setUser(serverUser);
              setData(serverData);
            } else {
              clearClientSession();
              setUser(null);
              setData(null);
              if (forceAuthRedirect) window.location.href = "/entrar";
            }
          }
          return;
        }
        const json = (await res.json()) as {
          user: ClientUser;
          data: DashboardData;
          quotes: QuoteView[];
        };
        if (!cancelled && json.user && json.data) {
          if (storedUser && json.user.id !== storedUser.id) {
            window.location.href = `/?s=${encodeURIComponent(token)}`;
            return;
          }
          saveClientSession(token, json.user);
          setUser(json.user);
          setData(json.data);
          setQuotes(json.quotes ?? []);
        }
      } catch {
        if (!cancelled && !(serverUser && serverData)) {
          setUser(null);
          setData(null);
        }
      } finally {
        if (!cancelled) setCheckingToken(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [serverUser, serverData, serverQuotes, forceAuthRedirect, lockToken]);

  if (checkingToken) {
    return <BrandLoader label="Cargando tu perfil personal…" />;
  }

  if (user && data) {
    return (
      <>
        <IntroLoader />
        <DashboardClient
          key={user.id}
          user={user}
          data={data}
          quotes={quotes}
          initialTab={initialTab}
        />
      </>
    );
  }

  return (
    <main className="relative">
      <IntroLoader />
      <ScrollProgress />
      <Nav user={null} />
      <Hero />
      <Pillars />
      <TrackerPreview />
      <FitnessPreview />
      <QuotesSection />
      <Community />
      <Footer />
    </main>
  );
}
