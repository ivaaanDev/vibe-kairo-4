"use client";

import type { LucideIcon } from "lucide-react";
import { forwardRef } from "react";

type LadoTooltip = "abajo" | "arriba" | "derecha" | "izquierda";

const POSICION_TOOLTIP: Record<LadoTooltip, string> = {
  abajo: "top-full left-1/2 -translate-x-1/2 mt-1.5",
  arriba: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
  derecha: "left-full top-1/2 -translate-y-1/2 ml-2",
  izquierda: "right-full top-1/2 -translate-y-1/2 mr-2",
};

interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icono: LucideIcon;
  /** Nombre accesible; también es el texto del tooltip. */
  etiqueta: string;
  /** Texto del tooltip si difiere del nombre (p. ej. con el atajo). */
  tooltip?: string;
  ladoTooltip?: LadoTooltip;
  tamanoIcono?: number;
  tono?: "neutro" | "peligro";
}

/** Botón de solo icono: área táctil de 44 × 44, nombre accesible y tooltip en escritorio. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icono: Icono, etiqueta, tooltip, ladoTooltip = "abajo", tamanoIcono = 18, tono = "neutro", className = "", ...resto },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={etiqueta}
      className={`group/boton relative grid size-11 shrink-0 place-items-center rounded-control transition-colors duration-(--k-duracion-inmediata) active:scale-[0.96] disabled:opacity-40 ${
        tono === "peligro" ? "text-danger hover:bg-surface-2" : "text-fg-muted hover:bg-surface-2 hover:text-fg"
      } ${className}`}
      {...resto}
    >
      <Icono size={tamanoIcono} strokeWidth={1.75} aria-hidden />
      <span
        aria-hidden
        className={`pointer-events-none absolute z-50 hidden whitespace-nowrap rounded-control bg-fg px-2 py-1 text-[12px] leading-4 font-medium text-bg opacity-0 transition-opacity duration-(--k-duracion-inmediata) [@media(hover:hover)]:block group-hover/boton:opacity-100 group-hover/boton:delay-500 group-focus-visible/boton:opacity-100 ${POSICION_TOOLTIP[ladoTooltip]}`}
      >
        {tooltip ?? etiqueta}
      </span>
    </button>
  );
});
