"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Bookmark,
  BookOpen,
  Check,
  ChefHat,
  Clock,
  Flame,
  Plus,
  Salad,
  Sparkles,
  Trash2,
  Utensils,
} from "lucide-react";
import TiltCard from "@/components/TiltCard";
import RecipeDetailModal from "@/components/modals/RecipeDetailModal";
import { FITNESS_RECIPES, type FitnessRecipe } from "@/lib/fitness-content";
import type { RecipeLogView } from "@/lib/types";

type Props = {
  recipeLogs: RecipeLogView[];
  savedRecipeIds: string[];
  onToggleSaveRecipe: (recipeId: string) => Promise<void>;
  onCompleteRecipe: (recipe: FitnessRecipe) => Promise<void>;
  userRecipes?: FitnessRecipe[];
  onCreate?: () => void;
  onDeleteUserRecipe?: (recipe: FitnessRecipe) => void;
};

const FILTERS = [
  { id: "all", label: "Todas las recetas" },
  { id: "mine", label: "🥗 Creadas por mí" },
  { id: "saved", label: "⭐ Mis Recetas Guardadas" },
  { id: "proteina", label: "Aumento Muscular" },
  { id: "definicion", label: "Definición / Quema Grasa" },
  { id: "post-entreno", label: "Post-Entreno" },
  { id: "energia", label: "Energía Sostenida" },
] as const;

