"use client";

import { KairoMark } from "./_componentes/kairo-mark";

export default function ErrorGlobal({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const faltaConfiguracion = error.message.includes("NEXT_PUBLIC_SUPABASE");
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-[360px] animate-aparecer">
        <KairoMark tamano={28} className="text-fg" />
        <h1 className="mt-6 text-[20px] leading-7 font-semibold">Algo no salió bien.</h1>
        <p className="mt-1.5 text-[15px] text-fg-muted">
          {faltaConfiguracion
            ? "Falta configurar Supabase. Copia .env.example a .env.local o arranca con npm run dev:local."
            : "No pudimos cargar tus tareas. Revisa tu conexión y vuelve a intentarlo."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex h-11 items-center rounded-control bg-accent px-4 text-[15px] font-semibold text-accent-fg"
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}
