"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bookmark,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Dumbbell,
  Flame,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Timer,
  Trash2,
  Trophy,
} from "lucide-react";
import DemoVideo from "@/components/DemoVideo";
import TiltCard from "@/components/TiltCard";
import RoutineDetailModal from "@/components/modals/RoutineDetailModal";
import { WORKOUT_ROUTINES, type WorkoutRoutine } from "@/lib/fitness-content";
import type { WorkoutLogView } from "@/lib/types";

type Props = {
  workoutLogs: WorkoutLogView[];
  savedRoutineIds: string[];
  onToggleSaveRoutine: (routineId: string) => Promise<void>;
  onCompleteRoutine: (routine: WorkoutRoutine) => Promise<void>;
  userRoutines?: WorkoutRoutine[];
  onCreate?: () => void;
  onDeleteUserRoutine?: (routine: WorkoutRoutine) => void;
};

const CATEGORIES = [
  { id: "all", label: "Todas las rutinas" },
  { id: "mine", label: "🔥 Creadas por mí" },
  { id: "saved", label: "⭐ Mis Rutinas Guardadas" },
  { id: "hipertrofia", label: "Hipertrofia" },
  { id: "hiit", label: "HIIT Quema-Grasa" },
  { id: "fuerza", label: "Fuerza Pura" },
  { id: "core", label: "Core & Movilidad" },
] as const;

