"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Dumbbell,
  Flame,
  Plus,
  Quote as QuoteIcon,
  Salad,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { authFetch } from "@/lib/client-auth";
import { useFinePointer } from "@/lib/use-fine-pointer";
import {
  RECIPE_IMAGES,
  ROUTINE_ACCENTS,
  ROUTINE_IMAGES,
} from "@/lib/content-options";

export type CreatorKind = "routine" | "recipe" | "quote" | null;

type Props = {
  kind: CreatorKind;
  onClose: () => void;
  onCreated: (kind: Exclude<CreatorKind, null>) => Promise<void> | void;
};

const inputBase =
  "min-w-0 max-w-full w-full rounded-xl border border-white/12 bg-white/[0.05] px-3.5 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-fuchsia-400/70 focus:bg-white/[0.08] focus:ring-2 focus:ring-fuchsia-500/20";
const labelBase = "mb-1.5 block text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase";

type ExerciseDraft = {
  name: string;
  sets: string;
  reps: string;
  restSeconds: string;
  muscle: string;
  tip: string;
};

const emptyExercise = (): ExerciseDraft => ({
  name: "",
  sets: "3",
  reps: "10 reps",
  restSeconds: "60",
  muscle: "",
  tip: "",
});

export default function ContentCreator({ kind, onClose, onCreated }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (!kind) return;
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [kind, onClose]);

  return (
    <AnimatePresence>
      {kind ? (
        <ModalShell kind={kind} onClose={onClose}>
          {kind === "routine" ? (
            <RoutineForm onCreated={onCreated} />
          ) : kind === "recipe" ? (
            <RecipeForm onCreated={onCreated} />
          ) : (
            <QuoteForm onCreated={onCreated} />
          )}
        </ModalShell>
      ) : null}
    </AnimatePresence>
  );
}

