"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Dumbbell,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Plus,
  Salad,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { clearClientSession, saveClientSession, sessionHomeUrl, type ClientUser } from "@/lib/client-auth";
import { IMAGES } from "@/lib/images";

const AVATARS = ["🔥", "⚡", "🥊", "🐺", "🦅", "🧘", "🏋️", "🌟"];

const SUGGESTED_HABITS = [
  { title: "Entrenar mi rutina 45 min", icon: "🏋️", color: "violet" },
  { title: "Beber 3L de agua", icon: "💧", color: "cyan" },
  { title: "Comer alto en proteína", icon: "🥗", color: "lime" },
  { title: "Dormir 8 horas", icon: "😴", color: "amber" },
  { title: "10.000 pasos diarios", icon: "🏃", color: "rose" },
  { title: "Meditar / Respirar 10 min", icon: "🧘", color: "cyan" },
];

const ROTATING_QUOTES = [
  "El dolor de la disciplina es momentáneo. El del arrepentimiento, eterno.",
  "Nadie llega lejos dejando de intentarlo cada día.",
  "Tu récord de mañana empieza con la serie de hoy.",
  "La motivación te arranca, el hábito te mantiene.",
];

type WelcomeEmailData = {
  id: number;
  subject: string;
  sender: string;
  verificationCode: string;
  body: string;
};

type Props = { mode: "login" | "register" };

