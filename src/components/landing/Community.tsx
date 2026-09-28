"use client";

import Link from "next/link";
import Reveal from "@/components/Reveal";
import TiltCard from "@/components/TiltCard";
import { ParallaxImage, ShineCard } from "@/components/fx";
import Counter from "@/components/Counter";
import { ArrowRight, Star, TrendingUp, Users, Zap } from "lucide-react";
import { IMAGES } from "@/lib/images";

const TESTIMONIALS = [
  {
    name: "Marina R.",
    avatar: "🌟",
    role: "Subió 12 kg al press · 6 meses",
    text: "Llevaba años empezando lunes y abandonando jueves. Ver la racha crecer me hizo no querer romperla.",
  },
  {
    name: "Iván T.",
    avatar: "🥊",
    role: "-14 kg de grasa · 9 meses",
    text: "El nivel de XP me convirtió el hábito en un videojuego. Ahora peleo por no perder mi racha de 47 días.",
  },
  {
    name: "Lucía P.",
    avatar: "🧘‍♀️",
    role: "Ansiedad bajo control · 4 meses",
    text: "Las frases del día me llegan justo cuando iba a saltarme el entrenamiento. Suena tonto, funciona.",
  },
];

export default function Community() {
  return (
    <section id="comunidad" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold tracking-[0.3em] text-cyan-400 uppercase">Comunidad</p>
          <h2 className="font-[family-name:var(--font-display)] mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Gente normal, <span className="text-gradient">resultados brutales</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <div className="group relative h-full overflow-hidden rounded-[2rem] border border-white/10">
              <ParallaxImage
                src={IMAGES.community}
                alt="Clase de fitness en grupo con luces de neón"
                className="h-full min-h-[24rem] w-full"
                amount={60}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05030a] via-[#05030a]/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold">
                    <Users className="h-4 w-4 text-cyan-300" />
                    <Counter value={12840} suffix="+" /> atletas activos
                  </span>
                  <span className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold">
                    <TrendingUp className="h-4 w-4 text-lime-300" />
                    <Counter value={96} suffix="%" /> retención semanal
                  </span>
                </div>
                <p className="font-[family-name:var(--font-display)] mt-5 max-w-md text-2xl leading-snug font-bold sm:text-3xl">
                  Nadie se transforma solo. Aquí siempre hay alguien sudando contigo.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="grid gap-6">
            {TESTIMONIALS.map((item, index) => (
              <Reveal key={item.name} delay={index * 120}>
                <TiltCard className="rounded-3xl" intensity={8}>
                  <ShineCard className="h-full rounded-3xl">
                  <article className="glass relative h-full overflow-hidden rounded-3xl p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500/30 to-cyan-400/30 text-2xl">
                        {item.avatar}
                      </span>
                      <div>
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-[11px] tracking-wide text-slate-400">{item.role}</p>
                        <div className="mt-1 flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-slate-300">{item.text}</p>
                  </article>
                  </ShineCard>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Reveal delay={100}>
          <div className="noise relative mt-20 overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-fuchsia-600/25 via-violet-700/15 to-cyan-500/25 p-10 text-center sm:p-16">
            <div className="pointer-events-none absolute inset-0">
              <div className="animate-blob absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-fuchsia-500/30 blur-[100px]" />
              <div className="animate-blob absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-cyan-400/25 blur-[100px] [animation-delay:-9s]" />
            </div>

            <div className="relative">
              <span className="glass animate-ticker-glow inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold tracking-[0.25em] uppercase">
                <Zap className="h-3.5 w-3.5 text-lime-300" /> Día 1 empieza hoy
              </span>
              <h3 className="font-[family-name:var(--font-display)] mx-auto mt-6 max-w-2xl text-4xl leading-tight font-extrabold sm:text-5xl">
                Tu yo de dentro de 12 meses te está <span className="text-gradient">esperando</span>
              </h3>
              <p className="mx-auto mt-5 max-w-xl text-slate-300">
                Crea tu cuenta gratis, marca tu primer hábito hoy y deja que la racha haga el resto.
                Sin tarjeta, sin excusas.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-4">
                <Link
                  href="/registro"
                  className="btn-glow group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-slate-900 transition-transform hover:scale-105"
                >
                  Quiero empezar ahora
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/entrar"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Ya tengo cuenta
                </Link>
              </div>
              <p className="mt-6 text-[11px] tracking-widest text-slate-400 uppercase">
                Prueba la demo · demo@vitalis.app / vitalis123
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
