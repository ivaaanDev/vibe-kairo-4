"use client";

import { ChevronRight } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useMemo, useState } from "react";
import { usePanel } from "@/app/_estado/panel-contextual";
import { useKairo } from "@/app/_estado/proveedor-kairo";
import { useAhora } from "@/app/_estado/use-ahora";
import { filtrarPorEtiquetas } from "@/lib/dominio/etiquetas";
import { ordenarLista } from "@/lib/dominio/orden";
import type { Tarea } from "@/lib/tipos/tarea";
import { EmptyState } from "./empty-state";
import { TaskRow } from "./task-row";

/** Mantiene en su sitio las tareas completadas desde esta vista mientras siga montada. */
export function useRetencionCompletadas() {
  const { actualizarTarea } = useKairo();
  const [retenidas, setRetenidas] = useState<ReadonlySet<string>>(() => new Set());
  const alternar = (tarea: Tarea) => {
    const completar = !tarea.completada;
    setRetenidas((previas) => {
      const siguientes = new Set(previas);
      if (completar) siguientes.add(tarea.id);
      else siguientes.delete(tarea.id);
      return siguientes;
    });
    actualizarTarea(tarea.id, { completada: completar });
  };
  return { retenidas, alternar };
}

export function TaskList() {
  const { tareas, filtro, etiquetasPorId, establecerFiltro } = useKairo();
  const { panel, abrirTarea } = usePanel();
  const ahora = useAhora();
  const { retenidas, alternar } = useRetencionCompletadas();
  const [verCompletadas, setVerCompletadas] = useState(false);

  const visibles = useMemo(() => filtrarPorEtiquetas(tareas, filtro), [tareas, filtro]);
  const { pendientes, completadas } = useMemo(() => ordenarLista(visibles, retenidas), [visibles, retenidas]);

  // La hora local solo existe en el cliente; hasta entonces se reserva el espacio.
  if (!ahora) return <div className="min-h-40" aria-busy="true" />;

  const seleccionada = panel?.tipo === "tarea" ? panel.id : null;
  const fila = (tarea: Tarea) => (
    <TaskRow
      key={tarea.id}
      tarea={tarea}
      ahora={ahora}
      etiquetasPorId={etiquetasPorId}
      seleccionada={tarea.id === seleccionada}
      onAlternar={alternar}
      onAbrir={(t, origen) => abrirTarea(t.id, origen)}
    />
  );

  if (tareas.length === 0) {
    return <EmptyState titulo="Nada pendiente." detalle="Las nuevas tareas aparecerán aquí." />;
  }

  if (visibles.length === 0) {
    return (
      <EmptyState
        titulo="Ninguna tarea con estas etiquetas."
        accion={
          <button
            type="button"
            onClick={() => establecerFiltro([])}
            className="h-11 rounded-control px-3 text-[14px] font-medium text-accent hover:bg-surface-2"
          >
            Quitar filtro
          </button>
        }
      />
    );
  }

  return (
    <LayoutGroup>
      {pendientes.length === 0 ? (
        <EmptyState titulo="Nada pendiente." detalle="Las nuevas tareas aparecerán aquí." />
      ) : (
        <ul aria-label="Tareas pendientes" className="mt-2">
          <AnimatePresence initial={false} mode="popLayout">
            {pendientes.map(fila)}
          </AnimatePresence>
        </ul>
      )}

      {completadas.length > 0 && (
        <motion.section layout="position" className="mt-6" aria-labelledby="titulo-completadas">
          <h2 id="titulo-completadas">
            <button
              type="button"
              aria-expanded={verCompletadas}
              aria-controls="lista-completadas"
              onClick={() => setVerCompletadas((visible) => !visible)}
              className="flex h-11 w-full items-center gap-1.5 rounded-control px-1 text-[13px] font-semibold text-fg-muted hover:text-fg"
            >
              <ChevronRight
                size={16}
                strokeWidth={2}
                aria-hidden
                className={`transition-transform duration-(--k-duracion-normal) ease-estandar ${verCompletadas ? "rotate-90" : ""}`}
              />
              Completadas
              <span className="font-normal numeros-tabulares">{completadas.length}</span>
            </button>
          </h2>
          <AnimatePresence initial={false}>
            {verCompletadas && (
              <motion.ul
                id="lista-completadas"
                aria-label="Tareas completadas"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                className="overflow-hidden"
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {completadas.map(fila)}
                </AnimatePresence>
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.section>
      )}
    </LayoutGroup>
  );
}