export default function RecipesHub({
  recipeLogs,
  savedRecipeIds,
  onToggleSaveRecipe,
  onCompleteRecipe,
  userRecipes = [],
  onCreate,
  onDeleteUserRecipe,
}: Props) {
  const [filter, setFilter] = useState<string>("all");
  const allRecipes = [...userRecipes, ...FITNESS_RECIPES];
  const selectedId = allRecipes[0]?.id ?? FITNESS_RECIPES[0].id;
  const [modalRecipe, setModalRecipe] = useState<FitnessRecipe | null>(null);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);

  const visible = allRecipes.filter((r) => {
    if (filter === "all") return true;
    if (filter === "mine") return Boolean(r.userOwned);
    if (filter === "saved") return savedRecipeIds.includes(r.id);
    return r.category === filter;
  });

  const activeRecipe = allRecipes.find((r) => r.id === selectedId) ?? allRecipes[0];

  function toggleIngredient(idx: number) {
    const key = `${activeRecipe.id}:ing:${idx}`;
    setCheckedIngredients((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleStep(idx: number) {
    const key = `${activeRecipe.id}:step:${idx}`;
    setCheckedSteps((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleComplete() {
    setSubmitting(true);
    try {
      await onCompleteRecipe(activeRecipe);
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenRecipe(recipe: FitnessRecipe) {
    setModalRecipe(recipe);
  }

  const totalProteinLogged = recipeLogs.reduce((sum, r) => sum + r.proteinGrams, 0);

  return (
    <div className="vt-hub min-w-0 max-w-full space-y-6 sm:space-y-8">
      <div className="glass noise relative min-w-0 max-w-full overflow-hidden rounded-[1.5rem] p-4 sm:rounded-[2rem] sm:p-8">
        <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-lime-400/15 blur-[95px]" />

        <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
          <div className="min-w-0 max-w-full">
            <p className="text-[11px] font-bold tracking-[0.25em] text-lime-400 uppercase">
              Nutrición inteligente & Macros
            </p>
            <h2 className="font-[family-name:var(--font-display)] mt-1 text-2xl font-extrabold sm:text-3xl">
              Recetas Fitness con Instrucciones Paso a Paso
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Haz clic en cualquier receta para abrir al instante sus ingredientes, instrucciones paso a paso o guardarla en tu perfil.
            </p>
          </div>

          <div className="flex min-w-0 max-w-full flex-wrap items-center gap-3">
          {onCreate ? (
            <button
              type="button"
              onClick={onCreate}
              className="btn-glow inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-lime-400 to-emerald-500 px-5 py-3 text-xs font-extrabold text-slate-950 shadow-lg shadow-lime-400/30 transition-transform hover:scale-105"
            >
              <Plus className="h-4 w-4" /> Crear mi receta
            </button>
          ) : null}
          <div className="flex min-w-0 max-w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <Salad className="h-5 w-5 shrink-0 text-lime-300" />
            <div className="min-w-0">
              <p className="font-[family-name:var(--font-display)] text-lg leading-none font-extrabold">
                {recipeLogs.length} comidas · {totalProteinLogged}g prot. · {savedRecipeIds.length} guardadas
              </p>
              <p className="text-[11px] text-slate-400">
                {userRecipes.length} creadas por ti
              </p>
            </div>
          </div>
          </div>
        </div>

        <div className="vt-filter-strip mt-6 flex max-w-full flex-wrap gap-2 sm:overflow-visible">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all ${
                filter === f.id
                  ? "bg-gradient-to-r from-lime-400 to-cyan-400 text-slate-950 shadow-lg shadow-lime-400/25"
                  : "border border-white/10 bg-white/5 text-slate-300 hover:border-white/30 hover:text-white"
              }`}
            >
              {f.label}
              {f.id === "saved" ? ` (${savedRecipeIds.length})` : ""}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-8 text-center">
            <p className="text-sm text-slate-300">
              Aún no has guardado ninguna receta en tus favoritas. Pulsa el botón &quot;Guardar&quot; en cualquier receta para tenerla aquí.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {visible.map((recipe) => {
              const isSelected = recipe.id === activeRecipe.id;
              const isSaved = savedRecipeIds.includes(recipe.id);
              return (
                <TiltCard key={recipe.id} className="rounded-3xl" intensity={8}>
                  <div
                    onClick={() => handleOpenRecipe(recipe)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") handleOpenRecipe(recipe);
                    }}
                    className={`group flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border transition-all ${
                      isSelected
                        ? "border-lime-400/80 bg-white/[0.08] shadow-[0_25px_60px_-20px_rgba(163,230,53,0.45)]"
                        : "border-white/10 bg-white/[0.03] hover:border-white/25"
                    }`}
                  >
                    <div className="relative h-44 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#07050d] via-[#07050d]/30 to-transparent" />
                      <span
                        className={`absolute top-3 left-3 rounded-full bg-gradient-to-r ${recipe.accent} px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow`}
                      >
                        {recipe.categoryLabel}
                      </span>
                      {recipe.userOwned ? (
                        <>
                          <span className="animate-float-badge absolute top-11 left-3 rounded-full border border-lime-300/60 bg-lime-500/25 px-2.5 py-0.5 text-[10px] font-extrabold text-lime-100 backdrop-blur">
                            🥗 Creada por ti
                          </span>
                          {onDeleteUserRecipe && recipe.dbId ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteUserRecipe(recipe);
                              }}
                              title="Eliminar mi receta"
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
                          onToggleSaveRecipe(recipe.id);
                        }}
                        title={isSaved ? "Quitar de Mis Recetas" : "Guardar en Mis Recetas"}
                        className={`absolute top-3 right-3 flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-extrabold transition-all ${
                          isSaved
                            ? "border-amber-400 bg-amber-400 text-slate-950"
                            : "border-white/25 bg-black/65 text-white hover:border-amber-300"
                        }`}
                      >
                        <Bookmark className="h-3 w-3" fill={isSaved ? "currentColor" : "none"} />
                        {isSaved ? "Guardada" : "Guardar"}
                      </button>

                      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between text-xs font-bold text-white">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-cyan-300" /> {recipe.prepMinutes} min
                        </span>
                        <span className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-0.5 text-lime-300">
                          <Flame className="h-3.5 w-3.5" /> {recipe.protein}g Prot
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-4">
                      <div>
                        <h3 className="font-[family-name:var(--font-display)] text-sm font-bold leading-snug text-white">
                          {recipe.title}
                        </h3>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                          {recipe.subtitle}
                        </p>
                      </div>
                      <div className="mt-3 space-y-2.5">
                        <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-2 text-center text-[10px]">
                          <div>
                            <p className="font-bold text-white">{recipe.calories}</p>
                            <p className="text-slate-500">kcal</p>
                          </div>
                          <div>
                            <p className="font-bold text-cyan-300">{recipe.carbs}g</p>
                            <p className="text-slate-500">carbs</p>
                          </div>
                          <div>
                            <p className="font-bold text-amber-300">{recipe.fats}g</p>
                            <p className="text-slate-500">grasas</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-1.5 rounded-xl bg-lime-400/15 py-2 text-xs font-extrabold text-lime-300 group-hover:bg-lime-400 group-hover:text-slate-950 transition-colors">
                          <BookOpen className="h-3.5 w-3.5" />
                          Ver instrucciones de receta
                        </div>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Recipe Interactive Preparation */}
      <div className="grid min-w-0 max-w-full grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[1.35fr_0.95fr]">
        <section className="glass noise relative min-w-0 overflow-hidden rounded-[1.5rem] p-4 sm:rounded-[2rem] sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-400/20 px-3 py-1 text-[11px] font-bold text-lime-300 uppercase">
                <ChefHat className="h-3.5 w-3.5" /> Instrucciones de la receta seleccionada
              </span>
              <h3 className="font-[family-name:var(--font-display)] mt-2 text-2xl font-extrabold sm:text-3xl">
                {activeRecipe.title}
              </h3>
              <p className="mt-1 text-sm text-slate-400">{activeRecipe.subtitle}</p>
            </div>

            <div className="grid min-w-0 w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
              {[
                { label: "Calorías", val: `${activeRecipe.calories} kcal`, color: "text-white" },
                { label: "Proteína", val: `${activeRecipe.protein}g`, color: "text-lime-300" },
                { label: "Carbos", val: `${activeRecipe.carbs}g`, color: "text-cyan-300" },
                { label: "Grasas", val: `${activeRecipe.fats}g`, color: "text-amber-300" },
              ].map((m) => (
                <div
                  key={m.label}
                  className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-center"
                >
                  <p className={`font-[family-name:var(--font-display)] text-sm font-extrabold break-words ${m.color}`}>
                    {m.val}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase">{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-[family-name:var(--font-display)] flex items-center gap-2 text-base font-bold text-white">
                <Utensils className="h-4 w-4 text-lime-300" />
                1. Ingredientes (toca para marcar)
              </h4>
              <ul className="mt-3 space-y-2">
                {activeRecipe.ingredients.map((ing, idx) => {
                  const done = Boolean(checkedIngredients[`${activeRecipe.id}:ing:${idx}`]);
                  return (
                    <li key={ing}>
                      <button
                        type="button"
                        onClick={() => toggleIngredient(idx)}
                        className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-xs transition-all ${
                          done
                            ? "border-lime-400/40 bg-lime-400/10 text-lime-200 line-through"
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
              <h4 className="font-[family-name:var(--font-display)] flex items-center gap-2 text-base font-bold text-white">
                <Sparkles className="h-4 w-4 text-cyan-300" />
                2. Instrucciones de preparación paso a paso
              </h4>
              <ol className="mt-3 space-y-2.5">
                {activeRecipe.steps.map((step, idx) => {
                  const done = Boolean(checkedSteps[`${activeRecipe.id}:step:${idx}`]);
                  return (
                    <li key={step}>
                      <button
                        type="button"
                        onClick={() => toggleStep(idx)}
                        className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-xs leading-relaxed transition-all ${
                          done
                            ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100"
                            : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/30"
                        }`}
                      >
                        <span
                          className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[11px] font-extrabold ${
                            done
                              ? "bg-cyan-400 text-slate-950"
                              : "bg-white/10 text-white"
                          }`}
                        >
                          {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : idx + 1}
                        </span>
                        <span>{step}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
            <p className="text-xs text-slate-400">
              Al registrar esta receta sumas +15 XP y se marca tu hábito de comer saludable hoy.
            </p>
            <button
              type="button"
              disabled={submitting}
              onClick={handleComplete}
              className="btn-glow inline-flex min-w-0 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 px-4 py-3.5 text-center text-xs font-extrabold whitespace-normal text-slate-950 shadow-[0_18px_40px_-15px_rgba(163,230,53,0.75)] transition-transform hover:scale-105 disabled:opacity-60 sm:w-auto sm:px-7 sm:text-sm"
            >
              <Salad className="h-4 w-4 shrink-0" />
              {submitting
                ? "Registrando..."
                : "¡Registrar Comida Saludable Hoy (+15 XP)!"}
            </button>
          </div>
        </section>

        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeRecipe.image}
              alt={activeRecipe.title}
              className="h-64 w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05030a] via-[#05030a]/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <span className="rounded-full bg-lime-400/20 px-3 py-1 text-[10px] font-bold text-lime-300 uppercase">
                {activeRecipe.categoryLabel}
              </span>
              <p className="font-[family-name:var(--font-display)] mt-2 text-xl font-bold text-white">
                {activeRecipe.title}
              </p>
            </div>
          </div>

          <section className="glass rounded-[2rem] p-6">
            <p className="text-[11px] font-bold tracking-[0.25em] text-lime-300 uppercase">
              Tus comidas registradas ({recipeLogs.length})
            </p>
            {recipeLogs.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">
                Prepara cualquiera de las recetas y pulsa registrar para llevar tu control de proteína y sumar XP.
              </p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {recipeLogs.slice(0, 6).map((log) => (
                  <motion.li
                    key={log.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{log.recipeTitle}</p>
                      <p className="mt-0.5 text-slate-400">
                        {log.calories} kcal · {log.proteinGrams}g proteína · {log.day}
                      </p>
                    </div>
                    <span className="rounded-full bg-lime-400/15 px-2.5 py-1 font-bold text-lime-300">
                      +15 XP
                    </span>
                  </motion.li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* Pop-up modal when any recipe card is clicked */}
      <RecipeDetailModal
        recipe={modalRecipe}
        onClose={() => setModalRecipe(null)}
        isSaved={modalRecipe ? savedRecipeIds.includes(modalRecipe.id) : false}
        onToggleSave={onToggleSaveRecipe}
        onCompleteRecipe={onCompleteRecipe}
      />
    </div>
  );
}
