"use client";

import { ChevronLeft, X } from "lucide-react";
import { useEsMedio } from "@/app/_estado/use-media-query";
import { IconButton } from "./primitivas/icon-button";

/**
 * Cabecera del panel contextual. En móvil a pantalla completa se comporta como una
 * pantalla apilada («‹ Tareas»); en panel lateral, como un inspector con botón de cierre.
 */
export function PanelHeader({
  modo,
  volverA,
  titulo,
  onCerrar,
  children,
}: {
  modo: "acoplado" | "superpuesto";
  volverA: string;
  titulo?: string;
  onCerrar: () => void;
  children?: React.ReactNode;
}) {
  const esMedio = useEsMedio();
  const pantallaCompleta = modo === "superpuesto" && !esMedio;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-line px-2">
      {pantallaCompleta ? (
        <button
          type="button"
          onClick={onCerrar}
          className="inline-flex h-11 items-center gap-0.5 rounded-control pr-3 text-[15px] font-medium text-accent"
        >
          <ChevronLeft size={22} strokeWidth={2} aria-hidden />
          {volverA}
        </button>
      ) : (
        <h2 className="truncate px-2 text-[15px] font-semibold">{titulo}</h2>
      )}
      <div className="flex items-center gap-1">
        {children}
        {!pantallaCompleta && <IconButton icono={X} etiqueta="Cerrar" tooltip="Cerrar · Esc" ladoTooltip="izquierda" onClick={onCerrar} />}
      </div>
    </header>
  );
}