function ModalShell({
  kind,
  onClose,
  children,
}: {
  kind: Exclude<CreatorKind, null>;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const meta = {
    routine: {
      title: "Crea tu propia rutina",
      sub: "Diseña ejercicios, series y descansos. Quedará guardada en tu cuenta.",
      icon: Dumbbell,
      accent: "from-fuchsia-500 to-cyan-400",
    },
    recipe: {
      title: "Crea tu propia receta",
      sub: "Añade ingredientes, pasos y macros. Se guardará en tu recetario.",
      icon: Salad,
      accent: "from-lime-400 to-emerald-500",
    },
    quote: {
      title: "Escribe tu frase motivacional",
      sub: "Tu mantra personal aparecerá en la pestaña de Frases.",
      icon: QuoteIcon,
      accent: "from-amber-400 to-rose-500",
    },
  }[kind];

  const Icon = meta.icon;
  const finePointer = useFinePointer();

  return (
    <div className="vt-modal-overlay fixed inset-0 z-[80] flex items-end justify-center overflow-hidden sm:items-center sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="vt-modal-backdrop absolute inset-0 bg-[#05030a]/85 sm:backdrop-blur-md"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={meta.title}
        initial={finePointer ? { opacity: 0, y: 60, scale: 0.96 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={finePointer ? { opacity: 0, y: 40, scale: 0.97 } : { opacity: 0, y: 16 }}
        transition={{ duration: finePointer ? 0.4 : 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="vt-modal-sheet animated-border relative max-h-[100dvh] w-full min-w-0 max-w-3xl overflow-x-hidden overflow-y-auto rounded-t-[1.5rem] border border-white/15 bg-[#0a0713] shadow-[0_50px_120px_-35px_rgba(168,85,247,0.65)] sm:max-h-[92vh] sm:rounded-[2rem]"
      >
        <div className="sticky top-0 z-10 flex min-w-0 items-start justify-between gap-3 border-b border-white/10 bg-[#0a0713]/95 p-4 sm:gap-4 sm:p-7 sm:backdrop-blur">
          <div className="flex min-w-0 items-start gap-3.5">
            <span
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${meta.accent} shadow-lg`}
            >
              <Icon className="h-5 w-5 text-white" />
            </span>
            <div className="min-w-0">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold break-words text-white sm:text-2xl">
                {meta.title}
              </h2>
              <p className="mt-0.5 text-xs break-words text-slate-400 sm:text-sm">{meta.sub}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-slate-300 transition-all hover:scale-110 hover:border-rose-400 hover:text-rose-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-w-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-7">{children}</div>
      </motion.div>
    </div>
  );
}

function SubmitBar({
  busy,
  error,
  label,
  accent,
}: {
  busy: boolean;
  error: string | null;
  label: string;
  accent: string;
}) {
  return (
    <div className="mt-6 border-t border-white/10 pt-5">
      {error ? (
        <p className="mb-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-200">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className={`btn-glow flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${accent} py-4 text-sm font-extrabold text-white shadow-[0_18px_40px_-16px_rgba(168,85,247,0.9)] transition-transform hover:scale-[1.015] disabled:opacity-60`}
      >
        <Sparkles className="h-4 w-4" />
        {busy ? "Guardando…" : label}
      </button>
    </div>
  );
}

/* ----------------------------- ROUTINE ----------------------------- */

function RoutineForm({ onCreated }: { onCreated: Props["onCreated"] }) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [level, setLevel] = useState("Intermedio");
  const [durationMinutes, setDurationMinutes] = useState("35");
  const [caloriesBurned, setCaloriesBurned] = useState("300");
  const [equipment, setEquipment] = useState("Peso corporal");
  const [image, setImage] = useState(ROUTINE_IMAGES[0]);
  const [accent, setAccent] = useState(ROUTINE_ACCENTS[0]);
  const [exercises, setExercises] = useState<ExerciseDraft[]>([emptyExercise(), emptyExercise()]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateExercise(index: number, patch: Partial<ExerciseDraft>) {
    setExercises((prev) => prev.map((ex, i) => (i === index ? { ...ex, ...patch } : ex)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (title.trim().length < 3) {
      setError("Ponle un nombre a tu rutina (mínimo 3 letras).");
      return;
    }
    const valid = exercises.filter((ex) => ex.name.trim().length > 1);
    if (valid.length === 0) {
      setError("Añade al menos un ejercicio con nombre.");
      return;
    }
    setBusy(true);
    try {
      const res = await authFetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "routine",
          title,
          subtitle,
          level,
          durationMinutes: Number(durationMinutes),
          caloriesBurned: Number(caloriesBurned),
          equipment,
          image,
          accent,
          exercises: valid,
        }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        setError(json.error ?? "No pudimos guardar la rutina.");
        return;
      }
      await onCreated("routine");
    } catch {
      setError("Error de conexión.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelBase}>Nombre de la rutina</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Tren superior explosivo"
            className={inputBase}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelBase}>Descripción corta</label>
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Ej: Empuje y tracción en 35 minutos"
            className={inputBase}
          />
        </div>
        <div>
          <label className={labelBase}>Nivel</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className={`${inputBase} appearance-none`}
          >
            <option className="bg-[#0a0713]">Principiante</option>
            <option className="bg-[#0a0713]">Intermedio</option>
            <option className="bg-[#0a0713]">Avanzado</option>
          </select>
        </div>
        <div>
          <label className={labelBase}>Material</label>
          <input
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            placeholder="Mancuernas, barra…"
            className={inputBase}
          />
        </div>
        <div>
          <label className={labelBase}>Minutos</label>
          <input
            type="number"
            min={5}
            max={180}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            className={inputBase}
          />
        </div>
        <div>
          <label className={labelBase}>Calorías estimadas</label>
          <input
            type="number"
            min={0}
            max={2000}
            value={caloriesBurned}
            onChange={(e) => setCaloriesBurned(e.target.value)}
            className={inputBase}
          />
        </div>
      </div>

      <div className="mt-5">
        <label className={labelBase}>Portada</label>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {ROUTINE_IMAGES.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setImage(src)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                image === src ? "scale-105 border-fuchsia-400" : "border-white/10 hover:border-white/40"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
        <label className={labelBase}>Color</label>
        <div className="flex gap-2">
          {ROUTINE_ACCENTS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAccent(a)}
              aria-label="color"
              className={`h-8 w-14 rounded-lg bg-gradient-to-r ${a} transition-transform ${
                accent === a ? "scale-110 ring-2 ring-white/80" : "hover:scale-105"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-7">
        <div className="flex items-center justify-between">
          <label className={labelBase}>Ejercicios ({exercises.length})</label>
          <button
            type="button"
            onClick={() => setExercises((prev) => [...prev, emptyExercise()])}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:border-fuchsia-400/70"
          >
            <Plus className="h-3.5 w-3.5" /> Añadir ejercicio
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {exercises.map((ex, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-fuchsia-500/40 to-cyan-400/40 text-xs font-extrabold text-white">
                  {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setExercises((prev) => prev.filter((_, i) => i !== index))
                  }
                  aria-label="Quitar ejercicio"
                  className="text-slate-500 transition-colors hover:text-rose-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <input
                value={ex.name}
                onChange={(e) => updateExercise(index, { name: e.target.value })}
                placeholder="Nombre del ejercicio (ej: Sentadilla búlgara)"
                className={`${inputBase} mt-3`}
              />

              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={ex.sets}
                  onChange={(e) => updateExercise(index, { sets: e.target.value })}
                  placeholder="Series"
                  className={`${inputBase} px-2.5 py-2 text-xs`}
                />
                <input
                  value={ex.reps}
                  onChange={(e) => updateExercise(index, { reps: e.target.value })}
                  placeholder="Reps"
                  className={`${inputBase} px-2.5 py-2 text-xs`}
                />
                <input
                  type="number"
                  min={10}
                  max={300}
                  value={ex.restSeconds}
                  onChange={(e) => updateExercise(index, { restSeconds: e.target.value })}
                  placeholder="Descanso s"
                  className={`${inputBase} px-2.5 py-2 text-xs`}
                />
                <input
                  value={ex.muscle}
                  onChange={(e) => updateExercise(index, { muscle: e.target.value })}
                  placeholder="Músculo"
                  className={`${inputBase} px-2.5 py-2 text-xs`}
                />
              </div>

              <input
                value={ex.tip}
                onChange={(e) => updateExercise(index, { tip: e.target.value })}
                placeholder="Consejo de técnica (opcional)"
                className={`${inputBase} mt-2`}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <SubmitBar
        busy={busy}
        error={error}
        label="Guardar mi rutina"
        accent="from-fuchsia-500 via-violet-500 to-cyan-400"
      />
    </form>
  );
}

/* ------------------------------ RECIPE ----------------------------- */

function RecipeForm({ onCreated }: { onCreated: Props["onCreated"] }) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("proteina");
  const [prepMinutes, setPrepMinutes] = useState("15");
  const [calories, setCalories] = useState("450");
  const [protein, setProtein] = useState("35");
  const [carbs, setCarbs] = useState("30");
  const [fats, setFats] = useState("12");
  const [image, setImage] = useState(RECIPE_IMAGES[0]);
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (title.trim().length < 3) {
      setError("Ponle un nombre a tu receta.");
      return;
    }
    const ingList = ingredients.split("\n").map((s) => s.trim()).filter(Boolean);
    const stepList = steps.split("\n").map((s) => s.trim()).filter(Boolean);
    if (ingList.length === 0 || stepList.length === 0) {
      setError("Escribe al menos un ingrediente y un paso (uno por línea).");
      return;
    }
    setBusy(true);
    try {
      const res = await authFetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "recipe",
          title,
          subtitle,
          category,
          prepMinutes: Number(prepMinutes),
          calories: Number(calories),
          protein: Number(protein),
          carbs: Number(carbs),
          fats: Number(fats),
          image,
          accent: "from-lime-400 to-emerald-500",
          ingredients: ingList,
          steps: stepList,
        }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        setError(json.error ?? "No pudimos guardar la receta.");
        return;
      }
      await onCreated("recipe");
    } catch {
      setError("Error de conexión.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelBase}>Nombre de la receta</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Bowl de atún y aguacate"
            className={inputBase}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelBase}>Descripción corta</label>
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Ej: Cena rápida alta en proteína"
            className={inputBase}
          />
        </div>
        <div>
          <label className={labelBase}>Objetivo</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${inputBase} appearance-none`}
          >
            <option className="bg-[#0a0713]" value="proteina">Aumento Muscular</option>
            <option className="bg-[#0a0713]" value="definicion">Definición</option>
            <option className="bg-[#0a0713]" value="post-entreno">Post-Entreno</option>
            <option className="bg-[#0a0713]" value="energia">Energía</option>
          </select>
        </div>
        <div>
          <label className={labelBase}>Minutos de preparación</label>
          <input
            type="number"
            min={1}
            max={240}
            value={prepMinutes}
            onChange={(e) => setPrepMinutes(e.target.value)}
            className={inputBase}
          />
        </div>
        {[
          { label: "Calorías", value: calories, set: setCalories, icon: Flame },
          { label: "Proteína (g)", value: protein, set: setProtein },
          { label: "Carbos (g)", value: carbs, set: setCarbs },
          { label: "Grasas (g)", value: fats, set: setFats },
        ].map((field) => (
          <div key={field.label}>
            <label className={labelBase}>{field.label}</label>
            <input
              type="number"
              min={0}
              value={field.value}
              onChange={(e) => field.set(e.target.value)}
              className={inputBase}
            />
          </div>
        ))}
      </div>

      <div className="mt-5">
        <label className={labelBase}>Portada</label>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {RECIPE_IMAGES.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setImage(src)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                image === src ? "scale-105 border-lime-400" : "border-white/10 hover:border-white/40"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelBase}>Ingredientes (uno por línea)</label>
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            rows={7}
            placeholder={"200g de atún\n1 aguacate\nZumo de limón"}
            className={`${inputBase} resize-y leading-relaxed`}
          />
        </div>
        <div>
          <label className={labelBase}>Pasos (uno por línea)</label>
          <textarea
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            rows={7}
            placeholder={"Mezcla el atún con limón\nCorta el aguacate en dados\nSirve frío"}
            className={`${inputBase} resize-y leading-relaxed`}
          />
        </div>
      </div>

      <SubmitBar
        busy={busy}
        error={error}
        label="Guardar mi receta"
        accent="from-lime-400 via-emerald-400 to-cyan-400"
      />
    </form>
  );
}

/* ------------------------------ QUOTE ------------------------------ */

function QuoteForm({ onCreated }: { onCreated: Props["onCreated"] }) {
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("mindset");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (body.trim().length < 4) {
      setError("Escribe tu frase (mínimo 4 caracteres).");
      return;
    }
    setBusy(true);
    try {
      const res = await authFetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "quote", body, author, category }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        setError(json.error ?? "No pudimos guardar la frase.");
        return;
      }
      await onCreated("quote");
    } catch {
      setError("Error de conexión.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <label className={labelBase}>Tu frase motivacional</label>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder="Ej: Hoy entreno aunque no tenga ganas: así se construye la disciplina."
        className={`${inputBase} resize-y text-base leading-relaxed`}
      />
      <p className="mt-1.5 text-right text-[11px] text-slate-500">{body.length}/300</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelBase}>Autor / firma</label>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Mi mantra"
            className={inputBase}
          />
        </div>
        <div>
          <label className={labelBase}>Categoría</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${inputBase} appearance-none`}
          >
            <option className="bg-[#0a0713]" value="mindset">Mindset</option>
            <option className="bg-[#0a0713]" value="fitness">Fitness</option>
            <option className="bg-[#0a0713]" value="disciplina">Disciplina</option>
            <option className="bg-[#0a0713]" value="nutricion">Nutrición</option>
          </select>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-[10px] font-bold tracking-[0.25em] text-slate-500 uppercase">
          Vista previa
        </p>
        <p className="font-[family-name:var(--font-display)] mt-2 text-lg leading-snug font-bold text-white">
          “{body || "Tu frase aparecerá aquí…"}”
        </p>
        <p className="mt-2 text-xs font-bold text-cyan-300">{author || "Mi mantra"}</p>
      </div>

      <SubmitBar
        busy={busy}
        error={error}
        label="Guardar mi frase"
        accent="from-amber-400 via-rose-500 to-fuchsia-500"
      />
    </form>
  );
}
