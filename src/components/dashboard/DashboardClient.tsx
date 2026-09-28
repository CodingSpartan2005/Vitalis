"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  CalendarCheck,
  Check,
  CheckSquare,
  Clock,
  Dumbbell,
  Edit3,
  Flame,
  LogOut,
  Mail,
  Quote,
  Plus,
  Salad,
  Sparkles,
  Target,
  UserPlus,
  Zap,
} from "lucide-react";
import Nav, { type ActiveHubTab } from "@/components/Nav";
import Counter from "@/components/Counter";
import TiltCard from "@/components/TiltCard";
import HabitBoard from "@/components/dashboard/HabitBoard";
import Heatmap from "@/components/dashboard/Heatmap";
import QuoteWidget from "@/components/dashboard/QuoteWidget";
import RoutinesHub from "@/components/dashboard/RoutinesHub";
import RecipesHub from "@/components/dashboard/RecipesHub";
import InboxPanel from "@/components/dashboard/InboxPanel";
import ContentCreator, { type CreatorKind } from "@/components/dashboard/ContentCreator";
import { EMPTY_USER_CONTENT, type UserContent } from "@/lib/content-options";
import RoutineDetailModal from "@/components/modals/RoutineDetailModal";
import RecipeDetailModal from "@/components/modals/RecipeDetailModal";
import { authFetch, clearClientSession, getStoredToken, saveClientSession } from "@/lib/client-auth";
import { habitColor } from "@/lib/colors";
import { lastNDays, todayISO } from "@/lib/dates";
import {
  FITNESS_RECIPES,
  WORKOUT_ROUTINES,
  type FitnessRecipe,
  type WorkoutRoutine,
} from "@/lib/fitness-content";
import { computeTotals, levelFromXp, withStats, weekCountFor, xpFromTotals } from "@/lib/stats";
import type {
  DashboardData,
  HabitView,
  InboxMessageView,
  QuoteView,
  RecipeLogView,
  WorkoutLogView,
} from "@/lib/types";

type Props = {
  user: { id: number; name: string; email: string; avatar: string; goal: string };
  data: DashboardData;
  quotes: QuoteView[];
  initialTab?: ActiveHubTab;
};

const TABS: {
  id: ActiveHubTab;
  label: string;
  sub: string;
  icon: typeof Sparkles;
  accent: string;
}[] = [
  {
    id: "overview",
    label: "Mi Perfil & Inicio",
    sub: "Resumen hoy",
    icon: Sparkles,
    accent: "from-fuchsia-500 to-violet-600",
  },
  {
    id: "tracker",
    label: "Habit Tracker",
    sub: "Mis hábitos",
    icon: CheckSquare,
    accent: "from-violet-500 to-cyan-400",
  },
  {
    id: "routines",
    label: "Rutinas Fitness",
    sub: "Instrucciones +50 XP",
    icon: Dumbbell,
    accent: "from-cyan-400 to-blue-600",
  },
  {
    id: "recipes",
    label: "Recetas Fitness",
    sub: "Instrucciones +15 XP",
    icon: Salad,
    accent: "from-lime-400 to-emerald-500",
  },
  {
    id: "quotes",
    label: "Frases & Mindset",
    sub: "Motivación",
    icon: Quote,
    accent: "from-amber-400 to-rose-500",
  },
  {
    id: "inbox",
    label: "Buzón Correo",
    sub: "Plan & Código",
    icon: Mail,
    accent: "from-rose-500 to-fuchsia-500",
  },
];

