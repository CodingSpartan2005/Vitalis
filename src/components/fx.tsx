"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useFinePointer } from "@/lib/use-fine-pointer";

/* ------------------------------------------------------------------ */
/* IntroLoader: cinematic VITALIS overture.                            */
/*                                                                     */
/* Performance notes (mobile):                                         */
/*  - Every animation lives in globals.css and only touches transform  */
/*    and opacity, so it runs on the GPU compositor, not on the JS     */
/*    thread that is busy hydrating the page.                          */
/*  - The overlay is part of the server HTML and is switched on by a   */
/*    tiny inline script in <head> (html.vt-intro-on), so there is no  */
/*    flash of the page before the intro appears.                      */
/*  - The page underneath is not painted while the intro plays.        */
/* ------------------------------------------------------------------ */

const DESKTOP_INTRO_NOTIFY_MS = 3000; // original desktop sequence
const DESKTOP_INTRO_TOTAL_MS = 3800;
const MOBILE_INTRO_NOTIFY_MS = 1640; // mobile sequence is intentionally shorter
const MOBILE_INTRO_TOTAL_MS = 2250;

const RINGS = [
  { cls: "vt-ring-1", dash: "1 14" },
  { cls: "vt-ring-2 vt-ring-rev", dash: "1 22" },
  { cls: "vt-ring-3", dash: "1 30" },
];

