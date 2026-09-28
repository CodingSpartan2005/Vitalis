"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Flame, Plus, RotateCcw, Trophy } from "lucide-react";
import Reveal from "@/components/Reveal";
import { habitColor } from "@/lib/colors";
import { dayNumber, shiftDays, startOfWeek, weekdayLabel } from "@/lib/dates";

const DEMO_HABITS = [
  { id: 1, title: "Entrenar 45 min", icon: "🏋️", color: "violet" },
  { id: 2, title: "Beber 3L de agua", icon: "💧", color: "cyan" },
  { id: 3, title: "Comer comida real", icon: "🥗", color: "lime" },
  { id: 4, title: "Meditar 10 min", icon: "🧘", color: "rose" },
];

type DayKey = string;

function initialDone(): Record<string, DayKey[]> {
  const start = startOfWeek(new Date().toISOString().slice(0, 10));
  const done: Record<string, DayKey[]> = {
    "1": [0, 1, 2, 3, 4].map((i) => shiftDays(start, i)),
    "2": [0, 1, 2, 4].map((i) => shiftDays(start, i)),
    "3": [0, 2, 3].map((i) => shiftDays(start, i)),
    "4": [1, 3, 4].map((i) => shiftDays(start, i)),
  };
  return done;
}

export default function TrackerPreview() {
  const week = useMemo(
    () => Array.from({ length: 7 }, (_, i) => shiftDays(startOfWeek(new Date().toISOString().slice(0, 10)), i)),
    [],
  );
  const today = new Date().toISOString().slice(0, 10);
  const [done, setDone] = useState<Record<string, DayKey[]>>(initialDone);

  function toggle(habitId: number, day: string) {
    setDone((prev) => {
      const list = prev[String(habitId)] ?? [];
      return {
        ...prev,
        [String(habitId)]: list.includes(day) ? list.filter((d) => d !== day) : [...list, day],
      };
    });
  }

  const totalDone = Object.values(done).reduce((sum, list) => sum + list.length, 0);
  const weekGoal = DEMO_HABITS.length * 7;
  const percentage = Math.round((totalDone / weekGoal) * 100);

  const streaks = DEMO_HABITS.map((habit) => {
    const list = done[String(habit.id)] ?? [];
    let cursor = today;
    if (!list.includes(cursor)) {
      cursor = shiftDays(cursor, -1);
      if (!list.includes(cursor)) return { ...habit, streak: 0 };
    }
    let streak = 0;
    while (list.includes(cursor)) {
      streak += 1;
      cursor = shiftDays(cursor, -1);
    }
    return { ...habit, streak };
  });
  const bestStreak = Math.max(...streaks.map((habit) => habit.streak), 0);

  return (
    <section id="tracker" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/40 to-transparent" />
        <div className="animate-blob absolute -right-20 bottom-10 h-[30rem] w-[30rem] rounded-full bg-cyan-500/15 blur-[130px]" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal>
          <p className="text-xs font-bold tracking-[0.3em] text-cyan-400 uppercase">Habit tracker</p>
          <h2 className="font-[family-name:var(--font-display)] mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Tu progreso, <span className="text-gradient">tinta vivo</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-400">
            Marca tus días, mira crecer tus rachas y descubre qué hábitos te están frenando. Es
            adictivo a propósito: el cerebro ama cerrar círculos.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              { icon: Flame, title: "Rachas en tiempo real", text: "Cada check alimenta tu fuego diario." },
              { icon: Trophy, title: "Niveles y XP", text: "Gana experiencia por cada hábito completado." },
              { icon: Plus, title: "Hábitos a tu medida", text: "Iconos, colores y objetivos propios." },
            ].map((item, index) => (
              <li key={item.title} className="flex gap-4" style={{ animationDelay: `${index * 90}ms` }}>
                <span className="glass grid h-11 w-11 shrink-0 place-items-center rounded-xl">
                  <item.icon className="h-5 w-5 text-fuchsia-300" />
                </span>
                <div>
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="text-sm text-slate-400">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-xs text-slate-500">
            👉 Puedes tocar los círculos de la derecha ahora mismo. Es una demo real.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="glass perspective relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
            <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-fuchsia-500/25 blur-3xl" />

            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] tracking-[0.25em] text-slate-400 uppercase">
                  Semana actual
                </p>
                <p className="font-[family-name:var(--font-display)] mt-1 text-3xl font-extrabold">
                  {totalDone}
                  <span className="text-lg text-slate-500">/{weekGoal} checks</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative grid h-14 w-14 place-items-center">
                  <svg viewBox="0 0 56 56" className="absolute inset-0 -rotate-90">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 24}
                      strokeDashoffset={2 * Math.PI * 24 * (1 - percentage / 100)}
                      style={{ transition: "stroke-dashoffset 700ms ease" }}
                    />
                  </svg>
                  <span className="text-xs font-bold">{percentage}%</span>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1.5">
                  <Flame className="h-4 w-4 text-orange-400" />
                  <span className="text-sm font-bold text-orange-200">{bestStreak} días</span>
                </div>
              </div>
            </div>

            <div className="mt-7 space-y-3">
              {DEMO_HABITS.map((habit) => {
                const palette = habitColor(habit.color);
                const list = done[String(habit.id)] ?? [];
                const streak = streaks.find((s) => s.id === habit.id)?.streak ?? 0;
                return (
                  <div
                    key={habit.id}
                    className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3 transition-colors hover:border-white/15"
                  >
                    <span
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`, boxShadow: `0 12px 28px -12px ${palette.glow}` }}
                    >
                      {habit.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{habit.title}</p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{list.length}/7 esta semana</span>
                        {streak > 0 ? (
                          <span className="flex items-center gap-1 text-orange-300">
                            <Flame className="h-3 w-3" /> {streak}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      {week.map((day) => {
                        const isDone = list.includes(day);
                        const isFuture = day > today;
                        return (
                          <button
                            key={day}
                            type="button"
                            disabled={isFuture}
                            onClick={() => toggle(habit.id, day)}
                            aria-label={`${habit.title} ${day}`}
                            className={`relative grid h-9 w-9 place-items-center rounded-xl border text-[11px] font-bold transition-all duration-300 ${
                              isFuture
                                ? "cursor-not-allowed border-white/5 text-slate-700"
                                : isDone
                                  ? "border-transparent text-white"
                                  : "border-white/10 text-slate-400 hover:scale-110 hover:border-white/40"
                            }`}
                            style={
                              isDone
                                ? {
                                    background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
                                    boxShadow: `0 10px 22px -10px ${palette.glow}`,
                                  }
                                : undefined
                            }
                          >
                            <AnimatePresence mode="popLayout" initial={false}>
                              {isDone ? (
                                <motion.span
                                  key="check"
                                  initial={{ scale: 0, rotate: -90 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                                  className="absolute inset-0 grid place-items-center"
                                >
                                  <Check className="h-4 w-4" strokeWidth={3.5} />
                                </motion.span>
                              ) : null}
                            </AnimatePresence>
                            {!isDone ? weekdayLabel(day) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-lime-400" />
                Sincronizado con tu cuenta
              </div>
              <button
                type="button"
                onClick={() => setDone(initialDone())}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-cyan-300/50 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reiniciar demo
              </button>
            </div>

            <div className="pointer-events-none absolute inset-x-6 bottom-0 h-24 bg-gradient-to-t from-[#0a0813] to-transparent" style={{ display: "none" }} />
            <span className="absolute right-6 bottom-5 text-[10px] tracking-widest text-slate-600 uppercase">
              {dayNumber(today)} · hoy
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
