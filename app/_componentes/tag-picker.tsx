"use client";

import { Check, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useKairo } from "@/app/_estado/proveedor-kairo";
import { useMediaQuery } from "@/app/_estado/use-media-query";
import { ordenarEtiquetas } from "@/lib/dominio/etiquetas";
import { claveComparable } from "@/lib/dominio/texto";
import type { Tarea } from "@/lib/tipos/tarea";
import { TagDot } from "./tag-indicator";

/** Asignación de etiquetas en línea: marcar, desmarcar o crear una nueva escribiendo su nombre. */
export function TagPicker({ tarea, onCerrar }: { tarea: Tarea; onCerrar: () => void }) {
  const { etiquetas, crearEtiqueta, actualizarTarea } = useKairo();
  const [consulta, setConsulta] = useState("");
  const [error, setError] = useState<string | null>(null);
  const esTactil = useMediaQuery("(pointer: coarse)");

  const ordenadas = useMemo(() => ordenarEtiquetas(etiquetas), [etiquetas]);
  const clave = claveComparable(consulta);
  const visibles = clave ? ordenadas.filter((etiqueta) => claveComparable(etiqueta.nombre).includes(clave)) : ordenadas;
  const exacta = clave ? ordenadas.find((etiqueta) => claveComparable(etiqueta.nombre) === clave) : undefined;

  const alternar = (id: string) => {
    const asignada = tarea.etiquetaIds.includes(id);
    actualizarTarea(tarea.id, { etiquetaIds: asignada ? tarea.etiquetaIds.filter((otra) => otra !== id) : [...tarea.etiquetaIds, id] });
  };

  const crear = () => {
    const resultado = crearEtiqueta(consulta);
    if (!resultado.ok) {
      setError(resultado.error.mensaje);
      return;
    }
    actualizarTarea(tarea.id, { etiquetaIds: [...tarea.etiquetaIds, resultado.valor.id] });
    setConsulta("");
    setError(null);
  };

  const alPulsarTecla = (evento: React.KeyboardEvent) => {
    if (evento.key === "Escape") {
      evento.preventDefault();
      evento.stopPropagation();
      onCerrar();
    }
  };

  return (
    <div className="mt-2 overflow-hidden rounded-panel border border-line bg-surface" onKeyDown={alPulsarTecla}>
      <div className="border-b border-line px-3 has-[:focus-visible]:shadow-[inset_0_-2px_0_var(--k-focus)]">
        <input
          type="text"
          value={consulta}
          autoFocus={!esTactil}
          maxLength={40}
          onChange={(evento) => {
            setConsulta(evento.target.value);
            setError(null);
          }}
          onKeyDown={(evento) => {
            if (evento.key !== "Enter") return;
            evento.preventDefault();
            if (exacta) {
              alternar(exacta.id);
              setConsulta("");
            } else if (consulta.trim()) crear();
          }}
          placeholder="Buscar o crear etiqueta"
          aria-label="Buscar o crear etiqueta"
          className="h-11 w-full bg-transparent text-[16px] focus-visible:outline-none sm:text-[15px]"
        />
      </div>
      <ul aria-label="Etiquetas disponibles" className="max-h-60 overflow-y-auto py-1">
        {visibles.map((etiqueta) => (
          <li key={etiqueta.id}>
            <label className="flex h-11 cursor-pointer items-center gap-3 px-3 hover:bg-surface-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-focus">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={tarea.etiquetaIds.includes(etiqueta.id)}
                onChange={() => alternar(etiqueta.id)}
              />
              <TagDot color={etiqueta.color} tamano={10} />
              <span className="min-w-0 flex-1 truncate text-[15px]">{etiqueta.nombre}</span>
              <Check size={16} strokeWidth={2} aria-hidden className="text-accent opacity-0 peer-checked:opacity-100" />
            </label>
          </li>
        ))}
        {consulta.trim() && !exacta && (
          <li>
            <button type="button" onClick={crear} className="flex h-11 w-full items-center gap-3 px-3 text-left text-[15px] text-accent hover:bg-surface-2">
              <Plus size={16} strokeWidth={2} aria-hidden />
              <span className="truncate">Crear «{consulta.trim()}»</span>
            </button>
          </li>
        )}
        {ordenadas.length === 0 && !consulta.trim() && (
          <li className="px-3 py-2 text-[14px] text-fg-muted">Escribe un nombre para crear la primera.</li>
        )}
      </ul>
      {error && (
        <p role="alert" className="px-3 pb-2 text-[13px] text-danger">
          {error}
        </p>
      )}
      <div className="flex justify-end border-t border-line p-1">
        <button type="button" onClick={onCerrar} className="h-10 rounded-control px-3 text-[14px] font-medium text-accent hover:bg-surface-2">
          Listo
        </button>
      </div>
    </div>
  );
}