export function IntroLoader() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("vt-intro-on")) {
      setMounted(false);
      return;
    }

    // If hydration happened late, account for how long the CSS animation has
    // already been running so the hero reveal stays in sync with the fade.
    let elapsed = 0;
    try {
      const anim = rootRef.current
        ?.getAnimations()
        .find((a) => (a as CSSAnimation).animationName === "vt-out");
      const t = Number(anim?.currentTime ?? 0);
      elapsed = Number.isFinite(t) ? t : 0;
    } catch {
      elapsed = 0;
    }

    const mobile = window.matchMedia(
      "(max-width: 640px), (hover: none), (pointer: coarse)",
    ).matches;
    const notifyAt = mobile ? MOBILE_INTRO_NOTIFY_MS : DESKTOP_INTRO_NOTIFY_MS;
    const finishAt = mobile ? MOBILE_INTRO_TOTAL_MS : DESKTOP_INTRO_TOTAL_MS;

    const notify = window.setTimeout(
      () => window.dispatchEvent(new Event("vitalis:intro-complete")),
      Math.max(0, notifyAt - elapsed),
    );
    const finish = window.setTimeout(() => {
      html.classList.remove("vt-intro-on");
      setMounted(false);
    }, Math.max(0, finishAt - elapsed));

    return () => {
      window.clearTimeout(notify);
      window.clearTimeout(finish);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div ref={rootRef} className="vt-intro" aria-hidden="true">
      <div className="vt-mobile-only">
        <div className="vt-mobile-mark" aria-hidden="true">V</div>
        <div className="vt-mobile-word">VITALIS</div>
        <span className="vt-mobile-line" />
        <p className="vt-mobile-tag">LIFESTYLE · FITNESS · MINDSET</p>
      </div>

      <div className="vt-glow vt-glow-a vt-desktop-only" />
      <div className="vt-glow vt-glow-b vt-desktop-only" />
      <div className="vt-glow vt-glow-c vt-desktop-only" />

      {RINGS.map((ring, i) => (
        <div key={ring.cls} className={`vt-ring vt-desktop-only ${ring.cls}`}>
          <svg viewBox="0 0 100 100">
            <defs>
              <linearGradient id={`vtRing${i}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f0abfc" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke={`url(#vtRing${i})`}
              strokeWidth="0.5"
              strokeDasharray={ring.dash}
              strokeLinecap="round"
            />
          </svg>
        </div>
      ))}

      <svg className="vt-mark vt-desktop-only" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="vtMark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f0abfc" />
            <stop offset="55%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        {/* wide, faint stroke = cheap glow without any blur filter */}
        <path
          d="M34 38 L60 84 L86 38"
          pathLength={1}
          fill="none"
          stroke="url(#vtMark)"
          strokeWidth="14"
          strokeOpacity="0.22"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M34 38 L60 84 L86 38"
          pathLength={1}
          fill="none"
          stroke="url(#vtMark)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="vt-desktop-only" style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div className="vt-word">
          {"VITALIS".split("").map((letter, i) => (
            <span key={`${letter}-${i}`} className="vt-letter" style={{ "--i": i } as CSSProperties}>
              {letter}
            </span>
          ))}
          <span className="vt-sweep" />
        </div>
        <span className="vt-line" />
        <p className="vt-tag">Lifestyle · Fitness · Mindset</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* BrandLoader: profile / session loading, same visual language         */
/* ------------------------------------------------------------------ */

export function BrandLoader({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="vt-loader">
      <div className="vt-loader-glow" />

      <div className="relative flex flex-col items-center gap-7">
        <div className="relative grid h-24 w-24 place-items-center">
          <svg viewBox="0 0 100 100" className="vt-orbit-a absolute h-24 w-24">
            <defs>
              <linearGradient id="vtLoaderRing" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f0abfc" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="url(#vtLoaderRing)"
              strokeWidth="1.2"
              strokeDasharray="2 12"
              strokeLinecap="round"
            />
          </svg>

          <svg viewBox="0 0 100 100" className="vt-orbit-b absolute h-16 w-16">
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="1.6"
              strokeDasharray="30 120"
              strokeLinecap="round"
            />
          </svg>

          <svg viewBox="0 0 120 120" className="vt-pulse h-10 w-10">
            <defs>
              <linearGradient id="vtLoaderMark" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f0abfc" />
                <stop offset="55%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <path
              d="M34 38 L60 84 L86 38"
              fill="none"
              stroke="url(#vtLoaderMark)"
              strokeOpacity="0.25"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M34 38 L60 84 L86 38"
              fill="none"
              stroke="url(#vtLoaderMark)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="text-[11px] font-semibold tracking-[0.3em] text-slate-400 uppercase">{label}</p>
          <div className="h-px w-40 overflow-hidden rounded-full bg-white/10">
            <div className="vt-shimmer h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-fuchsia-300 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SplitText: per-character cinematic reveal (blur + rise, no wobble)  */
/* ------------------------------------------------------------------ */

export function SplitText({
  text,
  className = "",
  delay = 0,
  stagger = 0.032,
  gradient = false,
  active = true,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  gradient?: boolean;
  active?: boolean;
}) {
  const chars = useMemo(() => text.split(""), [text]);
  return (
    <span className={`inline-flex flex-wrap ${className}`} aria-label={text}>
      {chars.map((char, i) => (
        <span key={`${char}-${i}`} className="inline-block overflow-hidden py-[0.08em]" aria-hidden="true">
          <span
            className={`inline-block ${gradient ? "text-gradient" : ""} ${active ? "split-text-char" : "split-text-hold"}`}
            style={active ? { animationDelay: `${delay + i * stagger}s` } : undefined}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        </span>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Magnetic: elements that lean gently toward the cursor                */
/* ------------------------------------------------------------------ */

export function Magnetic({
  children,
  className = "",
  strength = 0.35,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const finePointer = useFinePointer();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 });

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!finePointer) return;
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
      y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
    },
    [finePointer, strength, x, y],
  );

  const reset = useCallback(() => {
    if (!finePointer) return;
    x.set(0);
    y.set(0);
  }, [finePointer, x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={finePointer ? onMove : undefined}
      onMouseLeave={finePointer ? reset : undefined}
      style={{ x: sx, y: sy }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Aurora: ambient ombre background — pure CSS animation, no pointer   */
/* tracking, so it never flickers or repaints on mouse movement.       */
/* ------------------------------------------------------------------ */

export function Aurora({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}>
      <div className="absolute inset-0 grid-lines opacity-70" />
      <div className="animate-blob absolute -top-40 -left-32 h-[34rem] w-[34rem] rounded-full bg-fuchsia-600/25 blur-[130px]" />
      <div className="animate-blob absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-cyan-500/22 blur-[140px] [animation-delay:-6s]" />
      <div className="animate-blob absolute -bottom-40 left-1/4 h-[30rem] w-[30rem] rounded-full bg-violet-600/20 blur-[130px] [animation-delay:-12s]" />
      <div className="absolute inset-0 noise" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ShineCard: pointer-tracked spotlight sweep, throttled via rAF       */
/* ------------------------------------------------------------------ */

export function ShineCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const finePointer = useFinePointer();
  const glowRef = useRef<HTMLDivElement | null>(null);
  const frame = useRef<number | null>(null);
  const pending = useRef<{ x: number; y: number } | null>(null);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!finePointer) return;
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    pending.current = {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
    if (frame.current === null) {
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        if (pending.current && glowRef.current) {
          glowRef.current.style.background = `radial-gradient(340px circle at ${pending.current.x}% ${pending.current.y}%, rgba(255,255,255,0.14), transparent 60%)`;
          glowRef.current.style.opacity = "1";
        }
      });
    }
  }

  function onLeave() {
    if (glowRef.current) glowRef.current.style.opacity = "0";
  }

  return (
    <div
      ref={ref}
      onMouseMove={finePointer ? onMove : undefined}
      onMouseLeave={finePointer ? onLeave : undefined}
      className={`shine-host relative ${className}`}
    >
      {children}
      {finePointer ? (
        <span
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300"
        />
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ParallaxImage: scroll-driven Ken Burns + depth                      */
/* ------------------------------------------------------------------ */

export function ParallaxImage({
  src,
  alt,
  className = "",
  amount = 90,
}: {
  src: string;
  alt: string;
  className?: string;
  amount?: number;
}) {
  const finePointer = useFinePointer();
  if (!finePointer) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
      </div>
    );
  }
  return <DesktopParallaxImage src={src} alt={alt} className={className} amount={amount} />;
}

function DesktopParallaxImage({
  src, alt, className, amount,
}: { src: string; alt: string; className: string; amount: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [amount, -amount]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.14, 1.02, 1.14]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y, scale }}
        className="h-[118%] w-full object-cover will-change-transform"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* TiltOnScroll: settles into place as it enters the viewport          */
/* ------------------------------------------------------------------ */

export function TiltOnScroll({
  children,
  className = "",
  rotate = 8,
}: {
  children: ReactNode;
  className?: string;
  rotate?: number;
}) {
  const finePointer = useFinePointer();
  if (!finePointer) return <div className={className}>{children}</div>;
  return <DesktopTiltOnScroll rotate={rotate} className={className}>{children}</DesktopTiltOnScroll>;
}

function DesktopTiltOnScroll({
  children, className, rotate,
}: { children: ReactNode; className: string; rotate: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.55"],
  });
  const rotateX = useTransform(scrollYProgress, [0, 1], [rotate, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [32, 0]);

  return (
    <motion.div ref={ref} style={{ rotateX, y }} className={`perspective-sm ${className}`}>
      {children}
    </motion.div>
  );
}
