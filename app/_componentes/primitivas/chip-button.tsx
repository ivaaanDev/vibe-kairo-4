"use client";

/** Acción secundaria compacta dentro de un formulario (p. ej. «Hoy», «Añadir hora»). */
export function ChipButton({ className = "", children, ...resto }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`inline-flex h-9 items-center gap-1.5 rounded-control border border-line bg-surface px-3 text-[14px] text-fg transition-colors duration-(--k-duracion-inmediata) hover:border-line-strong active:scale-[0.98] ${className}`}
      {...resto}
    >
      {children}
    </button>
  );
}
