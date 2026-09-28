"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Quote as QuoteIcon, Shuffle, Copy, Heart, Check } from "lucide-react";
import Reveal from "@/components/Reveal";
import TiltCard from "@/components/TiltCard";
import type { QuoteView } from "@/lib/types";

const CATEGORY_LABEL: Record<string, string> = {
  mindset: "Mindset",
  fitness: "Fitness",
  disciplina: "Disciplina",
  nutricion: "Nutrición",
};

export default function QuotesSection() {
  const [quotes, setQuotes] = useState<QuoteView[]>([]);
  const [current, setCurrent] = useState<QuoteView | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [session, setSession] = useState<{ name: string } | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [quotesRes, meRes] = await Promise.all([
          fetch("/api/quotes"),
          fetch("/api/auth/me"),
        ]);
        const quotesJson = (await quotesRes.json()) as { quotes: QuoteView[] };
        const meJson = (await meRes.json()) as { user: { name: string } | null };
        if (!active) return;
        setQuotes(quotesJson.quotes ?? []);
        setCurrent(quotesJson.quotes?.[0] ?? null);
        setFavorites(
          (quotesJson.quotes ?? []).filter((q) => q.favorite).map((q) => q.id),
        );
        setSession(meJson.user);
      } catch {
        /* offline safe */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const shuffle = useCallback(async () => {
    if (quotes.length === 0) return;
    const next = quotes[Math.floor(Math.random() * quotes.length)];
    setCurrent(next);
  }, [quotes]);

  async function toggleFavorite() {
    if (!current) return;
    if (!session) {
      window.location.href = "/registro";
      return;
    }
    setFavorites((prev) =>
      prev.includes(current.id) ? prev.filter((id) => id !== current.id) : [...prev, current.id],
    );
    await fetch(`/api/quotes/${current.id}/favorite`, { method: "POST" });
  }

  async function copyQuote() {
    if (!current) return;
    try {
      await navigator.clipboard.writeText(`“${current.body}” — ${current.author}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  const marathon = quotes.slice(0, 10).map((q) => q.body);

  return (
    <section id="frases" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-blob absolute top-10 -left-40 h-[32rem] w-[32rem] rounded-full bg-fuchsia-700/20 blur-[150px]" />
        <div className="animate-blob absolute -right-32 bottom-0 h-[26rem] w-[26rem] rounded-full bg-lime-500/10 blur-[130px] [animation-delay:-8s]" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold tracking-[0.3em] text-lime-400 uppercase">
            Combustible mental
          </p>
          <h2 className="font-[family-name:var(--font-display)] mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Frases que te <span className="text-gradient">levantan</span> a las 6 a.m.
          </h2>
          <p className="mt-5 text-lg text-slate-400">
            Una biblioteca de frases motivacionales sobre fitness, disciplina, nutrición y
            mindset. Barájalas, guárdalas y vuelve a ellas cuando flaquees.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <TiltCard className="rounded-[2rem]" intensity={9}>
              <div className="relative min-h-[22rem] overflow-hidden rounded-[2rem] border border-white/12 bg-gradient-to-br from-violet-600/25 via-fuchsia-600/10 to-cyan-500/20 p-8 sm:p-12">
                <div className="pointer-events-none absolute -top-16 -right-10 h-52 w-52 rounded-full bg-fuchsia-500/25 blur-3xl" />
                <QuoteIcon className="layer-3d-sm h-14 w-14 text-fuchsia-300/70" />

                <div className="layer-3d relative mt-6 min-h-[9rem]">
                  <AnimatePresence mode="wait">
                    <motion.blockquote
                      key={current?.id ?? "loading"}
                      initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -26, filter: "blur(8px)" }}
                      transition={{ duration: 0.5 }}
                      className="font-[family-name:var(--font-display)] text-2xl leading-snug font-bold text-white sm:text-3xl"
                    >
                      {loading
                        ? "Cargando tu dosis de motivación…"
                        : current
                          ? `“${current.body}”`
                          : "Sin frases disponibles."}
                    </motion.blockquote>
                  </AnimatePresence>
                </div>

                <div className="layer-3d-sm mt-8 flex flex-wrap items-center justify-between gap-5">
                  <div>
                    <p className="text-sm font-bold tracking-wide text-cyan-200">
                      {current?.author ?? "Vitalis"}
                    </p>
                    <p className="mt-1 text-[11px] tracking-[0.25em] text-slate-400 uppercase">
                      {CATEGORY_LABEL[current?.category ?? "mindset"] ?? "Mindset"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={shuffle}
                      className="btn-glow inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-slate-900 transition-transform hover:scale-105"
                    >
                      <Shuffle className="h-4 w-4" />
                      Otra frase
                    </button>
                    <button
                      onClick={copyQuote}
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:border-cyan-300/60 hover:bg-cyan-400/10"
                    >
                      {copied ? <Check className="h-4 w-4 text-lime-400" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copiada" : "Copiar"}
                    </button>
                    <button
                      onClick={toggleFavorite}
                      aria-label="Guardar frase"
                      className={`grid h-10 w-10 place-items-center rounded-full border transition-all ${
                        current && favorites.includes(current.id)
                          ? "border-rose-400/60 bg-rose-500/20 text-rose-300"
                          : "border-white/20 text-white hover:border-rose-400/60 hover:text-rose-300"
                      }`}
                    >
                      <Heart
                        className="h-4 w-4"
                        fill={current && favorites.includes(current.id) ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </TiltCard>
          </Reveal>

          <div className="space-y-4">
            {(quotes.length > 0 ? quotes.slice(1, 6) : Array.from({ length: 5 })).map((quote, index) => {
              const q = quote as QuoteView | undefined;
              if (!q) {
                return (
                  <div
                    key={`skeleton-${index}`}
                    className="h-24 animate-pulse rounded-2xl border border-white/10 bg-white/5"
                  />
                );
              }
              return (
                <Reveal key={q.id} delay={index * 90}>
                  <article className="hover-lift group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <span className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-fuchsia-400 to-cyan-400 opacity-0 transition-opacity group-hover:opacity-100" />
                    <p className="text-sm leading-relaxed text-slate-200">“{q.body}”</p>
                    <p className="mt-3 text-[11px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                      {q.author}
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>

      {marathon.length > 0 ? (
        <div className="mt-20 border-y border-white/10 bg-gradient-to-r from-fuchsia-600/10 via-transparent to-cyan-500/10 py-6">
          <div className="marquee-mask overflow-hidden">
            <div className="marquee-track marquee-track-slow gap-14 text-lg font-semibold text-slate-300/70">
              {[...marathon, ...marathon].map((body, index) => (
                <span key={`${body}-${index}`} className="flex shrink-0 items-center gap-14">
                  <span className="whitespace-nowrap">“{body}”</span>
                  <span className="text-fuchsia-400">◆</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