export default function AuthForm({ mode }: Props) {
  const isRegister = mode === "register";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [goal, setGoal] = useState("");
  const [avatar, setAvatar] = useState("🔥");
  const [selectedHabits, setSelectedHabits] = useState<
    { title: string; icon: string; color: string }[]
  >([SUGGESTED_HABITS[0], SUGGESTED_HABITS[1], SUGGESTED_HABITS[2]]);
  const [customHabitTitle, setCustomHabitTitle] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [welcomeEmail, setWelcomeEmail] = useState<WelcomeEmailData | null>(null);
  const [registeredUser, setRegisteredUser] = useState<ClientUser | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setQuoteIndex((i) => (i + 1) % ROTATING_QUOTES.length), 4200);
    return () => clearInterval(id);
  }, []);

  function toggleSuggestedHabit(item: { title: string; icon: string; color: string }) {
    setSelectedHabits((prev) => {
      const exists = prev.some((h) => h.title === item.title);
      if (exists) return prev.filter((h) => h.title !== item.title);
      return [...prev, item];
    });
  }

  function addCustomHabit() {
    const clean = customHabitTitle.trim();
    if (clean.length < 2) return;
    if (!selectedHabits.some((h) => h.title.toLowerCase() === clean.toLowerCase())) {
      setSelectedHabits((prev) => [...prev, { title: clean, icon: "🔥", color: "violet" }]);
    }
    setCustomHabitTitle("");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    // Clear any previous session (e.g. demo user) before logging in / registering
    clearClientSession();
    try {
      const response = await fetch(isRegister ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isRegister
            ? {
                name,
                email,
                password,
                avatar,
                goal,
                initialHabits: selectedHabits,
              }
            : { email, password },
        ),
      });
      const json = (await response.json()) as {
        error?: string;
        token?: string;
        user?: ClientUser;
        welcomeEmail?: WelcomeEmailData | null;
      };

      if (!response.ok || !json.token || !json.user) {
        setError(json.error ?? "Algo salió mal.");
        setLoading(false);
        return;
      }

      saveClientSession(json.token, json.user);
      setSessionToken(json.token);

      if (isRegister && json.welcomeEmail) {
        setRegisteredUser(json.user);
        setWelcomeEmail(json.welcomeEmail);
        setLoading(false);
        return;
      }

      window.location.href = sessionHomeUrl(json.token);
    } catch {
      setError("No pudimos conectar con el servidor.");
      setLoading(false);
    }
  }

  async function loginDemo() {
    setEmail("demo@vitalis.app");
    setPassword("vitalis123");
    setError(null);
    setLoading(true);
    clearClientSession();
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "demo@vitalis.app", password: "vitalis123" }),
      });
      const json = (await response.json()) as {
        error?: string;
        token?: string;
        user?: ClientUser;
      };
      if (!response.ok || !json.token || !json.user) {
        setError("La demo no está disponible ahora mismo.");
        setLoading(false);
        return;
      }
      saveClientSession(json.token, json.user);
      window.location.href = sessionHomeUrl(json.token);
    } catch {
      setError("No pudimos conectar con el servidor.");
      setLoading(false);
    }
  }

  function enterHub(tab?: string) {
    if (!sessionToken) {
      window.location.href = "/entrar";
      return;
    }
    window.location.href = sessionHomeUrl(sessionToken, tab);
  }

  const inputClass =
    "w-full rounded-xl border border-white/12 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-fuchsia-400/70 focus:bg-white/[0.07] focus:ring-2 focus:ring-fuchsia-500/25";

  return (
    <main className="relative grid min-h-screen lg:grid-cols-2">
      {/* visual side */}
      <section className="relative hidden overflow-hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={isRegister ? IMAGES.strength : IMAGES.mind}
          alt="Atleta entrenando"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#05030a] via-[#05030a]/70 to-transparent" />
        <div className="animate-blob absolute -bottom-24 -left-20 h-96 w-96 rounded-full bg-fuchsia-600/35 blur-[110px]" />
        <div className="animate-blob absolute top-10 -right-24 h-96 w-96 rounded-full bg-cyan-500/25 blur-[120px] [animation-delay:-7s]" />

        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="font-[family-name:var(--font-display)] text-xl font-extrabold tracking-[0.25em]">
            VITALIS
          </Link>

          <div>
            <motion.h2
              key={quoteIndex}
              initial={{ opacity: 0, y: 22, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7 }}
              className="font-[family-name:var(--font-display)] max-w-md text-4xl leading-tight font-extrabold"
            >
              “{ROTATING_QUOTES[quoteIndex]}”
            </motion.h2>
            <div className="mt-8 flex gap-2">
              {ROTATING_QUOTES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setQuoteIndex(index)}
                  aria-label={`Frase ${index + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    index === quoteIndex
                      ? "w-10 bg-gradient-to-r from-fuchsia-400 to-cyan-400"
                      : "w-4 bg-white/25"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="glass max-w-md rounded-2xl p-5">
            <p className="text-[11px] tracking-[0.25em] text-cyan-300 uppercase">
              Tu Perfil Personal Propio
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Al registrarte entras directamente en tu propio panel personal (nunca en la demo), con tus hábitos elegidos, tus rutinas guardadas y tus recetas favoritas.
            </p>
          </div>
        </div>
      </section>

      {/* form / welcome email confirmation side */}
      <section className="relative flex items-center justify-center overflow-hidden px-6 py-10">
        <div className="pointer-events-none absolute inset-0 -z-10 grid-lines" />
        <div className="animate-blob pointer-events-none absolute -top-20 right-0 -z-10 h-80 w-80 rounded-full bg-violet-600/25 blur-[110px]" />

        {welcomeEmail && registeredUser ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass noise w-full max-w-xl overflow-hidden rounded-[2rem] p-7 shadow-[0_40px_100px_-35px_rgba(34,211,238,0.65)] sm:p-9"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-lime-400/20 px-3.5 py-1.5 text-xs font-extrabold text-lime-300 uppercase">
                <CheckCircle2 className="h-4 w-4" /> ¡Perfil Personal de {registeredUser.name} Creado!
              </span>
              <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
                Código #{welcomeEmail.verificationCode}
              </span>
            </div>

            <h1 className="font-[family-name:var(--font-display)] mt-4 text-2xl font-extrabold text-white sm:text-3xl">
              {registeredUser.avatar} Bienvenido a tu cuenta, {registeredUser.name}
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              Tu sesión personal ({registeredUser.email}) ya está activa y hemos creado tus {selectedHabits.length} hábitos personalizados.
            </p>

            {/* Instant Email Preview */}
            <div className="mt-5 rounded-2xl border border-white/12 bg-[#07050d]/90 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-semibold text-cyan-300">
                  <Mail className="h-3.5 w-3.5" /> {welcomeEmail.sender}
                </span>
                <span>Para: {registeredUser.email}</span>
              </div>
              <p className="mt-3 text-sm font-bold text-white">{welcomeEmail.subject}</p>
              <div className="mt-3 max-h-40 overflow-y-auto whitespace-pre-line rounded-xl bg-white/[0.03] p-3.5 text-xs leading-relaxed text-slate-300">
                {welcomeEmail.body}
              </div>
            </div>

            {/* Quick launch options */}
            <p className="mt-5 text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">
              Entra directamente a tu panel personal:
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => enterHub("tracker")}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/12 bg-white/[0.04] p-3 text-center text-xs font-bold text-white transition-all hover:border-fuchsia-400/60 hover:bg-fuchsia-500/15"
              >
                <Sparkles className="h-4 w-4 text-fuchsia-300" />
                Mis Hábitos
              </button>
              <button
                type="button"
                onClick={() => enterHub("routines")}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/12 bg-white/[0.04] p-3 text-center text-xs font-bold text-white transition-all hover:border-cyan-400/60 hover:bg-cyan-500/15"
              >
                <Dumbbell className="h-4 w-4 text-cyan-300" />
                Mis Rutinas
              </button>
              <button
                type="button"
                onClick={() => enterHub("recipes")}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/12 bg-white/[0.04] p-3 text-center text-xs font-bold text-white transition-all hover:border-lime-400/60 hover:bg-lime-500/15"
              >
                <Salad className="h-4 w-4 text-lime-300" />
                Mis Recetas
              </button>
            </div>

            <button
              type="button"
              onClick={() => enterHub("overview")}
              className="btn-glow mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 py-4 text-sm font-extrabold text-white shadow-[0_20px_45px_-18px_rgba(168,85,247,0.9)] transition-transform hover:scale-[1.02]"
            >
              Entrar a mi Panel Personal ({registeredUser.name})
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30, rotateX: -8 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="perspective w-full max-w-lg"
          >
            <div className="glass noise relative overflow-hidden rounded-[2rem] p-7 shadow-[0_40px_100px_-40px_rgba(168,85,247,0.6)] sm:p-9">
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500/20 to-cyan-400/20 px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] text-cyan-200 uppercase">
                <Sparkles className="h-3.5 w-3.5" />
                {isRegister ? "Crea tu perfil personal" : "Acceso a tu perfil"}
              </span>

              <h1 className="font-[family-name:var(--font-display)] mt-4 text-3xl font-extrabold tracking-tight">
                {isRegister ? "Configura tu Cuenta VITALIS" : "Inicia sesión en tu cuenta"}
              </h1>
              <p className="mt-1.5 text-xs text-slate-400">
                {isRegister
                  ? "Tendrás tu propio panel desde cero con tus propios hábitos, tus rutinas guardadas y tus recetas."
                  : "Introduce tu correo y contraseña para cargar tu panel personal."}
              </p>

              <form onSubmit={submit} className="mt-6 space-y-3.5">
                {isRegister ? (
                  <div className="relative">
                    <User className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre o apodo (ej: Alex)"
                      className={inputClass}
                      required
                    />
                  </div>
                ) : null}

                <div className="relative">
                  <Mail className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className={inputClass}
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña (mín. 6 caracteres)"
                    className={`${inputClass} pr-12`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label="Mostrar contraseña"
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-500 transition-colors hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {isRegister ? (
                  <>
                    <div className="relative">
                      <Zap className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="Tu objetivo personal (ej: Ganar músculo y definir)"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <p className="mb-1.5 text-[11px] font-bold tracking-[0.18em] text-slate-400 uppercase">
                        1. Elige tu avatar
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {AVATARS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setAvatar(emoji)}
                            className={`h-10 w-10 rounded-xl border text-lg transition-all duration-300 ${
                              avatar === emoji
                                ? "scale-110 border-fuchsia-400/70 bg-fuchsia-500/20 shadow-lg shadow-fuchsia-500/30"
                                : "border-white/10 bg-white/5 hover:scale-105 hover:border-white/30"
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-1.5 text-[11px] font-bold tracking-[0.18em] text-slate-400 uppercase">
                        2. Elige o escribe tus hábitos iniciales ({selectedHabits.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {SUGGESTED_HABITS.map((item) => {
                          const active = selectedHabits.some((h) => h.title === item.title);
                          return (
                            <button
                              key={item.title}
                              type="button"
                              onClick={() => toggleSuggestedHabit(item)}
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                                active
                                  ? "border-lime-400/70 bg-lime-400/20 text-lime-200"
                                  : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/30 hover:text-white"
                              }`}
                            >
                              <span>{item.icon}</span>
                              <span>{item.title}</span>
                              {active ? <Check className="h-3 w-3 text-lime-300" /> : null}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-2 flex gap-2">
                        <input
                          value={customHabitTitle}
                          onChange={(e) => setCustomHabitTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCustomHabit();
                            }
                          }}
                          placeholder="O añade un hábito propio (ej: Tomar creatina 5g)"
                          className="flex-1 rounded-xl border border-white/12 bg-white/[0.04] px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                        />
                        <button
                          type="button"
                          onClick={addCustomHabit}
                          className="inline-flex items-center gap-1 rounded-xl border border-cyan-400/40 bg-cyan-400/15 px-3 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-400/25"
                        >
                          <Plus className="h-3.5 w-3.5" /> Añadir
                        </button>
                      </div>
                    </div>
                  </>
                ) : null}

                {error ? (
                  <motion.p
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: [0, -6, 6, -3, 0] }}
                    className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                  </motion.p>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-glow flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 py-4 text-sm font-bold text-white shadow-[0_20px_45px_-18px_rgba(168,85,247,0.9)] transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {isRegister
                    ? "Crear mi Perfil Personal y Entrar"
                    : "Entrar a mi Perfil Personal"}
                </button>
              </form>

              <div className="mt-4 border-t border-white/10 pt-4">
                <button
                  onClick={loginDemo}
                  disabled={loading}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 text-xs font-semibold text-slate-400 transition-colors hover:border-cyan-300/40 hover:text-white disabled:opacity-60"
                >
                  O probar con la Cuenta Demo de ejemplo ⚡
                </button>
              </div>

              <p className="mt-4 text-center text-sm text-slate-400">
                {isRegister ? "¿Ya tienes tu propia cuenta? " : "¿Quieres crear tu propia cuenta desde cero? "}
                <Link
                  href={isRegister ? "/entrar" : "/registro"}
                  className="font-semibold text-white underline decoration-fuchsia-400/60 decoration-2 underline-offset-4"
                >
                  {isRegister ? "Inicia sesión aquí" : "Regístrate gratis aquí"}
                </Link>
              </p>
            </div>
          </motion.div>
        )}
      </section>
    </main>
  );
}