export default function DashboardClient({
  user: initialUser,
  data,
  quotes,
  initialTab = "overview",
}: Props) {
  const [profile, setProfile] = useState(initialUser);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState(initialUser.name);
  const [editGoal, setEditGoal] = useState(initialUser.goal);
  const [activeTab, setActiveTab] = useState<ActiveHubTab>(initialTab);
  const [habits, setHabits] = useState<HabitView[]>(data.habits);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogView[]>(data.workoutLogs ?? []);
  const [recipeLogs, setRecipeLogs] = useState<RecipeLogView[]>(data.recipeLogs ?? []);
  const [savedRoutineIds, setSavedRoutineIds] = useState<string[]>(data.savedRoutineIds ?? []);
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>(data.savedRecipeIds ?? []);
  const [inboxMessages, setInboxMessages] = useState<InboxMessageView[]>(data.inboxMessages ?? []);
  const [modalRoutine, setModalRoutine] = useState<WorkoutRoutine | null>(null);
  const [modalRecipe, setModalRecipe] = useState<FitnessRecipe | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [userContent, setUserContent] = useState<UserContent>(
    data.userContent ?? EMPTY_USER_CONTENT,
  );
  const [creatorKind, setCreatorKind] = useState<CreatorKind>(null);

  const allQuotes = useMemo<QuoteView[]>(
    () => [
      ...userContent.quotes.map((q) => ({
        id: -q.id,
        body: q.body,
        author: q.author,
        category: q.category,
        userOwned: true,
        dbId: q.id,
      })),
      ...quotes,
    ],
    [userContent.quotes, quotes],
  );

  const today = todayISO();
  const week = data.week;
  const windowDays = useMemo(() => lastNDays(91), []);

  const { totals, perDay } = useMemo(
    () => computeTotals(habits, week, windowDays),
    [habits, week, windowDays],
  );
  const extraXp = workoutLogs.length * 50 + recipeLogs.length * 15;
  const level = levelFromXp(xpFromTotals(totals) + extraXp);
  const heatmap = windowDays.map((day) => ({
    day,
    count: perDay.get(day) ?? 0,
    total: habits.length || 1,
  }));

  const doneToday = habits.filter((habit) => habit.logs.includes(today)).length;
  const todayRatio = habits.length > 0 ? doneToday / habits.length : 0;
  const perfectToday = habits.length > 0 && doneToday === habits.length;
  const unreadEmails = inboxMessages.filter((m) => !m.isRead).length;

  const dayIndex = Math.floor(Date.now() / 86_400_000);
  const quoteOfTheDay = allQuotes.length > 0 ? allQuotes[dayIndex % allQuotes.length] : null;

  async function refreshUserContent(message?: string) {
    try {
      const res = await authFetch("/api/content");
      if (res.ok) {
        const json = (await res.json()) as UserContent;
        setUserContent(json);
      }
      if (message) {
        flash(message);
      }
    } catch {
      if (message) flash(message);
    } finally {
      setCreatorKind(null);
    }
  }

  async function handleDeleteUserRoutine(routine: WorkoutRoutine) {
    if (!routine.dbId) return;
    const snapshot = userContent.routines;
    setUserContent((prev) => ({
      ...prev,
      routines: prev.routines.filter((r) => r.dbId !== routine.dbId),
    }));
    flash(`Rutina "${routine.title}" eliminada.`);
    try {
      await authFetch(`/api/content?kind=routine&id=${routine.dbId}`, { method: "DELETE" });
    } catch {
      setUserContent((prev) => ({ ...prev, routines: snapshot }));
    }
  }

  async function handleDeleteUserRecipe(recipe: FitnessRecipe) {
    if (!recipe.dbId) return;
    const snapshot = userContent.recipes;
    setUserContent((prev) => ({
      ...prev,
      recipes: prev.recipes.filter((r) => r.dbId !== recipe.dbId),
    }));
    flash(`Receta "${recipe.title}" eliminada.`);
    try {
      await authFetch(`/api/content?kind=recipe&id=${recipe.dbId}`, { method: "DELETE" });
    } catch {
      setUserContent((prev) => ({ ...prev, recipes: snapshot }));
    }
  }

  async function handleDeleteUserQuote(dbId: number) {
    const snapshot = userContent.quotes;
    setUserContent((prev) => ({
      ...prev,
      quotes: prev.quotes.filter((q) => q.id !== dbId),
    }));
    flash("Frase eliminada.");
    try {
      await authFetch(`/api/content?kind=quote&id=${dbId}`, { method: "DELETE" });
    } catch {
      setUserContent((prev) => ({ ...prev, quotes: snapshot }));
    }
  }

  function flash(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2800);
  }

  async function saveProfileChanges(e: React.FormEvent) {
    e.preventDefault();
    const res = await authFetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, goal: editGoal }),
    });
    if (res.ok) {
      const json = (await res.json()) as { user: typeof profile };
      setProfile(json.user);
      const token = getStoredToken();
      if (token) saveClientSession(token, json.user);
      setEditingProfile(false);
      flash("✨ Perfil personal actualizado.");
    }
  }

  async function handleToggle(habitId: number, day: string) {
    let becameDone = false;
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) return habit;
        const has = habit.logs.includes(day);
        becameDone = !has;
        const logs = has ? habit.logs.filter((d) => d !== day) : [...habit.logs, day];
        return withStats({ ...habit, logs });
      }),
    );

    try {
      const response = await authFetch(`/api/habits/${habitId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day }),
      });
      if (!response.ok) throw new Error("failed");
      if (becameDone) {
        const habit = habits.find((h) => h.id === habitId);
        const allDone = habits.every(
          (h) => h.id === habitId || h.logs.includes(day),
        );
        const streak = (habit?.streak ?? 0) + 1;
        flash(streak > 1 ? `🔥 Racha de ${streak} días · +10 XP` : "✅ ¡Hábito completado! +10 XP");
      }
    } catch {
      setHabits((prev) =>
        prev.map((habit) => {
          if (habit.id !== habitId) return habit;
          const has = habit.logs.includes(day);
          const logs = has ? habit.logs.filter((d) => d !== day) : [...habit.logs, day];
          return withStats({ ...habit, logs });
        }),
      );
      flash("No pudimos guardar ese check.");
    }
  }

  async function handleDelete(habitId: number) {
    const snapshot = habits;
    setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
    try {
      await authFetch(`/api/habits?id=${habitId}`, { method: "DELETE" });
      flash("Hábito eliminado de tu perfil.");
    } catch {
      setHabits(snapshot);
      flash("No pudimos eliminar el hábito.");
    }
  }

  async function handleCreated(habit: { id: number; title: string; icon: string; color: string }) {
    setHabits((prev) => [
      ...prev,
      withStats({ ...habit, logs: [], weekCount: 0, total: 0, streak: 0, best: 0 }),
    ]);
    flash("✨ Hábito añadido a tu perfil personal.");
  }

  async function handleToggleSaveRoutine(routineId: string) {
    const wasSaved = savedRoutineIds.includes(routineId);
    setSavedRoutineIds((prev) =>
      wasSaved ? prev.filter((id) => id !== routineId) : [...prev, routineId],
    );
    await authFetch("/api/routines/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routineId }),
    });
    flash(wasSaved ? "Rutina quitada de tus guardadas." : "⭐ Rutina guardada en tu perfil.");
  }

  async function handleToggleSaveRecipe(recipeId: string) {
    const wasSaved = savedRecipeIds.includes(recipeId);
    setSavedRecipeIds((prev) =>
      wasSaved ? prev.filter((id) => id !== recipeId) : [...prev, recipeId],
    );
    await authFetch("/api/recipes/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipeId }),
    });
    flash(wasSaved ? "Receta quitada de tus guardadas." : "⭐ Receta guardada en tu perfil.");
  }

  async function handleCompleteRoutine(routine: WorkoutRoutine) {
    const response = await authFetch("/api/workouts/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        routineId: routine.id,
        routineTitle: routine.title,
        durationMinutes: routine.durationMinutes,
        caloriesBurned: routine.caloriesBurned,
      }),
    });
    if (!response.ok) {
      flash("No se pudo registrar la rutina.");
      return;
    }
    const json = (await response.json()) as {
      workoutLog: WorkoutLogView;
      markedHabitId: number | null;
      day: string;
    };
    setWorkoutLogs((prev) => [json.workoutLog, ...prev]);
    if (json.markedHabitId) {
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id !== json.markedHabitId || h.logs.includes(json.day)) return h;
          return withStats({ ...h, logs: [...h.logs, json.day] });
        }),
      );
    }
    flash(`🏋️ ¡Rutina "${routine.title}" completada! +50 XP`);
  }

  async function handleCompleteRecipe(recipe: FitnessRecipe) {
    const response = await authFetch("/api/recipes/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        calories: recipe.calories,
        proteinGrams: recipe.protein,
      }),
    });
    if (!response.ok) {
      flash("No se pudo registrar la receta.");
      return;
    }
    const json = (await response.json()) as {
      recipeLog: RecipeLogView;
      markedHabitId: number | null;
      day: string;
    };
    setRecipeLogs((prev) => [json.recipeLog, ...prev]);
    if (json.markedHabitId) {
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id !== json.markedHabitId || h.logs.includes(json.day)) return h;
          return withStats({ ...h, logs: [...h.logs, json.day] });
        }),
      );
    }
    flash(`🥗 ¡Comida saludable registrada (+${recipe.protein}g proteína)! +15 XP`);
  }

  async function handleMarkEmailRead(id: number) {
    setInboxMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
    await authFetch("/api/inbox", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read", messageId: id }),
    });
  }

  async function handleResendEmail() {
    const response = await authFetch("/api/inbox", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resend" }),
    });
    if (response.ok) {
      const json = (await response.json()) as { message?: InboxMessageView };
      if (json.message) {
        setInboxMessages((prev) => [json.message!, ...prev]);
        flash("📬 Nuevo correo de bienvenida enviado a tu Buzón VITALIS.");
      }
    }
  }

  const userSavedRoutineObjects = WORKOUT_ROUTINES.filter((r) =>
    savedRoutineIds.includes(r.id),
  );
  const userSavedRecipeObjects = FITNESS_RECIPES.filter((r) =>
    savedRecipeIds.includes(r.id),
  );

  const stats = [
    {
      icon: CalendarCheck,
      label: "Hábitos cumplidos",
      value: totals.completions,
      suffix: "",
      accent: "text-cyan-300",
    },
    {
      icon: Flame,
      label: "Mejor racha",
      value: totals.bestStreak,
      suffix: " d",
      accent: "text-orange-300",
    },
    {
      icon: Dumbbell,
      label: "Rutinas hechas",
      value: workoutLogs.length,
      suffix: "",
      accent: "text-fuchsia-300",
    },
    {
      icon: Salad,
      label: "Comidas fitness",
      value: recipeLogs.length,
      suffix: "",
      accent: "text-lime-300",
    },
  ];

  const circumference = 2 * Math.PI * 54;

  return (
    <div className="relative min-h-screen">
      <Nav
        user={{ name: profile.name, avatar: profile.avatar }}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        unreadEmails={unreadEmails}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem]">
        <div className="absolute inset-0 grid-lines" />
        <div className="animate-blob absolute -top-24 left-1/4 h-[28rem] w-[28rem] rounded-full bg-fuchsia-600/25 blur-[130px]" />
        <div className="animate-blob absolute -top-10 right-1/4 h-[24rem] w-[24rem] rounded-full bg-cyan-500/20 blur-[120px] [animation-delay:-6s]" />
      </div>

      <main className="mx-auto max-w-7xl px-6 pt-28 pb-20">
        {/* Welcome / Unread Email Banner */}
        {profile.email === "demo@vitalis.app" ? (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-5 py-3.5">
            <p className="text-sm font-bold text-amber-100">
              Estás dentro de la cuenta de ejemplo (Atleta Demo), no en tu usuario.
            </p>
            <a
              href="/entrar"
              className="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-slate-950"
            >
              Entrar con mi cuenta
            </a>
          </div>
        ) : null}

        {unreadEmails > 0 && activeTab !== "inbox" ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/15 via-fuchsia-500/15 to-lime-400/15 px-5 py-3.5"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-400 text-slate-950">
                <Mail className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-extrabold text-white">
                  📬 Tienes {unreadEmails} correo nuevo para {profile.email} (Código #{inboxMessages[0]?.verificationCode})
                </p>
                <p className="text-[11px] text-slate-300">
                  Revisa tu correo de bienvenida y tu Plan Inicial Fitness personalizado.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("inbox")}
              className="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-slate-950 transition-transform hover:scale-105"
            >
              Abrir mi correo →
            </button>
          </motion.div>
        ) : null}

        {/* Hero User Personal Profile Header */}
        <section className="glass noise relative overflow-hidden rounded-[2rem] p-7 sm:p-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <div className="flex items-start gap-5">
              <span className="relative grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 text-3xl shadow-lg shadow-fuchsia-500/40">
                {profile.avatar}
                <span className="absolute -right-1 -bottom-1 rounded-lg bg-[#05030a] px-1.5 py-0.5 text-[10px] font-bold text-cyan-300">
                  Nv.{level.level}
                </span>
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-fuchsia-400/40 bg-fuchsia-500/15 px-3 py-0.5 text-[10px] font-extrabold tracking-widest text-fuchsia-300 uppercase">
                    Perfil Personal · {profile.email}
                  </span>
                  <span className="text-[11px] font-bold text-cyan-300 uppercase">
                    · Rango: {level.title}
                  </span>
                </div>

                {editingProfile ? (
                  <form onSubmit={saveProfileChanges} className="mt-3 flex flex-wrap items-center gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Tu nombre"
                      className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-bold text-white outline-none"
                    />
                    <input
                      value={editGoal}
                      onChange={(e) => setEditGoal(e.target.value)}
                      placeholder="Tu objetivo"
                      className="w-64 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-lime-400 px-3.5 py-1.5 text-xs font-extrabold text-slate-950"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingProfile(false)}
                      className="rounded-xl border border-white/15 px-3 py-1.5 text-xs text-slate-300"
                    >
                      Cancelar
                    </button>
                  </form>
                ) : (
                  <>
                    <h1 className="font-[family-name:var(--font-display)] mt-1.5 text-3xl leading-tight font-extrabold sm:text-4xl">
                      Panel de {profile.name} 🔥
                    </h1>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-300">
                      <Target className="h-4 w-4 text-cyan-300" />
                      <span>Meta: {profile.goal}</span>
                      <button
                        type="button"
                        onClick={() => setEditingProfile(true)}
                        className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300 hover:border-cyan-300"
                      >
                        <Edit3 className="h-3 w-3" /> Editar perfil
                      </button>
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="relative grid h-28 w-28 place-items-center">
                <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="9"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="url(#dashGradient)"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - todayRatio)}
                    style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)" }}
                  />
                  <defs>
                    <linearGradient id="dashGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="50%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#a3e635" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="text-center">
                  <p className="font-[family-name:var(--font-display)] text-xl font-extrabold">
                    {doneToday}/{habits.length}
                  </p>
                  <p className="text-[9px] tracking-widest text-slate-400 uppercase">hoy</p>
                </div>
              </div>

              <div className="w-56">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-lime-300" /> Experiencia (XP)
                  </span>
                  <span className="font-bold text-white">
                    {level.xp}/{level.xpForNext}
                  </span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-lime-400"
                    animate={{ width: `${level.progress}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400">
                  {Math.max(0, level.xpForNext - level.xp)} XP para nivel {level.level + 1}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      clearClientSession();
                      await authFetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
                      window.location.href = "/registro";
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-300 hover:underline"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Cambiar/Crear usuario
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      clearClientSession();
                      await authFetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
                      window.location.href = "/";
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 transition-colors hover:text-rose-300"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Salir
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Activity Dock (6 Main Modules) */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex flex-col items-start justify-between overflow-hidden rounded-2xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-white/40 bg-white/[0.11] shadow-[0_20px_45px_-18px_rgba(168,85,247,0.7)] scale-[1.02]"
                      : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${tab.accent} text-white shadow-md`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    {tab.id === "inbox" && unreadEmails > 0 ? (
                      <span className="rounded-full bg-lime-400 px-2 py-0.5 text-[10px] font-extrabold text-slate-950">
                        {unreadEmails} nuevo
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3">
                    <p className="font-[family-name:var(--font-display)] text-sm font-extrabold text-white">
                      {tab.label}
                    </p>
                    <p className="text-[11px] text-slate-400">{tab.sub}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {perfectToday ? (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="animated-border relative mt-6 flex items-center gap-4 overflow-hidden rounded-2xl border border-lime-400/25 bg-gradient-to-r from-lime-400/10 via-emerald-400/5 to-transparent px-5 py-4"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-lime-400/25 to-emerald-400/15 text-xl">
                  🏆
                </span>
                <div>
                  <p className="font-[family-name:var(--font-display)] text-sm font-extrabold text-lime-200">
                    Día perfecto — cerraste todos tus hábitos de hoy.
                  </p>
                  <p className="text-xs text-lime-300/70">
                    Recuperación, cena alta en proteína y a por mañana. +25 XP extra.
                  </p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>

        {/* Stats Row */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="sweep-on-hover glass hover-lift group rounded-3xl p-5 sm:p-6"
            >
              <stat.icon className={`h-5 w-5 ${stat.accent}`} />
              <p className="font-[family-name:var(--font-display)] mt-3 text-4xl font-extrabold">
                <Counter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-1 text-xs tracking-wide text-slate-400">{stat.label}</p>
            </motion.div>
          ))}
        </section>

        {/* Quick create dock */}
        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            {
              label: "Crear mi rutina",
              desc: "Ejercicios, series y descansos",
              icon: Dumbbell,
              accent: "from-fuchsia-500 to-cyan-400",
              action: () => setCreatorKind("routine"),
            },
            {
              label: "Crear mi receta",
              desc: "Ingredientes, pasos y macros",
              icon: Salad,
              accent: "from-lime-400 to-emerald-500",
              action: () => setCreatorKind("recipe"),
            },
            {
              label: "Escribir mi frase",
              desc: "Tu mantra personal",
              icon: Sparkles,
              accent: "from-amber-400 to-rose-500",
              action: () => setCreatorKind("quote"),
            },
          ].map((item) => (
            <motion.button
              key={item.label}
              type="button"
              onClick={item.action}
              whileHover={{ scale: 1.02, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="sweep-on-hover glass group flex items-center gap-3.5 rounded-2xl p-4 text-left transition-colors hover:border-white/25"
            >
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${item.accent} shadow-lg`}
              >
                <item.icon className="h-5 w-5 text-white" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-extrabold text-white">
                  {item.label}
                </span>
                <span className="block truncate text-[11px] text-slate-400">{item.desc}</span>
              </span>
              <Plus className="ml-auto h-4 w-4 shrink-0 text-slate-500 transition-colors group-hover:text-white" />
            </motion.button>
          ))}
        </section>

        {/* TAB CONTENT */}
        <div className="mt-8">
          {activeTab === "overview" ? (
            <div className="space-y-8">
              {/* Row 1: Quick Today Habits + Daily Quote */}
              <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
                <section className="glass noise relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold tracking-[0.25em] text-fuchsia-400 uppercase">
                        Mis Hábitos Personales · Hoy ({doneToday}/{habits.length})
                      </p>
                      <h2 className="font-[family-name:var(--font-display)] mt-1 text-2xl font-extrabold">
                        Hábitos de {profile.name.split(" ")[0]}
                      </h2>
                      <p className="mt-1 text-xs text-slate-400">
                        Toca cada hábito para completarlo hoy o añade los tuyos propios abajo.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("tracker")}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-cyan-300 hover:border-cyan-300/60"
                    >
                      Gestionar / Crear hábitos <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {habits.map((habit) => {
                      const isDone = habit.logs.includes(today);
                      const palette = habitColor(habit.color);
                      return (
                        <button
                          key={habit.id}
                          type="button"
                          onClick={() => handleToggle(habit.id, today)}
                          className={`group flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                            isDone
                              ? "border-lime-400/50 bg-lime-400/10 shadow-lg shadow-lime-400/10"
                              : "border-white/10 bg-white/[0.03] hover:border-white/30"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl"
                              style={{
                                background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
                              }}
                            >
                              {habit.icon}
                            </span>
                            <div>
                              <p className="text-sm font-bold text-white">{habit.title}</p>
                              <p className="text-[11px] text-slate-400">
                                🔥 Racha {habit.streak} d · {isDone ? "¡Completado hoy!" : "Toca para completar"}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-all ${
                              isDone
                                ? "border-lime-400 bg-lime-400 text-slate-950"
                                : "border-white/15 bg-white/5 text-slate-400 group-hover:border-white/40"
                            }`}
                          >
                            <Check className="h-4 w-4" strokeWidth={3} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {quoteOfTheDay ? (
                  <QuoteWidget
                    quotes={allQuotes}
                    quoteOfTheDay={quoteOfTheDay}
                    authed
                    onCreateQuote={() => setCreatorKind("quote")}
                    onDeleteUserQuote={handleDeleteUserQuote}
                  />
                ) : null}
              </div>

              {/* Saved items in user's personal profile */}
              {userSavedRoutineObjects.length > 0 || userSavedRecipeObjects.length > 0 ? (
                <section className="glass rounded-[2rem] p-6 sm:p-8">
                  <p className="text-[11px] font-bold tracking-[0.25em] text-amber-300 uppercase">
                    ⭐ Tu Colección Personal Guardada
                  </p>
                  <h3 className="font-[family-name:var(--font-display)] mt-1 text-2xl font-extrabold">
                    Mis Rutinas y Recetas Guardadas
                  </h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {userSavedRoutineObjects.map((routine) => (
                      <div
                        key={routine.id}
                        onClick={() => setModalRoutine(routine)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") setModalRoutine(routine);
                        }}
                        className="cursor-pointer rounded-2xl border border-cyan-400/35 bg-cyan-400/10 p-4 transition-all hover:scale-[1.02]"
                      >
                        <span className="text-[10px] font-extrabold text-cyan-300 uppercase">
                          🏋️ Rutina guardada
                        </span>
                        <p className="mt-1 font-bold text-white">{routine.title}</p>
                        <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-cyan-200">
                          <BookOpen className="h-3.5 w-3.5" /> Abrir instrucciones →
                        </p>
                      </div>
                    ))}
                    {userSavedRecipeObjects.map((recipe) => (
                      <div
                        key={recipe.id}
                        onClick={() => setModalRecipe(recipe)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") setModalRecipe(recipe);
                        }}
                        className="cursor-pointer rounded-2xl border border-lime-400/35 bg-lime-400/10 p-4 transition-all hover:scale-[1.02]"
                      >
                        <span className="text-[10px] font-extrabold text-lime-300 uppercase">
                          🥗 Receta guardada
                        </span>
                        <p className="mt-1 font-bold text-white">{recipe.title}</p>
                        <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-lime-200">
                          <BookOpen className="h-3.5 w-3.5" /> Abrir instrucciones →
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {/* Row 2: Featured Workout Routine + Featured Fitness Recipe Preview (Clicking opens instructions modal directly!) */}
              <div className="grid gap-6 lg:grid-cols-2">
                <section className="glass relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold tracking-[0.25em] text-cyan-400 uppercase">
                        Haz clic para ver instrucciones paso a paso
                      </p>
                      <h3 className="font-[family-name:var(--font-display)] mt-1 text-2xl font-extrabold">
                        Rutinas Fitness
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("routines")}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-xs font-extrabold text-slate-950"
                    >
                      Ver las {WORKOUT_ROUTINES.length} rutinas <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {WORKOUT_ROUTINES.slice(0, 2).map((routine) => {
                      const isSaved = savedRoutineIds.includes(routine.id);
                      return (
                        <TiltCard key={routine.id} className="rounded-2xl" intensity={7}>
                          <div
                            onClick={() => setModalRoutine(routine)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") setModalRoutine(routine);
                            }}
                            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all hover:border-cyan-400/60"
                          >
                            <div className="relative h-36 overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={routine.image}
                                alt={routine.title}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#07050d] via-transparent to-transparent" />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleSaveRoutine(routine.id);
                                }}
                                className={`absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                                  isSaved
                                    ? "border-amber-400 bg-amber-400 text-slate-950"
                                    : "border-white/25 bg-black/65 text-white"
                                }`}
                              >
                                <Bookmark className="h-3 w-3" fill={isSaved ? "currentColor" : "none"} />
                                {isSaved ? "Guardada" : "Guardar"}
                              </button>
                              <span className="absolute bottom-2 left-3 flex items-center gap-2 text-[11px] font-bold text-cyan-300">
                                <Clock className="h-3.5 w-3.5" /> {routine.durationMinutes} min · {routine.caloriesBurned} kcal
                              </span>
                            </div>
                            <div className="p-4">
                              <p className="font-[family-name:var(--font-display)] text-sm font-bold text-white">
                                {routine.title}
                              </p>
                              <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-cyan-400/15 px-2.5 py-1 text-xs font-extrabold text-cyan-300 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-colors">
                                <BookOpen className="h-3.5 w-3.5" />
                                Ver instrucciones de rutina
                              </p>
                            </div>
                          </div>
                        </TiltCard>
                      );
                    })}
                  </div>
                </section>

                <section className="glass relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold tracking-[0.25em] text-lime-400 uppercase">
                        Haz clic para ver ingredientes y pasos
                      </p>
                      <h3 className="font-[family-name:var(--font-display)] mt-1 text-2xl font-extrabold">
                        Recetas Fitness
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("recipes")}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-lime-400 to-emerald-400 px-4 py-2 text-xs font-extrabold text-slate-950"
                    >
                      Ver todas las recetas <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {FITNESS_RECIPES.slice(0, 2).map((recipe) => {
                      const isSaved = savedRecipeIds.includes(recipe.id);
                      return (
                        <TiltCard key={recipe.id} className="rounded-2xl" intensity={7}>
                          <div
                            onClick={() => setModalRecipe(recipe)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") setModalRecipe(recipe);
                            }}
                            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all hover:border-lime-400/60"
                          >
                            <div className="relative h-36 overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={recipe.image}
                                alt={recipe.title}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#07050d] via-transparent to-transparent" />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleSaveRecipe(recipe.id);
                                }}
                                className={`absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                                  isSaved
                                    ? "border-amber-400 bg-amber-400 text-slate-950"
                                    : "border-white/25 bg-black/65 text-white"
                                }`}
                              >
                                <Bookmark className="h-3 w-3" fill={isSaved ? "currentColor" : "none"} />
                                {isSaved ? "Guardada" : "Guardar"}
                              </button>
                              <span className="absolute bottom-2 left-3 text-[11px] font-bold text-lime-300">
                                {recipe.protein}g Proteína · {recipe.calories} kcal
                              </span>
                            </div>
                            <div className="p-4">
                              <p className="font-[family-name:var(--font-display)] text-sm font-bold text-white">
                                {recipe.title}
                              </p>
                              <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-lime-400/15 px-2.5 py-1 text-xs font-extrabold text-lime-300 group-hover:bg-lime-400 group-hover:text-slate-950 transition-colors">
                                <BookOpen className="h-3.5 w-3.5" />
                                Ver instrucciones de receta
                              </p>
                            </div>
                          </div>
                        </TiltCard>
                      );
                    })}
                  </div>
                </section>
              </div>

              {/* Row 3: Full Weekly Habit Board + Heatmap */}
              <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
                <HabitBoard
                  habits={habits}
                  week={week}
                  today={today}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onCreated={handleCreated}
                />
                <Heatmap cells={heatmap} />
              </div>
            </div>
          ) : null}

          {activeTab === "tracker" ? (
            <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
              <div className="space-y-6">
                <HabitBoard
                  habits={habits}
                  week={week}
                  today={today}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onCreated={handleCreated}
                />
                <Heatmap cells={heatmap} />
              </div>
              <div className="space-y-6">
                <section className="glass relative overflow-hidden rounded-[2rem] p-6">
                  <p className="text-[11px] font-bold tracking-[0.25em] text-slate-400 uppercase">
                    Rendimiento semanal
                  </p>
                  <p className="font-[family-name:var(--font-display)] mt-2 text-3xl font-extrabold">
                    {totals.weekCompletions}
                    <span className="text-lg text-slate-500">/{totals.weekGoal} checks</span>
                  </p>
                  <div className="mt-4 space-y-3">
                    {habits.map((habit) => {
                      const count = weekCountFor(habit.logs, week);
                      const ratio = Math.round((count / 7) * 100);
                      return (
                        <div key={habit.id}>
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="truncate pr-2">
                              {habit.icon} {habit.title}
                            </span>
                            <span className="font-bold text-white">{ratio}%</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400"
                              initial={{ width: 0 }}
                              animate={{ width: `${ratio}%` }}
                              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
                {quoteOfTheDay ? (
                  <QuoteWidget
                    quotes={allQuotes}
                    quoteOfTheDay={quoteOfTheDay}
                    authed
                    onCreateQuote={() => setCreatorKind("quote")}
                    onDeleteUserQuote={handleDeleteUserQuote}
                  />
                ) : null}
              </div>
            </div>
          ) : null}

          {activeTab === "routines" ? (
            <RoutinesHub
              workoutLogs={workoutLogs}
              savedRoutineIds={savedRoutineIds}
              onToggleSaveRoutine={handleToggleSaveRoutine}
              onCompleteRoutine={handleCompleteRoutine}
              userRoutines={userContent.routines}
              onCreate={() => setCreatorKind("routine")}
              onDeleteUserRoutine={handleDeleteUserRoutine}
            />
          ) : null}

          {activeTab === "recipes" ? (
            <RecipesHub
              recipeLogs={recipeLogs}
              savedRecipeIds={savedRecipeIds}
              onToggleSaveRecipe={handleToggleSaveRecipe}
              onCompleteRecipe={handleCompleteRecipe}
              userRecipes={userContent.recipes}
              onCreate={() => setCreatorKind("recipe")}
              onDeleteUserRecipe={handleDeleteUserRecipe}
            />
          ) : null}

          {activeTab === "quotes" ? (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              {quoteOfTheDay ? (
                <QuoteWidget
                    quotes={allQuotes}
                    quoteOfTheDay={quoteOfTheDay}
                    authed
                    onCreateQuote={() => setCreatorKind("quote")}
                    onDeleteUserQuote={handleDeleteUserQuote}
                  />
              ) : null}
              <section className="glass rounded-[2rem] p-6 sm:p-8">
                <p className="text-[11px] font-bold tracking-[0.25em] text-fuchsia-400 uppercase">
                  Biblioteca Mindset ({allQuotes.length} frases)
                </p>
                <h3 className="font-[family-name:var(--font-display)] mt-1 text-2xl font-extrabold">
                  Todas las frases para tu disciplina
                </h3>
                <div className="mt-5 max-h-[34rem] space-y-3 overflow-y-auto pr-2">
                  {quotes.map((q) => (
                    <div
                      key={q.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <p className="text-sm font-medium text-white">“{q.body}”</p>
                      <p className="mt-2 text-[10px] font-bold tracking-[0.2em] text-cyan-300 uppercase">
                        {q.author} · {q.category}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : null}

          {activeTab === "inbox" ? (
            <InboxPanel
              messages={inboxMessages}
              userEmail={profile.email}
              onMarkRead={handleMarkEmailRead}
              onResend={handleResendEmail}
            />
          ) : null}
        </div>
      </main>

      {/* Modals for clicking routines or recipes directly from Overview */}
      <RoutineDetailModal
        routine={modalRoutine}
        onClose={() => setModalRoutine(null)}
        isSaved={modalRoutine ? savedRoutineIds.includes(modalRoutine.id) : false}
        onToggleSave={handleToggleSaveRoutine}
        onCompleteRoutine={handleCompleteRoutine}
      />

      <RecipeDetailModal
        recipe={modalRecipe}
        onClose={() => setModalRecipe(null)}
        isSaved={modalRecipe ? savedRecipeIds.includes(modalRecipe.id) : false}
        onToggleSave={handleToggleSaveRecipe}
        onCompleteRecipe={handleCompleteRecipe}
      />

      <ContentCreator
        kind={creatorKind}
        onClose={() => setCreatorKind(null)}
        onCreated={async (kind) => {
          const msg =
            kind === "routine"
              ? "🔥 ¡Rutina creada y guardada en tu cuenta!"
              : kind === "recipe"
                ? "🥗 ¡Receta creada y guardada en tu recetario!"
                : "✨ ¡Frase guardada en tu biblioteca personal!";
          await refreshUserContent(msg);
        }}
      />

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bottom-safe fixed right-4 left-4 z-50 rounded-2xl border border-cyan-400/40 sm:left-auto sm:right-6 bg-[#0b0813]/95 px-5 py-4 text-sm font-bold text-white shadow-2xl backdrop-blur"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
