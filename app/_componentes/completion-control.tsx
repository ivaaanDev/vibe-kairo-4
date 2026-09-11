"use client";

/*
 * El control más repetido de Kairo. Un anillo que se llena y traza su check;
 * el mismo control revierte. Área táctil de 44 × 44 con un dibujo de 20 px.
 */
export function CompletionControl({
  completada,
  titulo,
  onAlternar,
}: {
  completada: boolean;
  titulo: string;
  onAlternar: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={completada}
      aria-label={`Completar: ${titulo}`}
      onClick={onAlternar}
      className="group/check grid size-11 shrink-0 place-items-center rounded-full"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        aria-hidden
        className="transition-transform duration-(--k-duracion-inmediata) ease-estandar group-active/check:scale-[0.88]"
      >
        <circle
          cx="10"
          cy="10"
          r="8.25"
          strokeWidth="1.5"
          className={completada ? "fill-accent stroke-accent" : "fill-transparent stroke-line-strong group-hover/check:stroke-fg-muted"}
          style={{ transition: "fill var(--k-duracion-normal) var(--k-curva-estandar), stroke var(--k-duracion-normal) var(--k-curva-estandar)" }}
        />
        <path
          d="M6.3 10.4l2.5 2.5 4.9-5.1"
          fill="none"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-accent-fg"
          strokeDasharray="12"
          strokeDashoffset={completada ? 0 : 12}
          style={{ transition: "stroke-dashoffset var(--k-duracion-normal) var(--k-curva-estandar) 60ms" }}
        />
      </svg>
    </button>
  );
}
