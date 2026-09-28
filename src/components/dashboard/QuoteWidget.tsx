"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Heart, Plus, Quote as QuoteIcon, Shuffle, Trash2 } from "lucide-react";
import TiltCard from "@/components/TiltCard";
import { ShineCard } from "@/components/fx";
import { authFetch } from "@/lib/client-auth";
import type { QuoteView } from "@/lib/types";

const CATEGORY_LABEL: Record<string, string> = {
  mindset: "Mindset",
  fitness: "Fitness",
  disciplina: "Disciplina",
  nutricion: "Nutrición",
};

type Props = {
  quotes: QuoteView[];
  quoteOfTheDay: QuoteView;
  authed: boolean;
  onCreateQuote?: () => void;
  onDeleteUserQuote?: (dbId: number) => void;
  compact?: boolean;
};

export default function QuoteWidget({
  quotes,
  quoteOfTheDay,
  authed,
  onCreateQuote,
  onDeleteUserQuote,
  compact = false,
}: Props) {
  const [current, setCurrent] = useState<QuoteView>(quoteOfTheDay);
  const [favorites, setFavorites] = useState<number[]>(
    quotes.filter((quote) => quote.favorite).map((quote) => quote.id),
  );
  const [saved, setSaved] = useState(false);

  function shuffle() {
    if (quotes.length === 0) return;
    const pool = quotes.filter((quote) => quote.id !== current.id);
    const source = pool.length > 0 ? pool : quotes;
    setCurrent(source[Math.floor(Math.random() * source.length)]);
  }

  async function toggleFavorite() {
    if (!authed || current.userOwned || !current.dbId) {
      if (!authed) window.location.href = "/registro";
      return;
    }
    setFavorites((prev) =>
      prev.includes(current.id) ? prev.filter((id) => id !== current.id) : [...prev, current.id],
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
    await authFetch(`/api/quotes/${current.id}/favorite`, { method: "POST" });
  }

  const favoriteQuotes = quotes.filter((quote) => !quote.userOwned && favorites.includes(quote.id));
  const myQuotes = quotes.filter((quote) => quote.userOwned);

  return (
    <section className="space-y-5">
      <TiltCard className="rounded-[1.75rem] sm:rounded-[2rem]" intensity={compact ? 5 : 8}>
        <ShineCard className="animated-border relative min-h-[17rem] overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-violet-600/30 via-fuchsia-600/12 to-lime-400/15 p-6 sm:rounded-[2rem] sm:p-8">
          <div className="pointer-events-none absolute -top-16 -right-12 h-44 w-44 animate-glow-breathe rounded-full bg-fuchsia-500/25 blur-3xl sm:h-52 sm:w-52" />

          <div className="relative flex items-center justify-between gap-3">
            <p className="text-[10px] font-bold tracking-[0.25em] text-lime-300 uppercase sm:text-[11px]">
              {current.userOwned ? "Tu mantra personal" : "Frase del día"}
            </p>
            <QuoteIcon className="h-7 w-7 shrink-0 text-fuchsia-300/70 sm:h-8 sm:w-8" />
          </div>

          <div className="relative mt-5 min-h-[7rem]">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={`${current.id}-${current.userOwned ? "u" : "g"}`}
                initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -22, filter: "blur(8px)" }}
                transition={{ duration: 0.45 }}
                className="font-[family-name:var(--font-display)] text-xl leading-snug font-bold text-white text-shadow-glow sm:text-2xl md:text-3xl"
              >
                “{current.body}”
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <div className="relative mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-cyan-200">{current.author}</p>
              <p className="text-[10px] tracking-[0.2em] text-slate-400 uppercase">
                {CATEGORY_LABEL[current.category] ?? "Mindset"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={shuffle}
                className="sweep-on-hover inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-[11px] font-bold text-slate-900 transition-transform hover:scale-105"
              >
                <Shuffle className="h-3.5 w-3.5" />
                Otra
              </button>
              {current.userOwned && current.dbId && onDeleteUserQuote ? (
                <button
                  onClick={() => onDeleteUserQuote(current.dbId as number)}
                  aria-label="Eliminar mi frase"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white transition-colors hover:border-rose-400/70 hover:text-rose-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={toggleFavorite}
                  aria-label="Guardar frase"
                  className={`grid h-10 w-10 place-items-center rounded-full border transition-all ${
                    favorites.includes(current.id)
                      ? "border-rose-400/60 bg-rose-500/20 text-rose-300"
                      : "border-white/20 text-white hover:border-rose-400/60 hover:text-rose-300"
                  }`}
                >
                  <Heart
                    className="h-4 w-4"
                    fill={favorites.includes(current.id) ? "currentColor" : "none"}
                  />
                </button>
              )}
              {onCreateQuote ? (
                <button
                  onClick={onCreateQuote}
                  aria-label="Crear mi frase"
                  className="grid h-10 w-10 place-items-center rounded-full border border-lime-400/50 bg-lime-400/10 text-lime-300 transition-all hover:scale-110"
                >
                  <Plus className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>

          <AnimatePresence>
            {saved ? (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-4 left-6 flex items-center gap-2 text-[11px] font-semibold text-lime-300"
              >
                <Check className="h-3.5 w-3.5" /> Guardada en tu colección
              </motion.p>
            ) : null}
          </AnimatePresence>
        </ShineCard>
      </TiltCard>

      {myQuotes.length > 0 && !compact ? (
        <div className="glass rounded-[1.75rem] p-5 sm:rounded-[2rem] sm:p-6">
          <p className="text-[10px] font-bold tracking-[0.25em] text-amber-300 uppercase sm:text-[11px]">
            Mis frases ({myQuotes.length})
          </p>
          <ul className="mt-3 space-y-2.5">
            {myQuotes.slice(0, 5).map((quote) => (
              <li
                key={`u-${quote.dbId}`}
                className="group flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition-colors hover:border-amber-400/40"
              >
                <div className="min-w-0">
                  <p className="text-sm leading-relaxed text-slate-200">“{quote.body}”</p>
                  <p className="mt-1.5 text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                    {quote.author}
                  </p>
                </div>
                {quote.dbId && onDeleteUserQuote ? (
                  <button
                    onClick={() => onDeleteUserQuote(quote.dbId as number)}
                    aria-label="Eliminar frase"
                    className="shrink-0 text-slate-600 opacity-0 transition-all group-hover:opacity-100 hover:text-rose-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!compact ? (
        <div className="glass rounded-[1.75rem] p-5 sm:rounded-[2rem] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-bold tracking-[0.25em] text-slate-400 uppercase sm:text-[11px]">
              Tu colección ({favoriteQuotes.length})
            </p>
            {onCreateQuote ? (
              <button
                onClick={onCreateQuote}
                className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/40 bg-lime-400/10 px-3.5 py-1.5 text-[11px] font-bold text-lime-200 transition-transform hover:scale-105"
              >
                <Plus className="h-3.5 w-3.5" /> Escribir mi frase
              </button>
            ) : null}
          </div>
          {favoriteQuotes.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              Toca el corazón para guardar las frases que te muevan.
            </p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {favoriteQuotes.slice(0, 6).map((quote) => (
                <li
                  key={quote.id}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-200 transition-colors hover:border-fuchsia-400/40"
                >
                  <p>“{quote.body}”</p>
                  <p className="mt-2 text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                    {quote.author}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </section>
  );
}
