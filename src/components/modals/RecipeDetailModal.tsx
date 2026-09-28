"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bookmark,
  Check,
  ChefHat,
  Clock,
  Flame,
  Salad,
  Sparkles,
  Utensils,
  X,
} from "lucide-react";
import type { FitnessRecipe } from "@/lib/fitness-content";

type Props = {
  recipe: FitnessRecipe | null;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave?: (recipeId: string) => Promise<void> | void;
  onCompleteRecipe?: (recipe: FitnessRecipe) => Promise<void> | void;
};

export default function RecipeDetailModal({
  recipe,
  onClose,
  isSaved = false,
  onToggleSave,
  onCompleteRecipe,
}: Props) {
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!recipe) return;
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
  }, [recipe, onClose]);

  if (!recipe) return null;

  function toggleIngredient(idx: number) {
    if (!recipe) return;
    const key = `${recipe.id}:ing:${idx}`;
    setCheckedIngredients((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleStep(idx: number) {
    if (!recipe) return;
    const key = `${recipe.id}:step:${idx}`;
    setCheckedSteps((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleComplete() {
    if (!recipe || !onCompleteRecipe) return;
    setSubmitting(true);
    try {
      await onCompleteRecipe(recipe);
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
          aria-label={`Instrucciones de ${recipe.title}`}
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="vt-modal-sheet relative max-h-[100dvh] w-full min-w-0 overflow-x-hidden overflow-y-auto rounded-t-[1.5rem] border border-lime-400/35 bg-[#090712] shadow-[0_40px_120px_-25px_rgba(163,230,53,0.45)] sm:my-8 sm:max-h-[90vh] sm:max-w-4xl sm:rounded-[2rem]"
        >
          {/* Top Hero Banner */}
          <div className="relative h-36 w-full overflow-hidden sm:h-64">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={recipe.image}
              alt={recipe.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090712] via-[#090712]/55 to-transparent" />

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar instrucciones de receta"
              className="absolute top-3 right-3 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/70 text-white transition-transform hover:scale-110 sm:top-4 sm:right-4 sm:h-10 sm:w-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="absolute inset-x-6 bottom-4 hidden flex-wrap items-end justify-between gap-4 sm:flex">
              <div className="min-w-0">
                <span
                  className={`inline-block rounded-full bg-gradient-to-r ${recipe.accent} px-3 py-1 text-[10px] font-extrabold tracking-wider text-white uppercase`}
                >
                  {recipe.categoryLabel} · {recipe.prepMinutes} min
                </span>
                <h2 className="font-[family-name:var(--font-display)] mt-2 text-2xl font-extrabold text-white sm:text-3xl">
                  {recipe.title}
                </h2>
                <p className="mt-1 text-xs text-slate-300 sm:text-sm">{recipe.subtitle}</p>
              </div>

              {onToggleSave ? (
                <button
                  type="button"
                  onClick={() => onToggleSave(recipe.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-extrabold transition-all ${
                    isSaved
                      ? "border-amber-400 bg-amber-400/20 text-amber-200"
                      : "border-white/20 bg-black/60 text-white hover:border-amber-300"
                  }`}
                >
                  <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
                  {isSaved ? "Guardada en Mis Recetas" : "Guardar en Mis Recetas"}
                </button>
              ) : null}
            </div>
          </div>

          <div className="min-w-0 space-y-3 border-b border-white/10 px-4 py-4 sm:hidden">
            <span className={`inline-block max-w-full rounded-full bg-gradient-to-r ${recipe.accent} px-3 py-1 text-[10px] font-extrabold tracking-wide text-white uppercase`}>
              {recipe.categoryLabel} · {recipe.prepMinutes} min
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-xl leading-tight font-extrabold break-words text-white">
              {recipe.title}
            </h2>
            <p className="text-xs leading-relaxed break-words text-slate-300">{recipe.subtitle}</p>
            {onToggleSave ? (
              <button
                type="button"
                onClick={() => onToggleSave(recipe.id)}
                className={`inline-flex max-w-full items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold whitespace-normal ${isSaved ? "border-amber-400 bg-amber-400/20 text-amber-200" : "border-white/20 text-white"}`}
              >
                <Bookmark className="h-4 w-4 shrink-0" fill={isSaved ? "currentColor" : "none"} />
                {isSaved ? "Guardada en Mis Recetas" : "Guardar en Mis Recetas"}
              </button>
            ) : null}
          </div>

          <div className="min-w-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-8">
            {/* Macros Bar */}
            <div className="vt-mobile-macros grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <p className="flex items-center justify-center gap-1 text-sm font-extrabold text-white">
                  <Clock className="h-3.5 w-3.5 text-cyan-300" /> {recipe.prepMinutes} min
                </p>
                <p className="text-[10px] text-slate-400 uppercase">Tiempo</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <p className="flex items-center justify-center gap-1 text-sm font-extrabold text-white">
                  <Flame className="h-3.5 w-3.5 text-orange-400" /> {recipe.calories} kcal
                </p>
                <p className="text-[10px] text-slate-400 uppercase">Calorías</p>
              </div>
              <div className="rounded-2xl border border-lime-400/30 bg-lime-400/10 p-3 text-center">
                <p className="text-sm font-extrabold text-lime-300">{recipe.protein}g</p>
                <p className="text-[10px] text-lime-200 uppercase">Proteína</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <p className="text-sm font-extrabold text-cyan-300">{recipe.carbs}g</p>
                <p className="text-[10px] text-slate-400 uppercase">Carbohidratos</p>
              </div>
              <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center sm:col-span-1">
                <p className="text-sm font-extrabold text-amber-300">{recipe.fats}g</p>
                <p className="text-[10px] text-slate-400 uppercase">Grasas buenas</p>
              </div>
            </div>

            {/* Ingredients + Step-by-step instructions */}
            <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1.3fr]">
              <div>
                <h3 className="font-[family-name:var(--font-display)] flex items-center gap-2 text-base font-extrabold text-white">
                  <Utensils className="h-4 w-4 text-lime-300" />
                  1. Ingredientes ({recipe.ingredients.length})
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Toca cada ingrediente para marcarlo mientras preparas.
                </p>
                <ul className="mt-3 space-y-2">
                  {recipe.ingredients.map((ing, idx) => {
                    const done = Boolean(checkedIngredients[`${recipe.id}:ing:${idx}`]);
                    return (
                      <li key={ing}>
                        <button
                          type="button"
                          onClick={() => toggleIngredient(idx)}
                          className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-xs transition-all ${
                            done
                              ? "border-lime-400/40 bg-lime-400/15 text-lime-200 line-through"
                              : "border-white/10 bg-white/[0.03] text-slate-200 hover:border-white/30"
                          }`}
                        >
                          <span
                            className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${
                              done
                                ? "border-lime-400 bg-lime-400 text-slate-950"
                                : "border-white/25"
                            }`}
                          >
                            {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                          </span>
                          <span>{ing}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div>
                <h3 className="font-[family-name:var(--font-display)] flex items-center gap-2 text-base font-extrabold text-white">
                  <ChefHat className="h-4 w-4 text-cyan-300" />
                  2. Instrucciones de Preparación Paso a Paso
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Sigue el orden de elaboración y marca cada paso al completarlo.
                </p>
                <ol className="mt-3 space-y-3">
                  {recipe.steps.map((step, idx) => {
                    const done = Boolean(checkedSteps[`${recipe.id}:step:${idx}`]);
                    return (
                      <li key={step}>
                        <button
                          type="button"
                          onClick={() => toggleStep(idx)}
                          className={`flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left text-xs leading-relaxed transition-all ${
                            done
                              ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-100"
                              : "border-white/12 bg-white/[0.04] text-slate-200 hover:border-cyan-400/40"
                          }`}
                        >
                          <span
                            className={`grid h-7 w-7 shrink-0 place-items-center rounded-xl text-xs font-extrabold ${
                              done
                                ? "bg-cyan-400 text-slate-950"
                                : "bg-gradient-to-br from-lime-400 to-cyan-400 text-slate-950"
                            }`}
                          >
                            {done ? <Check className="h-4 w-4" strokeWidth={3} /> : idx + 1}
                          </span>
                          <div>
                            <p className="text-[10px] font-extrabold tracking-wider text-cyan-300 uppercase">
                              Paso {idx + 1}
                            </p>
                            <p className="mt-0.5 text-xs sm:text-sm">{step}</p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/15 px-5 py-2.5 text-xs font-bold text-slate-300 hover:text-white"
              >
                Cerrar instrucciones
              </button>

              {onCompleteRecipe ? (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleComplete}
                  className="btn-glow inline-flex min-w-0 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 px-4 py-3.5 text-center text-xs font-extrabold whitespace-normal text-slate-950 shadow-lg shadow-lime-400/30 transition-transform hover:scale-105 disabled:opacity-60 sm:w-auto sm:px-7 sm:text-sm"
                >
                  <Salad className="h-4 w-4 shrink-0" />
                  {submitting
                    ? "Registrando..."
                    : "¡He preparado esta receta hoy (+15 XP)!"}
                </button>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-lime-300">
                  <Sparkles className="h-4 w-4" /> Inicia sesión para guardar y sumar +15 XP
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