export default function RoutinesHub({
  workoutLogs,
  savedRoutineIds,
  onToggleSaveRoutine,
  onCompleteRoutine,
  userRoutines = [],
  onCreate,
  onDeleteUserRoutine,
}: Props) {
  const [category, setCategory] = useState<string>("all");
  const [modalRoutine, setModalRoutine] = useState<WorkoutRoutine | null>(null);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});
  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const allRoutines = [...userRoutines, ...WORKOUT_ROUTINES];
  const selectedId = allRoutines[0]?.id ?? WORKOUT_ROUTINES[0].id;

  const filtered = allRoutines.filter((r) => {
    if (category === "all") return true;
    if (category === "mine") return Boolean(r.userOwned);
    if (category === "saved") return savedRoutineIds.includes(r.id);
    return r.category === category;
  });

  const activeRoutine = allRoutines.find((r) => r.id === selectedId) ?? allRoutines[0];

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

  function startRestTimer(seconds: number) {
    setRestSecondsLeft(seconds);
    setTimerRunning(true);
  }

  function toggleSet(exerciseId: string, setIndex: number, restTime: number) {
    const key = `${activeRoutine.id}:${exerciseId}:${setIndex}`;
    setCompletedSets((prev) => {
      const nextVal = !prev[key];
      if (nextVal) {
        startRestTimer(restTime);
      }
      return { ...prev, [key]: nextVal };
    });
  }

  const totalSetsInRoutine = activeRoutine.exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const doneSetsInRoutine = activeRoutine.exercises.reduce((acc, ex) => {
    let count = 0;
    for (let i = 1; i <= ex.sets; i += 1) {
      if (completedSets[`${activeRoutine.id}:${ex.id}:${i}`]) count += 1;
    }
    return acc + count;
  }, 0);
  const routineProgress =
    totalSetsInRoutine > 0 ? Math.round((doneSetsInRoutine / totalSetsInRoutine) * 100) : 0;

  function markAllSets() {
    const updates: Record<string, boolean> = { ...completedSets };
    for (const ex of activeRoutine.exercises) {
      for (let i = 1; i <= ex.sets; i += 1) {
        updates[`${activeRoutine.id}:${ex.id}:${i}`] = true;
      }
    }
    setCompletedSets(updates);
  }

  async function handleFinishRoutine() {
    setSubmitting(true);
    try {
      await onCompleteRoutine(activeRoutine);
      markAllSets();
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenRoutine(routine: WorkoutRoutine) {
    setModalRoutine(routine);
  }

  return (
    <div className="vt-hub min-w-0 max-w-full space-y-6 sm:space-y-8">
      <div className="glass noise relative min-w-0 max-w-full overflow-hidden rounded-[1.5rem] p-4 sm:rounded-[2rem] sm:p-8">
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-[95px]" />
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
          <div className="min-w-0 max-w-full">
            <p className="text-[11px] font-bold tracking-[0.25em] text-cyan-400 uppercase">
              Entrenamiento guiado 3D
            </p>
            <h2 className="font-[family-name:var(--font-display)] mt-1 text-2xl font-extrabold sm:text-3xl">
              Rutinas Fitness con Instrucciones Paso a Paso
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Haz clic en cualquier rutina para abrir sus instrucciones detalladas, marcar cada serie o guardarla en tu perfil.
            </p>
          </div>

          <div className="flex min-w-0 max-w-full flex-wrap items-center gap-3">
            <div className="flex min-w-0 max-w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <Trophy className="h-5 w-5 shrink-0 text-lime-300" />
              <div className="min-w-0">
                <p className="font-[family-name:var(--font-display)] text-sm leading-tight font-extrabold sm:text-lg">
                  {workoutLogs.length} completadas · {savedRoutineIds.length} guardadas
                </p>
                <p className="text-[11px] text-slate-400">
                  {userRoutines.length} creadas por ti
                </p>
              </div>
            </div>
            {onCreate ? (
              <button
                type="button"
                onClick={onCreate}
                className="btn-glow inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-fuchsia-500/30 transition-transform hover:scale-105"
              >
                <Plus className="h-4 w-4" /> Crear mi rutina
              </button>
            ) : null}
          </div>
        </div>

        <div className="vt-filter-strip mt-6 flex max-w-full flex-wrap gap-2 sm:overflow-visible">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all ${
                category === cat.id
                  ? "bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white shadow-lg shadow-fuchsia-500/25"
                  : "border border-white/10 bg-white/5 text-slate-300 hover:border-white/30 hover:text-white"
              }`}
            >
              {cat.label}
              {cat.id === "saved" ? ` (${savedRoutineIds.length})` : ""}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-8 text-center">
            <p className="text-sm text-slate-300">
              Aún no has guardado ninguna rutina en tus favoritas. Pulsa el icono de marcador ⭐ en cualquier rutina para guardarla en tu perfil.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((routine) => {
              const isSelected = routine.id === activeRoutine.id;
              const isSaved = savedRoutineIds.includes(routine.id);
              return (
                <TiltCard key={routine.id} className="rounded-3xl" intensity={8}>
                  <div
                    onClick={() => handleOpenRoutine(routine)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") handleOpenRoutine(routine);
                    }}
                    className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border transition-all ${
                      isSelected
                        ? "border-cyan-400/80 bg-white/[0.08] shadow-[0_25px_60px_-20px_rgba(34,211,238,0.45)]"
                        : "border-white/10 bg-white/[0.03] hover:border-white/25"
                    }`}
                  >
                    <div className="relative h-44 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={routine.image}
                        alt={routine.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#07050d] via-[#07050d]/35 to-transparent" />
                      <span
                        className={`absolute top-3 left-3 rounded-full bg-gradient-to-r ${routine.accent} px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow`}
                      >
                        {routine.level}
                      </span>
                      {routine.userOwned ? (
                        <>
                          <span className="animate-float-badge absolute top-11 left-3 rounded-full border border-fuchsia-300/60 bg-fuchsia-500/25 px-2.5 py-0.5 text-[10px] font-extrabold text-fuchsia-100 backdrop-blur">
                            🔥 Creada por ti
                          </span>
                          {onDeleteUserRoutine && routine.dbId ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteUserRoutine(routine);
                              }}
                              title="Eliminar mi rutina"
                              className="absolute right-3 bottom-3 grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-black/70 text-slate-300 backdrop-blur transition-all hover:scale-110 hover:border-rose-400 hover:text-rose-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : null}
                        </>
                      ) : null}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSaveRoutine(routine.id);
                        }}
                        title={isSaved ? "Quitar de Mis Rutinas" : "Guardar en Mis Rutinas"}
                        className={`absolute top-3 right-3 flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-extrabold transition-all ${
                          isSaved
                            ? "border-amber-400 bg-amber-400 text-slate-950"
                            : "border-white/25 bg-black/65 text-white hover:border-amber-300"
                        }`}
                      >
                        <Bookmark className="h-3 w-3" fill={isSaved ? "currentColor" : "none"} />
                        {isSaved ? "Guardada" : "Guardar"}
                      </button>

                      <div className="absolute inset-x-4 bottom-3 flex items-center gap-3 text-xs font-semibold text-slate-200">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-cyan-300" /> {routine.durationMinutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Flame className="h-3.5 w-3.5 text-orange-400" /> {routine.caloriesBurned} kcal
                        </span>
                        <span className="flex items-center gap-1">
                          <Dumbbell className="h-3.5 w-3.5 text-fuchsia-300" /> {routine.exercises.length} ej.
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-5">
                      <div>
                        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-white">
                          {routine.title}
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-slate-400">
                          {routine.subtitle}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                        <span className="text-slate-400">{routine.equipment}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-400/15 px-3 py-1 font-bold text-cyan-300 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-colors">
                          <BookOpen className="h-3.5 w-3.5" />
                          Ver instrucciones
                        </span>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Routine Interactive Console */}
      <div className="grid min-w-0 max-w-full grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[1.45fr_0.85fr]">
        <section className="glass noise relative min-w-0 overflow-hidden rounded-[1.5rem] p-4 sm:rounded-[2rem] sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-500/20 px-3 py-1 text-[11px] font-bold text-fuchsia-300 uppercase">
                <Sparkles className="h-3.5 w-3.5" /> Instrucciones paso a paso de la rutina seleccionada
              </span>
              <h3 className="font-[family-name:var(--font-display)] mt-2 text-2xl font-extrabold sm:text-3xl">
                {activeRoutine.title}
              </h3>
              <p className="mt-1 text-sm text-slate-400">{activeRoutine.subtitle}</p>
            </div>

            <div className="min-w-[160px] rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-right">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Progreso</span>
                <span className="font-bold text-cyan-300">
                  {doneSetsInRoutine}/{totalSetsInRoutine} series ({routineProgress}%)
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-lime-400"
                  animate={{ width: `${routineProgress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {activeRoutine.exercises.map((ex, index) => {
              const setsArray = Array.from({ length: ex.sets }, (_, i) => i + 1);
              const allSetsDone = setsArray.every(
                (setNum) => completedSets[`${activeRoutine.id}:${ex.id}:${setNum}`],
              );

              return (
                <div
                  key={ex.id}
                  className={`rounded-2xl border p-5 transition-all ${
                    allSetsDone
                      ? "border-lime-400/40 bg-lime-400/[0.06]"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-extrabold ${
                          allSetsDone
                            ? "bg-lime-400 text-slate-950"
                            : "bg-gradient-to-br from-fuchsia-500/30 to-cyan-400/30 text-white"
                        }`}
                      >
                        {allSetsDone ? <Check className="h-5 w-5" /> : index + 1}
                      </span>
                      <div>
                        <p className="text-[10px] font-bold tracking-widest text-cyan-300 uppercase">
                          Paso {index + 1} · {ex.muscle}
                        </p>
                        <h4 className="font-[family-name:var(--font-display)] text-base font-bold text-white">
                          {ex.name}
                        </h4>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          <span>{ex.sets} series</span>
                          <span>· {ex.reps}</span>
                          <span>· Descanso {ex.restSeconds}s</span>
                        </div>
                        <div className="mt-2 grid gap-3 sm:grid-cols-[1.2fr_1fr]">
                          <p className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] p-3 text-xs leading-relaxed text-slate-200">
                            📋 <span className="font-bold text-cyan-300">Cómo ejecutarlo:</span>{" "}
                            {ex.tip}
                          </p>
                          {ex.video ? (
                            <DemoVideo
                              src={ex.video}
                              poster={ex.videoPoster}
                              credit={ex.videoCredit}
                              label="Ver técnica"
                              className="h-36 w-full sm:h-full sm:min-h-[7rem]"
                              rounded="rounded-xl"
                            />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {setsArray.map((setNum) => {
                      const key = `${activeRoutine.id}:${ex.id}:${setNum}`;
                      const isDone = Boolean(completedSets[key]);
                      return (
                        <button
                          key={setNum}
                          type="button"
                          onClick={() => toggleSet(ex.id, setNum, ex.restSeconds)}
                          className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                            isDone
                              ? "border-lime-400 bg-gradient-to-r from-lime-400 to-emerald-400 text-slate-950 shadow-lg shadow-lime-400/25"
                              : "border-white/15 bg-white/5 text-slate-300 hover:border-cyan-300/60 hover:text-white"
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

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={markAllSets}
              className="rounded-full border border-white/15 px-5 py-3 text-xs font-semibold text-slate-300 transition-colors hover:border-cyan-300/60 hover:text-white"
            >
              Marcar todas las series
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={handleFinishRoutine}
              className="btn-glow inline-flex min-w-0 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 px-4 py-3.5 text-center text-xs font-extrabold whitespace-normal text-white shadow-[0_18px_40px_-15px_rgba(168,85,247,0.85)] transition-transform hover:scale-105 disabled:opacity-60 sm:w-auto sm:px-7 sm:text-sm"
            >
              <Trophy className="h-4 w-4 shrink-0" />
              {submitting
                ? "Guardando entreno..."
                : "¡Terminar Rutina (+50 XP y marcar hábito)!"}
            </button>
          </div>
        </section>

        <div className="space-y-6">
          <section className="glass relative overflow-hidden rounded-[2rem] p-6">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold tracking-[0.25em] text-cyan-400 uppercase">
                Cronómetro de descanso
              </p>
              <Timer className="h-5 w-5 text-cyan-300" />
            </div>

            <div className="my-6 text-center">
              <p className="font-[family-name:var(--font-display)] text-6xl font-extrabold tracking-tight text-white">
                {String(Math.floor(restSecondsLeft / 60)).padStart(2, "0")}:
                {String(restSecondsLeft % 60).padStart(2, "0")}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                {timerRunning
                  ? "Recupera el aliento y prepárate para la siguiente serie"
                  : "Se activa automáticamente al marcar una serie"}
              </p>
            </div>

            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setTimerRunning((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-slate-950 transition-transform hover:scale-105"
              >
                {timerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {timerRunning ? "Pausar" : "Iniciar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimerRunning(false);
                  setRestSecondsLeft(60);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold text-white hover:border-white/40"
              >
                <RotateCcw className="h-3.5 w-3.5" /> 60s
              </button>
              <button
                type="button"
                onClick={() => startRestTimer(90)}
                className="rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold text-white hover:border-white/40"
              >
                90s
              </button>
            </div>
          </section>

          <section className="glass rounded-[2rem] p-6">
            <p className="text-[11px] font-bold tracking-[0.25em] text-lime-300 uppercase">
              Historial de entrenos ({workoutLogs.length})
            </p>
            {workoutLogs.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">
                Completa tu primera rutina hoy para inaugurar tu historial y sumar +50 XP.
              </p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                <AnimatePresence initial={false}>
                  {workoutLogs.slice(0, 6).map((log) => (
                    <motion.li
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs"
                    >
                      <div>
                        <p className="font-bold text-white">{log.routineTitle}</p>
                        <p className="mt-0.5 text-slate-400">
                          {log.durationMinutes} min · {log.caloriesBurned} kcal · {log.day}
                        </p>
                      </div>
                      <span className="rounded-full bg-lime-400/15 px-2.5 py-1 font-bold text-lime-300">
                        +50 XP
                      </span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* Pop-up modal when any routine card is clicked */}
      <RoutineDetailModal
        routine={modalRoutine}
        onClose={() => setModalRoutine(null)}
        isSaved={modalRoutine ? savedRoutineIds.includes(modalRoutine.id) : false}
        onToggleSave={onToggleSaveRoutine}
        onCompleteRoutine={onCompleteRoutine}
      />
    </div>
  );
}
