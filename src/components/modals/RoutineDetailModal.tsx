"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bookmark,
  Check,
  CheckCircle2,
  Clock,
  Dumbbell,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Timer,
  Trophy,
  X,
} from "lucide-react";
import DemoVideo from "@/components/DemoVideo";
import type { WorkoutRoutine } from "@/lib/fitness-content";

type Props = {
  routine: WorkoutRoutine | null;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave?: (routineId: string) => Promise<void> | void;
  onCompleteRoutine?: (routine: WorkoutRoutine) => Promise<void> | void;
};

export default function RoutineDetailModal({
  routine,
  onClose,
  isSaved = false,
  onToggleSave,
  onCompleteRoutine,
}: Props) {
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});
  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setRestSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    if (!routine) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [routine, onClose]);

  if (!routine) return null;

  const totalSets = routine.exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const doneSets = routine.exercises.reduce((acc, ex) => {
    let c = 0;
    for (let i = 1; i <= ex.sets; i += 1) {
      if (completedSets[`${routine.id}:${ex.id}:${i}`]) c += 1;
    }
    return acc + c;
  }, 0);
  const progress = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;

  function toggleSet(exId: string, setNum: number, restSec: number) {
    if (!routine) return;
    const key = `${routine.id}:${exId}:${setNum}`;
    setCompletedSets((prev) => {
      const next = !prev[key];
      if (next) {
        setRestSecondsLeft(restSec);
        setTimerRunning(true);
      }
      return { ...prev, [key]: next };
    });
  }

  async function handleComplete() {
    if (!routine || !onCompleteRoutine) return;
    setSubmitting(true);
    try {
      await onCompleteRoutine(routine);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      <div
        className="vt-modal-overlay fixed inset-0 z-[80] flex items-end justify-center overflow-hidden bg-black/80 sm:items-center sm:overflow-y-auto sm:p-4 sm:backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Instrucciones de ${routine.title}`}
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="vt-modal-sheet relative max-h-[100dvh] w-full min-w-0 overflow-x-hidden overflow-y-auto rounded-t-[1.5rem] border border-cyan-400/35 bg-[#090712] shadow-[0_40px_120px_-25px_rgba(34,211,238,0.5)] sm:my-8 sm:max-h-[90vh] sm:max-w-4xl sm:rounded-[2rem]"
        >
          {/* Top Hero Banner */}
          <div className="relative h-36 w-full overflow-hidden sm:h-64">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={routine.image}
              alt={routine.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090712] via-[#090712]/55 to-transparent" />

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar instrucciones de rutina"
              className="absolute top-3 right-3 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/70 text-white transition-transform hover:scale-110 sm:top-4 sm:right-4 sm:h-10 sm:w-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="absolute inset-x-6 bottom-4 hidden flex-wrap items-end justify-between gap-4 sm:flex">
              <div className="min-w-0">
                <span
                  className={`inline-block rounded-full bg-gradient-to-r ${routine.accent} px-3 py-1 text-[10px] font-extrabold tracking-wider text-white uppercase`}
                >
                  {routine.level} · {routine.equipment}
                </span>
                <h2 className="font-[family-name:var(--font-display)] mt-2 text-2xl font-extrabold text-white sm:text-3xl">
                  {routine.title}
                </h2>
                <p className="mt-1 text-xs text-slate-300 sm:text-sm">{routine.subtitle}</p>
              </div>

              {onToggleSave ? (
                <button
                  type="button"
                  onClick={() => onToggleSave(routine.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-extrabold transition-all ${
                    isSaved
                      ? "border-amber-400 bg-amber-400/20 text-amber-200"
                      : "border-white/20 bg-black/60 text-white hover:border-amber-300"
                  }`}
                >
                  <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
                  {isSaved ? "Guardada en Mis Rutinas" : "Guardar en Mis Rutinas"}
                </button>
              ) : null}
            </div>
          </div>

          <div className="min-w-0 space-y-3 border-b border-white/10 px-4 py-4 sm:hidden">
            <span className={`inline-block max-w-full rounded-full bg-gradient-to-r ${routine.accent} px-3 py-1 text-[10px] font-extrabold tracking-wide text-white uppercase`}>
              {routine.level} · {routine.equipment}
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-xl leading-tight font-extrabold break-words text-white">
              {routine.title}
            </h2>
            <p className="text-xs leading-relaxed break-words text-slate-300">{routine.subtitle}</p>
            {onToggleSave ? (
              <button
                type="button"
                onClick={() => onToggleSave(routine.id)}
                className={`inline-flex max-w-full items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold whitespace-normal ${isSaved ? "border-amber-400 bg-amber-400/20 text-amber-200" : "border-white/20 text-white"}`}
              >
                <Bookmark className="h-4 w-4 shrink-0" fill={isSaved ? "currentColor" : "none"} />
                {isSaved ? "Guardada en Mis Rutinas" : "Guardar en Mis Rutinas"}
              </button>
            ) : null}
          </div>

          <div className="min-w-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-8">
            {/* Summary bar + live rest timer */}
            <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-cyan-300" />
                <div>
                  <p className="text-xs text-slate-400">Duración y Gasto</p>
                  <p className="text-sm font-bold text-white">
                    {routine.durationMinutes} min · {routine.caloriesBurned} kcal
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Dumbbell className="h-5 w-5 text-fuchsia-300" />
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Progreso de series</span>
                    <span className="font-bold text-cyan-300">
                      {doneSets}/{totalSets} ({progress}%)
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-3.5 py-2">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-cyan-300" />
                  <div>
                    <p className="text-[10px] tracking-wider text-cyan-200 uppercase">Descanso</p>
                    <p className="font-[family-name:var(--font-display)] text-base font-extrabold text-white">
                      {String(Math.floor(restSecondsLeft / 60)).padStart(2, "0")}:
                      {String(restSecondsLeft % 60).padStart(2, "0")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setTimerRunning((v) => !v)}
                    className="grid h-8 w-8 place-items-center rounded-lg bg-white text-slate-950"
                  >
                    {timerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTimerRunning(false);
                      setRestSecondsLeft(60);
                    }}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/20 text-white"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Step-by-step exercises instructions */}
            <div className="mt-6">
              <h3 className="font-[family-name:var(--font-display)] flex items-center gap-2 text-lg font-extrabold text-white">
                <Sparkles className="h-5 w-5 text-cyan-300" />
                Instrucciones Paso a Paso de los Ejercicios ({routine.exercises.length} ejercicios)
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Lee la instrucción técnica de cada ejercicio y pulsa cada serie al terminarla para activar el descanso.
              </p>

              <div className="mt-4 space-y-4">
                {routine.exercises.map((ex, index) => {
                  const setsArr = Array.from({ length: ex.sets }, (_, i) => i + 1);
                  const allDone = setsArr.every(
                    (s) => completedSets[`${routine.id}:${ex.id}:${s}`],
                  );
                  return (
                    <div
                      key={ex.id}
                      className={`rounded-2xl border p-5 transition-all ${
                        allDone
                          ? "border-lime-400/50 bg-lime-400/10"
                          : "border-white/12 bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3.5">
                          <span
                            className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-extrabold ${
                              allDone
                                ? "bg-lime-400 text-slate-950"
                                : "bg-gradient-to-br from-fuchsia-500 to-cyan-400 text-white"
                            }`}
                          >
                            {allDone ? <Check className="h-5 w-5" /> : index + 1}
                          </span>
                          <div>
                            <p className="text-[10px] font-bold tracking-widest text-cyan-300 uppercase">
                              Paso {index + 1} · {ex.muscle}
                            </p>
                            <h4 className="font-[family-name:var(--font-display)] text-base font-extrabold text-white sm:text-lg">
                              {ex.name}
                            </h4>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
                              <span className="rounded-md bg-white/10 px-2.5 py-0.5">
                                {ex.sets} series
                              </span>
                              <span className="rounded-md bg-white/10 px-2.5 py-0.5">
                                {ex.reps}
                              </span>
                              <span className="rounded-md bg-white/10 px-2.5 py-0.5 text-amber-300">
                                <Flame className="mr-1 inline h-3 w-3" />
                                Descanso: {ex.restSeconds}s
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-[1.1fr_1fr]">
                        <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] p-3.5 text-xs leading-relaxed text-slate-200">
                          <span className="font-extrabold text-cyan-300">
                            📋 Instrucción técnica:{" "}
                          </span>
                          {ex.tip}
                        </div>
                        {ex.video ? (
                          <DemoVideo
                            src={ex.video}
                            poster={ex.videoPoster}
                            credit={ex.videoCredit}
                            label="Ver técnica"
                            className="h-40 sm:h-full sm:min-h-[8rem]"
                            rounded="rounded-xl"
                          />
                        ) : null}
                      </div>

                      <div className="mt-3.5 flex flex-wrap gap-2">
                        {setsArr.map((setNum) => {
                          const done = Boolean(completedSets[`${routine.id}:${ex.id}:${setNum}`]);
                          return (
                            <button
                              key={setNum}
                              type="button"
                              onClick={() => toggleSet(ex.id, setNum, ex.restSeconds)}
                              className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                                done
                                  ? "border-lime-400 bg-lime-400 text-slate-950 shadow-md shadow-lime-400/25"
                                  : "border-white/15 bg-white/5 text-slate-200 hover:border-cyan-300"
                              }`}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Serie {setNum}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/15 px-5 py-2.5 text-xs font-bold text-slate-300 hover:text-white"
              >
                Cerrar ventana
              </button>

              {onCompleteRoutine ? (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleComplete}
                  className="btn-glow inline-flex min-w-0 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 px-4 py-3.5 text-center text-xs font-extrabold whitespace-normal text-white shadow-lg shadow-fuchsia-500/30 transition-transform hover:scale-105 disabled:opacity-60 sm:w-auto sm:px-7 sm:text-sm"
                >
                  <Trophy className="h-4 w-4 shrink-0" />
                  {submitting
                    ? "Registrando..."
                    : "¡Completar Rutina y Sumar +50 XP!"}
                </button>
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
