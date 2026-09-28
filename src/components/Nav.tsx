"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Flame,
  LogOut,
  CheckSquare,
  Dumbbell,
  Salad,
  Quote,
  Mail,
  Sparkles,
} from "lucide-react";
import { authFetch, clearClientSession, getStoredUser } from "@/lib/client-auth";

export type NavUser = { name: string; avatar: string } | null;

export type ActiveHubTab = "overview" | "tracker" | "routines" | "recipes" | "quotes" | "inbox";

type NavProps = {
  user: NavUser;
  activeTab?: ActiveHubTab;
  onSelectTab?: (tab: ActiveHubTab) => void;
  unreadEmails?: number;
};

const PUBLIC_LINKS = [
  { href: "/#pilares", label: "Pilares" },
  { href: "/#tracker", label: "Habit Tracker" },
  { href: "/#rutinas-preview", label: "Rutinas & Recetas" },
  { href: "/#frases", label: "Frases" },
  { href: "/#comunidad", label: "Comunidad" },
];

const HUB_TABS: { id: ActiveHubTab; label: string; icon: typeof Flame }[] = [
  { id: "overview", label: "Inicio", icon: Sparkles },
  { id: "tracker", label: "Habit Tracker", icon: CheckSquare },
  { id: "routines", label: "Rutinas Fitness", icon: Dumbbell },
  { id: "recipes", label: "Recetas Fitness", icon: Salad },
  { id: "quotes", label: "Frases", icon: Quote },
  { id: "inbox", label: "Buzón", icon: Mail },
];

export default function Nav({ user: propUser, activeTab, onSelectTab, unreadEmails = 0 }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [clientUser, setClientUser] = useState<NavUser>(propUser);

  useEffect(() => {
    if (propUser) {
      setClientUser(propUser);
    } else {
      const stored = getStoredUser();
      if (stored) setClientUser({ name: stored.name, avatar: stored.avatar });
    }
  }, [propUser]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function logout() {
    clearClientSession();
    await authFetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    window.location.href = "/";
  }

  const effectiveUser = propUser ?? clientUser;

  return (
    <header
      className={`pt-safe fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "py-2" : "py-3 sm:py-4"
      }`}
    >
      <nav
        className={`mx-auto flex max-w-7xl items-center justify-between gap-2 rounded-2xl px-3 py-2.5 transition-all duration-500 sm:gap-4 sm:px-5 sm:py-3 ${
          scrolled
            ? "glass mx-4 shadow-2xl shadow-fuchsia-500/10 lg:mx-auto"
            : "mx-4 border border-transparent lg:mx-auto"
        }`}
      >
        <Link
          href="/"
          onClick={() => {
            if (onSelectTab) onSelectTab("overview");
          }}
          className="group flex items-center gap-3"
        >
          <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 shadow-lg shadow-fuchsia-500/40">
            <Flame className="h-5 w-5 text-white transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
            <span className="absolute inset-0 rounded-xl bg-fuchsia-500/40 animate-pulse-ring" />
          </span>
          <span className="font-[family-name:var(--font-display)] text-xl font-extrabold tracking-[0.2em] text-white">
            VITALIS
          </span>
        </Link>

        {/* Center navigation */}
        {effectiveUser && onSelectTab ? (
          <div className="hidden items-center gap-1 lg:flex">
            {HUB_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 text-white shadow-lg shadow-fuchsia-500/30"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                  {tab.id === "inbox" && unreadEmails > 0 ? (
                    <span className="ml-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-lime-400 px-1 text-[10px] font-extrabold text-slate-950">
                      {unreadEmails}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="hidden items-center gap-1 md:flex">
            {PUBLIC_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                {link.label}
                <span className="absolute inset-x-4 bottom-1 h-px scale-x-0 bg-gradient-to-r from-fuchsia-400 to-cyan-400 transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ))}
          </div>
        )}

        <div className="hidden items-center gap-3 md:flex">
          {effectiveUser ? (
            <>
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold text-white">
                <span className="text-base">{effectiveUser.avatar}</span>
                <span>{effectiveUser.name.split(" ")[0]}</span>
              </div>
              <button
                onClick={logout}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
                className="flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-rose-400/60 hover:text-rose-300"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/entrar"
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:text-white"
              >
                Entrar
              </Link>
              <Link
                href="/registro"
                className="btn-glow rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/30 transition-transform hover:scale-105"
              >
                Empezar gratis
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 lg:hidden"
          aria-label="Menú"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <div
        className={`mx-4 mt-2 overflow-hidden rounded-2xl transition-all duration-500 lg:hidden ${
          open ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="glass flex flex-col gap-1 p-4">
          {effectiveUser && onSelectTab
            ? HUB_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      onSelectTab(tab.id);
                      setOpen(false);
                    }}
                    className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-left text-sm font-bold ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white"
                        : "text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })
            : PUBLIC_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/10"
                >
                  {link.label}
                </Link>
              ))}
          {!effectiveUser ? (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link
                href="/entrar"
                className="rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-bold text-white"
              >
                Entrar
              </Link>
              <Link
                href="/registro"
                className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-4 py-3 text-center text-sm font-bold text-white"
              >
                Crear cuenta
              </Link>
            </div>
          ) : (
            <button
              onClick={logout}
              className="mt-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-rose-300"
            >
              Cerrar sesión
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
