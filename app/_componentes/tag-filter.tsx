"use client";

import { Check, ListFilter } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { usePanel } from "@/app/_estado/panel-contextual";
import { useKairo } from "@/app/_estado/proveedor-kairo";
import { contarTareasPorEtiqueta, ordenarEtiquetas } from "@/lib/dominio/etiquetas";
import { AdaptiveSurface } from "./primitivas/adaptive-surface";
import { TagDot } from "./tag-indicator";

/** Un único control, cerrado por defecto. Popover en escritorio, sheet en móvil. */
export function TagFilter() {
  const { etiquetas, etiquetasPorId, filtro, establecerFiltro, tareas } = useKairo();
  const { abrirEtiquetas } = usePanel();
  const [abierto, setAbierto] = useState(false);
  const ancla = useRef<HTMLButtonElement>(null);

  const ordenadas = useMemo(() => ordenarEtiquetas(etiquetas), [etiquetas]);
  const conteo = useMemo(() => contarTareasPorEtiqueta(tareas), [tareas]);
  const activas = filtro.flatMap((id) => {
    const etiqueta = etiquetasPorId.get(id);
    return etiqueta ? [etiqueta] : [];
  });
  const resumen = activas.length === 0 ? "Etiquetas" : activas.length === 1 ? (activas[0]?.nombre ?? "") : `${activas.length} etiquetas`;

  const alternar = (id: string) =>
    establecerFiltro(filtro.includes(id) ? filtro.filter((filtrada) => filtrada !== id) : [...filtro, id]);

  return (
    <>
      <button
        ref={ancla}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-label={activas.length > 0 ? `Filtro de etiquetas: ${resumen}` : "Filtrar por etiqueta"}
        onClick={() => setAbierto((visible) => !visible)}
        className={`inline-flex h-11 max-w-44 items-center gap-1.5 rounded-control px-3 text-[14px] font-medium transition-colors duration-(--k-duracion-inmediata) ${
          activas.length > 0 ? "bg-accent-soft text-accent" : "text-fg-muted hover:bg-surface-2 hover:text-fg"
        }`}
      >
        <ListFilter size={17} strokeWidth={1.75} aria-hidden className="shrink-0" />
        <span className="truncate">{resumen}</span>
      </button>

      <AdaptiveSurface
        abierta={abierto}
        onCerrar={() => setAbierto(false)}
        anclaRef={ancla}
        etiqueta="Filtrar por etiqueta"
        titulo="Filtrar por etiqueta"
        posicion="abajo-fin"
        ancho={272}
      >
        {ordenadas.length === 0 ? (
          <div className="px-3 py-2">
            <p className="text-[14px] text-fg-muted">Aún no hay etiquetas.</p>
            <button
              type="button"
              onClick={() => {
                setAbierto(false);
                abrirEtiquetas(ancla.current);
              }}
              className="-mx-1 mt-1 h-11 rounded-control px-1 text-[14px] font-medium text-accent"
            >
              Gestionar etiquetas
            </button>
          </div>
        ) : (
          <fieldset>
            <legend className="sr-only">Mostrar tareas con cualquiera de estas etiquetas</legend>
            {ordenadas.map((etiqueta) => (
              <label
                key={etiqueta.id}
                className="flex h-11 cursor-pointer items-center gap-3 rounded-control px-3 hover:bg-surface-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus"
              >
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={filtro.includes(etiqueta.id)}
                  onChange={() => alternar(etiqueta.id)}
                />
                <TagDot color={etiqueta.color} tamano={10} />
                <span className="min-w-0 flex-1 truncate text-[15px]">{etiqueta.nombre}</span>
                <span aria-hidden className="text-[13px] text-fg-muted numeros-tabulares">
                  {conteo.get(etiqueta.id) ?? 0}
                </span>
                <Check size={16} strokeWidth={2} aria-hidden className="text-accent opacity-0 peer-checked:opacity-100" />
              </label>
            ))}
          </fieldset>
        )}
        {filtro.length > 0 && (
          <div className="mt-1 border-t border-line pt-1">
            <button
              type="button"
              onClick={() => establecerFiltro([])}
              className="flex h-11 w-full items-center rounded-control px-3 text-[14px] text-fg-muted hover:bg-surface-2 hover:text-fg"
            >
              Quitar filtro
            </button>
          </div>
        )}
      </AdaptiveSurface>
    </>
  );
}
