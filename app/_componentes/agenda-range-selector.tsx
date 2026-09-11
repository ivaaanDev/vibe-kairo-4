"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import type { RangoAgenda } from "@/lib/dominio/agenda";

const OPCIONES: { valor: RangoAgenda; etiqueta: string }[] = [
  { valor: "hoy", etiqueta: "Hoy" },
  { valor: "semana", etiqueta: "Esta semana" },
];

/** Control segmentado con indicador que se desliza. Pestañas accesibles con flechas. */
export function AgendaRangeSelector({ rango, onCambiar }: { rango: RangoAgenda; onCambiar: (rango: RangoAgenda) => void }) {
  const botones = useRef<(HTMLButtonElement | null)[]>([]);

  const alPulsarTecla = (evento: React.KeyboardEvent, indice: number) => {
    if (evento.key !== "ArrowRight" && evento.key !== "ArrowLeft") return;
    evento.preventDefault();
    const siguiente = (indice + (evento.key === "ArrowRight" ? 1 : -1) + OPCIONES.length) % OPCIONES.length;
    const opcion = OPCIONES[siguiente];
    if (!opcion) return;
    onCambiar(opcion.valor);
    botones.current[siguiente]?.focus();
  };

  return (
    <div role="tablist" aria-label="Rango de la agenda" className="grid w-full grid-cols-2 rounded-[8px] bg-surface-2 p-0.5 sm:inline-grid sm:w-auto">
      {OPCIONES.map((opcion, indice) => {
        const activo = opcion.valor === rango;
        return (
          <button
            key={opcion.valor}
            ref={(elemento) => {
              botones.current[indice] = elemento;
            }}
            type="button"
            role="tab"
            id={`rango-${opcion.valor}`}
            aria-selected={activo}
            aria-controls="agenda-contenido"
            tabIndex={activo ? 0 : -1}
            onClick={() => onCambiar(opcion.valor)}
            onKeyDown={(evento) => alPulsarTecla(evento, indice)}
            className="relative h-10 rounded-[6px] px-5 text-[14px] font-medium"
          >
            {activo && (
              <motion.span
                layoutId="rango-agenda-activo"
                aria-hidden
                className="absolute inset-0 rounded-[6px] bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.08)] ring-1 ring-line"
                transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
              />
            )}
            <span className={`relative transition-colors ${activo ? "text-fg" : "text-fg-muted"}`}>{opcion.etiqueta}</span>
          </button>
        );
      })}
    </div>
  );
}
