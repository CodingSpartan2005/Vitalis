"use client";

import Reveal from "@/components/Reveal";
import TiltCard from "@/components/TiltCard";
import { ShineCard, TiltOnScroll } from "@/components/fx";
import { Dumbbell, Salad, BrainCircuit, ArrowUpRight } from "lucide-react";
import { IMAGES } from "@/lib/images";

const PILLARS = [
  {
    icon: Dumbbell,
    title: "Fuerza",
    image: IMAGES.strength,
    text: "Registra cada sesión, sube carga progresiva y observa cómo tu cuerpo responde semana a semana.",
    accent: "from-fuchsia-500 to-violet-600",
    stats: ["+18% fuerza media", "84 días logrados"],
  },
  {
    icon: Salad,
    title: "Nutrición",
    image: IMAGES.nutrition,
    text: "Construye hábitos de comida real: hidratación, proteína y energía estable sin dietas extremas.",
    accent: "from-lime-400 to-emerald-500",
    stats: ["3L agua/día", "80% comida real"],
  },
  {
    icon: BrainCircuit,
    title: "Mente",
    image: IMAGES.mind,
    text: "Mindset, sueño y respiración. El músculo más ignorado es el que decide si vuelves mañana.",
    accent: "from-cyan-400 to-sky-500",
    stats: ["10 min de calma", "7.5h de sueño"],
  },
];

export default function Pillars() {
  return (
    <section id="pilares" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-violet-700/20 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold tracking-[0.3em] text-fuchsia-400 uppercase">
            Los tres pilares
          </p>
          <h2 className="font-[family-name:var(--font-display)] mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Un sistema completo para tu <span className="text-gradient">lifestyle</span>
          </h2>
          <p className="mt-5 text-lg text-slate-400">
            Todo lo que necesitas para transformar tu rutina: cuerpo, plato y cabeza trabajando
            en la misma dirección.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {PILLARS.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 130}>
              <TiltOnScroll rotate={10} className="h-full">
              <TiltCard className="h-full rounded-[1.75rem]" intensity={10}>
              <ShineCard className="h-full rounded-[1.75rem]">
                <article className="glass group relative h-full overflow-hidden rounded-[1.75rem]">
                  <div className="relative h-60 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pillar.image}
                      alt={pillar.title}
                      className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08060f] via-transparent to-transparent" />
                    <span
                      className={`absolute top-4 left-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${pillar.accent} shadow-lg`}
                    >
                      <pillar.icon className="layer-3d-sm h-6 w-6 text-white" />
                    </span>
                  </div>

                  <div className="layer-3d-sm space-y-4 p-6">
                    <h3 className="font-[family-name:var(--font-display)] flex items-center gap-2 text-2xl font-bold">
                      {pillar.title}
                      <ArrowUpRight className="h-5 w-5 text-slate-500 transition-all group-hover:translate-x-1 group-hover:text-cyan-300" />
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-400">{pillar.text}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {pillar.stats.map((stat) => (
                        <span
                          key={stat}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-wide text-slate-300"
                        >
                          {stat}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </ShineCard>
              </TiltCard>
              </TiltOnScroll>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
