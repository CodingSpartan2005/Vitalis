"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, PlayCircle, Sparkles, CheckCircle2, Flame } from "lucide-react";
import Counter from "@/components/Counter";
import { Aurora, Magnetic, SplitText } from "@/components/fx";
import { IMAGES } from "@/lib/images";
import { useFinePointer } from "@/lib/use-fine-pointer";

const RING_TARGET = 82;

export default function Hero() {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const finePointer = useFinePointer();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [ring, setRing] = useState(0);
  const [introReady, setIntroReady] = useState(false);

  useEffect(() => {
    // The intro is switched on by an inline <head> script (html.vt-intro-on).
    // With no intro (returning visit) reveal immediately; otherwise wait for it.
    if (!document.documentElement.classList.contains("vt-intro-on")) {
      setIntroReady(true);
      return;
    }
    const complete = () => setIntroReady(true);
    window.addEventListener("vitalis:intro-complete", complete);
    const safeguard = window.setTimeout(complete, 5200);
    return () => {
      window.removeEventListener("vitalis:intro-complete", complete);
      window.clearTimeout(safeguard);
    };
  }, []);

  useEffect(() => {
    if (!introReady) return;
    const timer = window.setTimeout(() => setRing(RING_TARGET), 450);
    return () => window.clearTimeout(timer);
  }, [introReady]);

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!finePointer) return;
    const node = sceneRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    setTilt({
      x: (event.clientY - rect.top) / rect.height - 0.5,
      y: (event.clientX - rect.left) / rect.width - 0.5,
    });
  }

  const circumference = 2 * Math.PI * 52;

  return (
    <section className="noise relative isolate overflow-hidden pt-32 pb-20 sm:pt-40">
      {/* background */}
      <Aurora />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-blob absolute -top-32 -left-24 h-[36rem] w-[36rem] rounded-full bg-fuchsia-600/30 blur-[130px]" />
        <div className="animate-blob absolute top-24 -right-32 h-[34rem] w-[34rem] rounded-full bg-cyan-500/25 blur-[140px] [animation-delay:-6s]" />
        <div className="animate-blob absolute bottom-0 left-1/3 h-[26rem] w-[26rem] rounded-full bg-lime-400/15 blur-[120px] [animation-delay:-12s]" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-[1.05fr_1fr]">
        {/* copy */}
        <div>
          <motion.div
            initial={false}
            className={`${introReady ? "hero-enter" : "hero-hold"} glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-[0.18em] text-cyan-200 uppercase`}
          >
            <Sparkles className="h-4 w-4 text-fuchsia-300" />
            Lifestyle · Fitness · Mindset
          </motion.div>

          <motion.h1
            initial={false}
            className="font-[family-name:var(--font-display)] mt-6 text-[2.6rem] leading-[0.95] font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
          >
            <SplitText text="Entrena el cuerpo." active={introReady} />
            <br />
            <SplitText text="Domina la mente." gradient delay={0.18} active={introReady} />
          </motion.h1>

          <motion.p
            initial={false}
            style={{ animationDelay: "160ms" }}
            className={`${introReady ? "hero-enter" : "hero-hold"} mt-6 max-w-xl text-lg leading-relaxed text-slate-300`}
          >
            VITALIS reúne tu registro, un habit tracker con rachas en tiempo real y frases
            motivacionales diarias en una experiencia visual 3D diseñada para que no vuelvas a
            abandonar en enero.
          </motion.p>

          <motion.div
            initial={false}
            style={{ animationDelay: "270ms" }}
            className={`${introReady ? "hero-enter" : "hero-hold"} mt-9 flex flex-wrap items-center gap-4`}
          >
            <Magnetic strength={0.25}>
              <Link
                href="/registro"
                className="sweep-on-hover btn-glow group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 px-7 py-4 text-sm font-bold tracking-wide text-white shadow-[0_20px_50px_-15px_rgba(168,85,247,0.8)] transition-transform hover:scale-[1.04]"
              >
                Crear mi cuenta gratis
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Magnetic>
            <Link
              href="/#tracker"
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-4 text-sm font-semibold text-slate-200 transition-all hover:border-cyan-300/60 hover:bg-cyan-400/10"
            >
              <PlayCircle className="h-5 w-5 text-cyan-300" />
              Ver cómo funciona
            </Link>
          </motion.div>

          <motion.dl
            initial={false}
            style={{ animationDelay: "400ms" }}
            className={`${introReady ? "hero-enter" : "hero-hold"} mt-12 grid max-w-lg grid-cols-3 gap-6`}
          >
            {[
              { value: 42750, suffix: "+", label: "hábitos completados" },
              { value: 96, suffix: "%", label: "vuelven cada semana" },
              { value: 30, suffix: "", label: "frases que encienden" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="font-[family-name:var(--font-display)] text-3xl font-extrabold text-white">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </dt>
                <dd className="mt-1 text-xs leading-snug text-slate-400">{stat.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* 3D scene */}
        <div
          ref={sceneRef}
          onMouseMove={finePointer ? handleMove : undefined}
          onMouseLeave={finePointer ? () => setTilt({ x: 0, y: 0 }) : undefined}
          className="perspective relative mx-auto w-full max-w-lg"
        >
          <motion.div
            initial={false}
            style={{
              transform: `rotateX(${tilt.x * -14}deg) rotateY(${tilt.y * 16}deg)`,
              transition: "transform 220ms cubic-bezier(0.22,1,0.36,1)",
              animationDelay: "120ms",
            }}
            className={`${introReady ? "hero-fade" : "hero-hold"} relative`}
          >
            <div className="animate-spin-slow absolute -inset-10 -z-10 rounded-full border border-dashed border-white/10" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/15 shadow-[0_50px_120px_-40px_rgba(168,85,247,0.85)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={IMAGES.hero}
                alt="Atleta entrenando con cuerdas bajo luces de neón"
                className="animate-ken-burns h-[30rem] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05030a] via-[#05030a]/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-xs font-semibold tracking-[0.25em] text-cyan-300 uppercase">
                  Sesión de hoy
                </p>
                <p className="font-[family-name:var(--font-display)] mt-1 text-2xl font-bold">
                  Hipertrofia · Empuje
                </p>
              </div>
            </div>

            {/* floating ring card */}
            <div
              style={{
                transform: `translate3d(${tilt.y * -46}px, ${tilt.x * -40}px, 70px)`,
                transition: "transform 260ms ease-out",
              }}
              className="glass animate-floaty absolute -top-6 left-0 grid h-24 w-24 place-items-center rounded-2xl sm:-top-10 sm:-left-10 sm:h-32 sm:w-32"
            >
              <svg viewBox="0 0 120 120" className="h-28 w-28 -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="url(#ringGradient)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (circumference * ring) / 100}
                  style={{ transition: "stroke-dashoffset 1.8s cubic-bezier(0.22,1,0.36,1)" }}
                />
                <defs>
                  <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#a3e635" />
                    <stop offset="50%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-center">
                <p className="font-[family-name:var(--font-display)] text-2xl font-extrabold">
                  <Counter value={RING_TARGET} suffix="%" />
                </p>
                <p className="text-[10px] tracking-widest text-slate-300 uppercase">semana</p>
              </div>
            </div>

            {/* floating streak chip */}
            <div
              style={{
                transform: `translate3d(${tilt.y * 52}px, ${tilt.x * 34}px, 90px)`,
                transition: "transform 260ms ease-out",
              }}
              className="glass animate-floaty-slow absolute -right-1 top-1/3 flex items-center gap-2 rounded-2xl px-3 py-2 sm:-right-8 sm:gap-3 sm:px-4 sm:py-3"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 text-xl">
                🔥
              </span>
              <div>
                <p className="font-[family-name:var(--font-display)] text-lg leading-none font-extrabold">
                  12 días
                </p>
                <p className="text-[11px] text-slate-300">racha activa</p>
              </div>
            </div>

            {/* floating habit card */}
            <div
              style={{
                transform: `translate3d(${tilt.y * -32}px, ${tilt.x * 46}px, 110px)`,
                transition: "transform 300ms ease-out",
              }}
              className="glass absolute -bottom-8 left-2 right-2 rounded-2xl p-3.5 sm:-bottom-10 sm:left-4 sm:right-auto sm:w-64 sm:p-4"
            >
              <p className="text-[11px] tracking-[0.2em] text-slate-400 uppercase">Check de hoy</p>
              <ul className="mt-3 space-y-2 text-sm">
                {["Entrenar 45 min", "3L de agua", "Meditar 10 min"].map((item, index) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2
                      className={`h-4 w-4 ${index < 2 ? "text-lime-400" : "text-slate-500"}`}
                    />
                    <span className={index < 2 ? "text-white" : "text-slate-400"}>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center gap-1.5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${
                      i < 5 ? "bg-gradient-to-r from-lime-400 to-cyan-400" : "bg-white/15"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative mt-24 border-y border-white/10 bg-white/[0.02] py-4">
        <MarqueeBand />
      </div>
    </section>
  );
}

function MarqueeBand() {
  const items = [
    "DISCIPLINA",
    "FUERZA",
    "MINDSET",
    "NUTRICIÓN",
    "CONSISTENCIA",
    "RECUPERACIÓN",
    "ENFOQUE",
    "ENERGÍA",
  ];
  const loop = [...items, ...items];
  return (
    <div className="marquee-mask overflow-hidden">
      <div className="marquee-track font-[family-name:var(--font-display)] gap-12 text-2xl font-extrabold tracking-[0.15em] text-white/25 sm:text-3xl">
        {loop.map((item, index) => (
          <span key={`${item}-${index}`} className="flex shrink-0 items-center gap-12">
            {item}
            <Flame className="h-5 w-5 text-fuchsia-500/60" />
          </span>
        ))}
      </div>
    </div>
  );
}
