"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Flame, Plus, Trash2, X, Sparkles } from "lucide-react";
import { authFetch } from "@/lib/client-auth";
import { habitColor, HABIT_COLOR_KEYS } from "@/lib/colors";
import { weekdayLabel, dayNumber, prettyDate } from "@/lib/dates";
import type { HabitView } from "@/lib/types";

const EMOJIS = ["🏋️", "💧", "🥗", "😴", "📚", "🧘", "🏃", "🚴", "🥊", "☀️", "🧠", "🙏", "📵", "💪", "🎯", "🔥"];

type Props = {
  habits: HabitView[];
  week: string[];
  today: string;
  onToggle: (habitId: number, day: string) => Promise<void> | void;
  onDelete: (habitId: number) => Promise<void> | void;
  onCreated: (habit: { id: number; title: string; icon: string; color: string }) => Promise<void> | void;
};

export default function HabitBoard({ habits, week, today, onToggle, onDelete, onCreated }: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("💪");
  const [color, setColor] = useState("violet");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (title.trim().length < 2) {
      setError("Ponle un nombre claro al hábito.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await authFetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, icon, color }),
      });
      const json = (await response.json()) as {
        habit?: { id: number; title: string; icon: string; color: string };
        error?: string;
      };
      if (!response.ok || !json.habit) {
        setError(json.error ?? "No pudimos crear el hábito.");
        return;
      }
      await onCreated(json.habit);
      setTitle("");
      setIcon("💪");
      setColor("violet");
      setFormOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="glass noise relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
      <div className="pointer-events-none absolute -top-28 -right-24 h-64 w-64 rounded-full bg-violet-600/25 blur-[90px]" />

      <header className="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-[0.25em] text-fuchsia-400 uppercase">
            Habit tracker
          </p>
          <h2 className="font-[family-name:var(--font-display)] mt-1 text-2xl font-extrabold">
            Tu semana, día a día
          </h2>
        </div>
        <button
          onClick={() => setFormOpen((v) => !v)}
          className="btn-glow inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-5 py-2.5 text-xs font-bold text-white transition-transform hover:scale-105"
        >
          {formOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {formOpen ? "Cerrar" : "Nuevo hábito"}
        </button>
      </header>

      <AnimatePresence initial={false}>
        {formOpen ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onSubmit={submit}
            className="relative overflow-hidden"
          >
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
                <div>
                  <label className="text-[11px] tracking-[0.2em] text-slate-400 uppercase">
                    Nombre del hábito
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Estirar 10 minutos"
                    className="mt-2 w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-fuchsia-400/70 focus:ring-2 focus:ring-fuchsia-500/20"
                  />
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {HABIT_COLOR_KEYS.map((key) => {
                      const palette = habitColor(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setColor(key)}
                          aria-label={palette.label}
                          className={`h-8 w-8 rounded-lg transition-transform ${
                            color === key ? "scale-110 ring-2 ring-white/80" : "hover:scale-110"
                          }`}
                          style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }}
                        />
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] tracking-[0.2em] text-slate-400 uppercase">
                    Icono
                  </label>
                  <div className="mt-2 grid max-h-28 grid-cols-8 gap-1.5 overflow-y-auto pr-1">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setIcon(emoji)}
                        className={`grid h-9 place-items-center rounded-lg border text-lg transition-all ${
                          icon === emoji
                            ? "scale-110 border-fuchsia-400/70 bg-fuchsia-500/20"
                            : "border-white/10 bg-white/5 hover:scale-105"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error ? <p className="mt-3 text-xs text-rose-300">{error}</p> : null}

              <button
                type="submit"
                disabled={saving}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-slate-900 transition-transform hover:scale-105 disabled:opacity-60"
              >
                {saving ? "Creando…" : "Añadir al tracker"}
                <Sparkles className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.form>
        ) : null}
      </AnimatePresence>

      {/* week header */}
      <div className="hide-scrollbar mt-8 overflow-x-auto">
      <div className="min-w-[36rem]">
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        <span className="h-12 w-12 shrink-0" aria-hidden />
        <div className="w-24 shrink-0 sm:w-40" aria-hidden />
        <div className="grid flex-1 grid-cols-7 gap-1.5">
          {week.map((day) => (
            <div key={day} className="text-center">
              <p
                className={`text-[10px] font-bold tracking-widest uppercase ${
                  day === today ? "text-fuchsia-300" : "text-slate-500"
                }`}
              >
                {weekdayLabel(day)}
              </p>
              <p
                className={`mt-0.5 text-xs font-semibold ${
                  day === today ? "text-white" : "text-slate-400"
                }`}
              >
                {dayNumber(day)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 space-y-2.5">
        <AnimatePresence initial={false}>
          {habits.map((habit) => {
            const palette = habitColor(habit.color);
            const logSet = new Set(habit.logs);
            const weekDone = week.filter((day) => logSet.has(day)).length;
            return (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40, height: 0 }}
                transition={{ duration: 0.35 }}
                className="group relative flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3 transition-colors hover:border-white/15"
              >
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-xl"
                  style={{
                    background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
                    boxShadow: `0 14px 30px -14px ${palette.glow}`,
                  }}
                >
                  {habit.icon}
                </span>

                <div className="w-24 shrink-0 sm:w-40">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold text-white">{habit.title}</p>
                    <button
                      onClick={() => onDelete(habit.id)}
                      aria-label={`Eliminar ${habit.title}`}
                      className="shrink-0 text-slate-600 opacity-0 transition-all group-hover:opacity-100 hover:text-rose-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(weekDone / 7) * 100}%`,
                          background: `linear-gradient(90deg, ${palette.from}, ${palette.to})`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{weekDone}/7</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                    <Flame
                      className={`h-3 w-3 ${habit.streak > 0 ? "text-orange-400" : "text-slate-600"}`}
                    />
                    racha {habit.streak} · total {habit.total}
                  </div>
                </div>

                <div className="grid flex-1 grid-cols-7 gap-1.5">
                  {week.map((day) => {
                    const done = logSet.has(day);
                    const isFuture = day > today;
                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={isFuture}
                        onClick={() => onToggle(habit.id, day)}
                        title={`${habit.title} · ${prettyDate(day)}`}
                        aria-label={`${habit.title} ${day}`}
                        className={`relative grid h-9 w-full place-items-center rounded-xl border transition-all duration-300 sm:h-10 ${
                          isFuture
                            ? "cursor-not-allowed border-white/5"
                            : done
                              ? "scale-100 border-transparent"
                              : "border-white/10 hover:scale-110 hover:border-white/40"
                        }`}
                        style={
                          done
                            ? {
                                background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
                                boxShadow: `0 10px 24px -10px ${palette.glow}`,
                              }
                            : undefined
                        }
                      >
                        <AnimatePresence mode="popLayout" initial={false}>
                          {done ? (
                            <motion.span
                              key="on"
                              initial={{ scale: 0, rotate: -120 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 480, damping: 17 }}
                              className="absolute inset-0 grid place-items-center"
                            >
                              <Check className="h-4 w-4 text-white" strokeWidth={3.5} />
                            </motion.span>
                          ) : null}
                        </AnimatePresence>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {habits.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
            <p className="text-sm text-slate-400">
              Todavía no tienes hábitos. Crea el primero y empieza tu racha hoy.
            </p>
          </div>
        ) : null}
      </div>
      </div>
      </div>
    </section>
  );
}
