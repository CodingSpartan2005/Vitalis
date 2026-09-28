"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Mail, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import type { InboxMessageView } from "@/lib/types";

type Props = {
  messages: InboxMessageView[];
  userEmail: string;
  onMarkRead: (id: number) => Promise<void>;
  onResend: () => Promise<void>;
};

export default function InboxPanel({ messages, userEmail, onMarkRead, onResend }: Props) {
  const [selectedId, setSelectedId] = useState<number>(messages[0]?.id ?? 0);
  const [resending, setResending] = useState(false);

  const activeMessage = messages.find((m) => m.id === selectedId) ?? messages[0];

  async function handleSelect(msg: InboxMessageView) {
    setSelectedId(msg.id);
    if (!msg.isRead) {
      await onMarkRead(msg.id);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await onResend();
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass noise relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/20 blur-[95px]" />

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-[11px] font-bold tracking-[0.25em] text-cyan-400 uppercase">
              Buzón Instantáneo VITALIS
            </p>
            <h2 className="font-[family-name:var(--font-display)] mt-1 text-2xl font-extrabold sm:text-3xl">
              Tus Correos de Bienvenida y Plan Fitness
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Para que nunca dependas de filtros de spam externos, tus correos de confirmación, códigos y planes llegan al instante a tu buzón integrado ({userEmail}).
            </p>
          </div>

          <button
            type="button"
            disabled={resending}
            onClick={handleResend}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-bold text-white transition-all hover:border-cyan-300/60 hover:bg-cyan-400/10 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
            {resending ? "Enviando..." : "Reenviar correo de bienvenida"}
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
          {/* Message list */}
          <div className="space-y-3">
            {messages.map((msg) => {
              const isSelected = activeMessage?.id === msg.id;
              return (
                <button
                  key={msg.id}
                  type="button"
                  onClick={() => handleSelect(msg)}
                  className={`flex w-full flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-fuchsia-400/70 bg-fuchsia-500/15 shadow-lg shadow-fuchsia-500/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/25"
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                      <Mail className="h-3.5 w-3.5" />
                      {msg.sender.split("<")[0].trim()}
                    </span>
                    {!msg.isRead ? (
                      <span className="rounded-full bg-fuchsia-500 px-2 py-0.5 text-[10px] font-extrabold text-white uppercase">
                        Nuevo
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Leído</span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-bold text-white">{msg.subject}</p>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-lime-300">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Código: #{msg.verificationCode} · Verificado
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active email reader */}
          {activeMessage ? (
            <motion.div
              key={activeMessage.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-white/12 bg-[#08060f]/90 p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400">De: {activeMessage.sender}</p>
                  <p className="text-xs font-semibold text-slate-400">Para: {userEmail}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/40 bg-lime-400/10 px-3 py-1 text-xs font-bold text-lime-300">
                  <CheckCircle2 className="h-4 w-4" />
                  Código #{activeMessage.verificationCode} Activo
                </span>
              </div>

              <h3 className="font-[family-name:var(--font-display)] mt-5 text-xl font-extrabold text-white">
                {activeMessage.subject}
              </h3>

              <div className="mt-5 whitespace-pre-line rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-slate-200">
                {activeMessage.body}
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs text-cyan-300">
                <Sparkles className="h-4 w-4" />
                Tu cuenta está 100% verificada y todas las pestañas interactivas están desbloqueadas.
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
