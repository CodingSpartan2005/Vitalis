"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, Dumbbell, Flame, Salad, ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import TiltCard from "@/components/TiltCard";
import RoutineDetailModal from "@/components/modals/RoutineDetailModal";
import RecipeDetailModal from "@/components/modals/RecipeDetailModal";
import {
  FITNESS_RECIPES,
  WORKOUT_ROUTINES,
  type FitnessRecipe,
  type WorkoutRoutine,
} from "@/lib/fitness-content";

export default function FitnessPreview() {
  const [modalRoutine, setModalRoutine] = useState<WorkoutRoutine | null>(null);
  const [modalRecipe, setModalRecipe] = useState<FitnessRecipe | null>(null);

  return (
    <section id="rutinas-preview" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-blob absolute top-1/3 left-10 h-[28rem] w-[28rem] rounded-full bg-fuchsia-600/15 blur-[130px]" />
        <div className="animate-blob absolute bottom-10 right-10 h-[28rem] w-[28rem] rounded-full bg-lime-400/15 blur-[130px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold tracking-[0.3em] text-lime-400 uppercase">
            Entrenamiento & Nutrición incluidos
          </p>
          <h2 className="font-[family-name:var(--font-display)] mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Rutinas guiadas y <span className="text-gradient">recetas fitness</span> con instrucciones
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Haz clic en cualquier rutina o receta para ver sus instrucciones paso a paso ahora mismo, o regístrate para guardarlas en tu perfil personal.
          </p>
        </Reveal>

        {/* Routines row */}
        <div className="mt-14">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="font-[family-name:var(--font-display)] flex items-center gap-2 text-2xl font-extrabold text-white">
              <Dumbbell className="h-6 w-6 text-cyan-400" /> Rutinas Interactivas (+50 XP)
            </h3>
            <Link
              href="/registro"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:underline"
            >
              Crear mi perfil para guardar mis rutinas <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {WORKOUT_ROUTINES.slice(0, 3).map((routine, idx) => (
              <Reveal key={routine.id} delay={idx * 100}>
                <TiltCard className="h-full rounded-3xl" intensity={9}>
                  <div
                    onClick={() => setModalRoutine(routine)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setModalRoutine(routine);
                    }}
                    className="glass group flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl transition-all hover:border-cyan-400/50"
                  >
                    <div className="relative h-48 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={routine.image}
                        alt={routine.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#07050d] via-transparent to-transparent" />
                      <span
                        className={`absolute top-3 left-3 rounded-full bg-gradient-to-r ${routine.accent} px-3 py-1 text-[10px] font-bold text-white uppercase`}
                      >
                        {routine.level}
                      </span>
                      <div className="absolute inset-x-4 bottom-3 flex items-center gap-3 text-xs font-bold text-slate-200">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-cyan-300" /> {routine.durationMinutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Flame className="h-3.5 w-3.5 text-orange-400" /> {routine.caloriesBurned} kcal
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-5">
                      <div>
                        <h4 className="font-[family-name:var(--font-display)] text-lg font-bold text-white">
                          {routine.title}
                        </h4>
                        <p className="mt-1 text-xs text-slate-400">{routine.subtitle}</p>
                        <ul className="mt-3 space-y-1 text-xs text-slate-300">
                          {routine.exercises.slice(0, 3).map((ex) => (
                            <li key={ex.id} className="truncate">
                              • {ex.name} ({ex.sets}x{ex.reps})
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 group-hover:translate-x-1 transition-transform">
                        <BookOpen className="h-3.5 w-3.5" />
                        Ver instrucciones paso a paso <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Recipes row */}
        <div className="mt-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="font-[family-name:var(--font-display)] flex items-center gap-2 text-2xl font-extrabold text-white">
              <Salad className="h-6 w-6 text-lime-400" /> Recetas Fitness con Macros (+15 XP)
            </h3>
            <Link
              href="/registro"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-lime-300 hover:underline"
            >
              Crear mi perfil para guardar mis recetas <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {FITNESS_RECIPES.slice(0, 3).map((recipe, idx) => (
              <Reveal key={recipe.id} delay={idx * 100}>
                <TiltCard className="h-full rounded-3xl" intensity={9}>
                  <div
                    onClick={() => setModalRecipe(recipe)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setModalRecipe(recipe);
                    }}
                    className="glass group flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl transition-all hover:border-lime-400/50"
                  >
                    <div className="relative h-48 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#07050d] via-transparent to-transparent" />
                      <span
                        className={`absolute top-3 left-3 rounded-full bg-gradient-to-r ${recipe.accent} px-3 py-1 text-[10px] font-bold text-white uppercase`}
                      >
                        {recipe.categoryLabel}
                      </span>
                      <div className="absolute inset-x-4 bottom-3 flex items-center justify-between text-xs font-bold text-white">
                        <span>{recipe.prepMinutes} min</span>
                        <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-lime-300">
                          {recipe.protein}g Proteína · {recipe.calories} kcal
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-5">
                      <div>
                        <h4 className="font-[family-name:var(--font-display)] text-lg font-bold text-white">
                          {recipe.title}
                        </h4>
                        <p className="mt-1 text-xs text-slate-400">{recipe.subtitle}</p>
                      </div>
                      <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-lime-300 group-hover:translate-x-1 transition-transform">
                        <BookOpen className="h-3.5 w-3.5" />
                        Ver ingredientes e instrucciones <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <RoutineDetailModal
        routine={modalRoutine}
        onClose={() => setModalRoutine(null)}
      />
      <RecipeDetailModal
        recipe={modalRecipe}
        onClose={() => setModalRecipe(null)}
      />
    </section>
  );
}
