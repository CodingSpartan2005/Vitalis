"use client";

import { motion } from "motion/react";
import { prettyDate } from "@/lib/dates";
import { useFinePointer } from "@/lib/use-fine-pointer";

type Cell = { day: string; count: number; total: number };

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export default function Heatmap({ cells }: { cells: Cell[] }) {
  const finePointer = useFinePointer();
  const weeks: Cell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <section className="glass relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
      <div className="vt-mobile-heavy pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-cyan-500/20 blur-[90px]" />
      <header className="relative">
        <p className="text-[11px] font-bold tracking-[0.25em] text-cyan-400 uppercase">
          Mapa de consistencia
        </p>
        <h2 className="font-[family-name:var(--font-display)] mt-1 text-2xl font-extrabold">
          13 semanas de historia
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Cada cuadro es un día. Cuanto más brilla, más hábitos cerraste.
        </p>
      </header>

      <div className="relative mt-7 overflow-x-auto pb-2">
        <div className="flex gap-1.5">
          {weeks.map((week, index) => {
            const month = new Date(`${week[0].day}T00:00:00Z`).getUTCMonth();
            const showMonth = index === 0 || (index > 0 && new Date(`${weeks[index - 1][0].day}T00:00:00Z`).getUTCMonth() !== month);
            return (
              <div key={week[0].day} className="flex flex-col gap-1.5">
                <span className="h-4 text-[9px] font-semibold tracking-wider text-slate-500 uppercase">
                  {showMonth ? MONTHS[month] : ""}
                </span>
                {week.map((cell, dayIndex) => {
                  const ratio = cell.total > 0 ? cell.count / cell.total : 0;
                  const intensity =
                    cell.count === 0 ? 0 : ratio >= 1 ? 1 : ratio >= 0.66 ? 0.75 : ratio >= 0.34 ? 0.5 : 0.28;
                  return (
                    <motion.div
                      key={cell.day}
                      initial={finePointer ? { opacity: 0, scale: 0.4 } : false}
                      whileInView={finePointer ? { opacity: 1, scale: 1 } : undefined}
                      viewport={{ once: true }}
                      transition={finePointer ? { duration: 0.3, delay: (index * 7 + dayIndex) * 0.003 } : undefined}
                      title={`${prettyDate(cell.day)} · ${cell.count}/${cell.total} hábitos`}
                      className="h-3.5 w-3.5 rounded-[4px] border border-white/5 transition-transform hover:scale-150"
                      style={{
                        background:
                          intensity === 0
                            ? "rgba(255,255,255,0.05)"
                            : `linear-gradient(135deg, rgba(168,85,247,${intensity}), rgba(34,211,238,${intensity}), rgba(163,230,53,${intensity}))`,
                        boxShadow: intensity >= 1 ? "0 0 12px rgba(163,230,53,0.55)" : undefined,
                      }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2 text-[10px] text-slate-500">
        <span>menos</span>
        {[0, 0.28, 0.5, 0.75, 1].map((level) => (
          <span
            key={level}
            className="h-3.5 w-3.5 rounded-[4px] border border-white/5"
            style={{
              background:
                level === 0
                  ? "rgba(255,255,255,0.05)"
                  : `linear-gradient(135deg, rgba(168,85,247,${level}), rgba(34,211,238,${level}), rgba(163,230,53,${level}))`,
            }}
          />
        ))}
        <span>más</span>
      </div>
    </section>
  );
}
