"use client";

import { AnimatePresence } from "motion/react";
import { posicionMarcadorAhora, type GrupoAgenda } from "@/lib/dominio/agenda";
import type { Etiqueta } from "@/lib/tipos/etiqueta";
import type { MomentoLocal, Tarea } from "@/lib/tipos/tarea";
import { TaskRow } from "./task-row";

/** Un tramo de la secuencia temporal: «Vencidas», «Hoy», «Mañana», «Lunes 14 sep». */
export function AgendaGroup({
  grupo,
  ahora,
  etiquetasPorId,
  seleccionada,
  onAlternar,
  onAbrir,
}: {
  grupo: GrupoAgenda;
  ahora: MomentoLocal;
  etiquetasPorId: ReadonlyMap<string, Etiqueta>;
  seleccionada: string | null;
  onAlternar: (tarea: Tarea) => void;
  onAbrir: (tarea: Tarea, origen: HTMLElement) => void;
}) {
  const esVencidas = grupo.tipo === "vencidas";
  const marcador = grupo.tipo === "dia" && grupo.fecha === ahora.fecha ? posicionMarcadorAhora(grupo.tareas, ahora) : null;
  const idTitulo = `grupo-${grupo.clave}`;

  return (
    <section aria-labelledby={idTitulo} className="mt-6 first:mt-3">
      <h2 id={idTitulo} className="flex items-baseline gap-2 border-b border-line px-1 pb-1.5 text-[13px] font-semibold">
        <span className={esVencidas ? "text-danger" : "text-fg"}>{grupo.titulo}</span>
        <span className="ml-auto font-normal text-fg-muted numeros-tabulares">
          {grupo.tareas.length}
          <span className="sr-only"> {grupo.tareas.length === 1 ? "tarea" : "tareas"}</span>
        </span>
      </h2>
      <ul>
        <AnimatePresence initial={false} mode="popLayout">
          {grupo.tareas.map((tarea, indice) => (
            <TaskRow
              key={tarea.id}
              tarea={tarea}
              ahora={ahora}
              etiquetasPorId={etiquetasPorId}
              seleccionada={tarea.id === seleccionada}
              variante="agenda"
              mostrarFecha={esVencidas}
              marcadorAhora={
                marcador === indice ? "antes" : marcador === grupo.tareas.length && indice === grupo.tareas.length - 1 ? "despues" : null
              }
              onAlternar={onAlternar}
              onAbrir={onAbrir}
            />
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}
