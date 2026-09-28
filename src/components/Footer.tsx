import Link from "next/link";
import { Flame } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#07050d] py-14">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400">
              <Flame className="h-5 w-5" />
            </span>
            <span className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[0.2em]">
              VITALIS
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            Lifestyle, hábitos y motivación en una sola experiencia. Construida para quien decide
            no negociar consigo mismo.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold tracking-[0.25em] text-slate-500 uppercase">Producto</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li><Link className="transition-colors hover:text-white" href="/#pilares">Pilares</Link></li>
            <li><Link className="transition-colors hover:text-white" href="/#tracker">Habit tracker</Link></li>
            <li><Link className="transition-colors hover:text-white" href="/#frases">Frases motivacionales</Link></li>
            <li><Link className="transition-colors hover:text-white" href="/dashboard">Mi panel</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold tracking-[0.25em] text-slate-500 uppercase">Cuenta</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li><Link className="transition-colors hover:text-white" href="/registro">Crear cuenta</Link></li>
            <li><Link className="transition-colors hover:text-white" href="/entrar">Iniciar sesión</Link></li>
          </ul>
        </div>
      </div>

      <p className="mx-auto mt-12 max-w-7xl px-6 text-xs text-slate-600">
        © {new Date().getFullYear()} VITALIS · Hecho con sudor, Next.js y PostgreSQL.
      </p>
    </footer>
  );
}
