"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useMemo, useState } from "react";
import { usePanel } from "@/app/_estado/panel-contextual";
import { useKairo } from "@/app/_estado/proveedor-kairo";
import { useAhora } from "@/app/_estado/use-ahora";
import { calcularAgenda, type RangoAgenda } from "@/lib/dominio/agenda";
import { filtrarPorEtiquetas } from "@/lib/dominio/etiquetas";
import { fechaLarga } from "@/lib/dominio/formato-fecha";
import { AgendaGroup } from "./agenda-group";
import { AgendaRangeSelector } from "./agenda-range-selector";
import { EmptyState } from "./empty-state";
import { TagFilter } from "./tag-filter";
import { useRetencionCompletadas } from "./task-list";
import { ViewHeader } from "./view-header";

export function AgendaView({ rangoInicial }: { rangoInicial: RangoAgenda }) {
  const { tareas, filtro, etiquetasPorId, establecerFiltro } = useKairo();
  const { panel, abrirTarea } = usePanel();
  const ahora = useAhora();
  const [rango, setRango] = useState(rangoInicial);
  const { retenidas, alternar } = useRetencionCompletadas();

  const grupos = useMemo(
    () => (ahora ? calcularAgenda(filtrarPorEtiquetas(tareas, filtro), rango, ahora, { retenidas }) : null),
    [tareas, filtro, rango, ahora, retenidas],
  );

  // El rango se refleja en la URL sin navegar: la vista no se recarga.
  const cambiarRango = (siguiente: RangoAgenda) => {
    setRango(siguiente);
    const parametros = new URLSearchParams(window.location.search);
    if (siguiente === "hoy") parametros.delete("rango");
    else parametros.set("rango", siguiente);
    const consulta = parametros.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${consulta ? `?${consulta}` : ""}`);
  };

  const seleccionada = panel?.tipo === "tarea" ? panel.id : null;
  const hayFiltro = filtro.length > 0;

  return (
    <>
      <ViewHeader titulo="Agenda" subtitulo={ahora ? fechaLarga(ahora.fecha) : null} acciones={<TagFilter />}>
        <div className="pt-3 pb-2">
          <AgendaRangeSelector rango={rango} onCambiar={cambiarRango} />
        </div>
      </ViewHeader>

      <div id="agenda-contenido" role="tabpanel" aria-labelledby={`rango-${rango}`}>
        {ahora && grupos && (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={rango}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              transition={{ duration: 0.18, ease: [0, 0, 0.2, 1] }}
            >
              {grupos.length === 0 ? (
                hayFiltro ? (
                  <EmptyState
                    titulo="Nada con estas etiquetas."
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
                ) : rango === "hoy" ? (
                  <EmptyState titulo="Nada para hoy." detalle="Las tareas con fecha de hoy aparecerán aquí." />
                ) : (
                  <EmptyState titulo="Semana despejada." detalle="Las tareas con fecha de los próximos 7 días aparecerán aquí." />
                )
              ) : (
                <LayoutGroup>
                  {grupos.map((grupo) => (
                    <AgendaGroup
                      key={grupo.clave}
                      grupo={grupo}
                      ahora={ahora}
                      etiquetasPorId={etiquetasPorId}
                      seleccionada={seleccionada}
                      onAlternar={alternar}
                      onAbrir={(tarea, origen) => abrirTarea(tarea.id, origen)}
                    />
                  ))}
                </LayoutGroup>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </>
  );
}
