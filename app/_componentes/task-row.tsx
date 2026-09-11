"use client";

import { CircleAlert, TextAlignStart } from "lucide-react";
import { motion } from "motion/react";
import { etiquetasDeTarea } from "@/lib/dominio/etiquetas";
import { describirVencimiento, estaVencida } from "@/lib/dominio/vencimiento";
import { movimiento } from "@/lib/diseno/tokens";
import type { Etiqueta } from "@/lib/tipos/etiqueta";
import type { MomentoLocal, Tarea } from "@/lib/tipos/tarea";
import { CompletionControl } from "./completion-control";
import { TagIndicator } from "./tag-indicator";

export interface TaskRowProps {
  tarea: Tarea;
  ahora: MomentoLocal;
  etiquetasPorId: ReadonlyMap<string, Etiqueta>;
  seleccionada: boolean;
  /** «agenda» añade la columna de hora a la izquierda. */
  variante?: "lista" | "agenda";
  /** En los grupos por día de la agenda la fecha ya está implícita. */
  mostrarFecha?: boolean;
  marcadorAhora?: "antes" | "despues" | null;
  onAlternar: (tarea: Tarea) => void;
  onAbrir: (tarea: Tarea, origen: HTMLElement) => void;
  ref?: React.Ref<HTMLLIElement>;
}

function MarcadorAhora({ hora }: { hora: string }) {
  return (
    <div role="separator" aria-label={`Ahora, ${hora}`} className="flex items-center gap-2 py-1">
      <span className="w-12 pl-1 text-[12px] leading-4 font-semibold text-accent numeros-tabulares">{hora}</span>
      <span aria-hidden className="size-1.5 rounded-full bg-accent" />
      <span aria-hidden className="h-px flex-1 bg-accent/50" />
    </div>
  );
}

const segundos = (ms: number) => ms / 1000;

export function TaskRow({
  tarea,
  ahora,
  etiquetasPorId,
  seleccionada,
  variante = "lista",
  mostrarFecha = true,
  marcadorAhora = null,
  onAlternar,
  onAbrir,
  ref,
}: TaskRowProps) {
  const vencimiento = mostrarFecha ? describirVencimiento(tarea, ahora) : null;
  const vencidaEnElDia = !mostrarFecha && estaVencida(tarea, ahora);
  const etiquetas = etiquetasDeTarea(tarea, etiquetasPorId);
  const tieneMeta = vencimiento !== null || vencidaEnElDia || etiquetas.length > 0 || tarea.descripcion !== null;
  const conColumnaHora = variante === "agenda";

  const claseVencimiento =
    vencimiento === null || tarea.completada
      ? ""
      : vencimiento.estado === "vencida"
        ? "font-medium text-danger"
        : vencimiento.estado === "hoy"
          ? "text-accent"
          : "";

  return (
    <motion.li
      ref={ref}
      layout="position"
      initial={{ opacity: 0, y: -movimiento.desplazamiento.fila }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: segundos(movimiento.duracion.inmediata) } }}
      transition={{ duration: segundos(movimiento.duracion.normal), ease: movimiento.curva.entrada }}
      className={`relative after:absolute after:right-0 after:bottom-0 after:h-px after:bg-line last:after:hidden ${
        conColumnaHora ? "after:left-[5.75rem]" : "after:left-11"
      }`}
    >
      {marcadorAhora === "antes" && <MarcadorAhora hora={ahora.hora} />}
      <div
        className={`flex items-start rounded-control transition-colors duration-(--k-duracion-inmediata) ${
          seleccionada ? "bg-accent-soft" : "hover:bg-surface-2/70"
        }`}
      >
        {conColumnaHora && (
          <span className="w-12 shrink-0 pt-[13px] pl-1 text-[13px] leading-[18px] text-fg-muted numeros-tabulares">
            {mostrarFecha ? "" : (tarea.horaVencimiento ?? "")}
          </span>
        )}
        <CompletionControl completada={tarea.completada} titulo={tarea.titulo} onAlternar={() => onAlternar(tarea)} />
        <button
          type="button"
          data-tarea-id={tarea.id}
          aria-current={seleccionada ? "true" : undefined}
          onClick={(evento) => onAbrir(tarea, evento.currentTarget)}
          className="min-w-0 flex-1 rounded-control py-[11px] pr-3 text-left"
        >
          <span
            data-tachado={tarea.completada}
            className={`tachado-animado block text-[16px] leading-6 break-words sm:text-[15px] sm:leading-[22px] ${
              tarea.completada ? "text-fg-muted" : "text-fg"
            }`}
          >
            {tarea.titulo}
          </span>
          {tieneMeta && (
            <span className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px] leading-[18px] text-fg-muted">
              {vencimiento && (
                <span className={`inline-flex items-center gap-1 numeros-tabulares ${claseVencimiento}`}>
                  {vencimiento.estado === "vencida" && <CircleAlert size={13} strokeWidth={2} aria-hidden />}
                  {vencimiento.estado === "vencida" ? `Vencida · ${vencimiento.texto}` : vencimiento.texto}
                </span>
              )}
              {vencidaEnElDia && (
                <span className="inline-flex items-center gap-1 font-medium text-danger">
                  <CircleAlert size={13} strokeWidth={2} aria-hidden />
                  Vencida
                </span>
              )}
              <TagIndicator etiquetas={etiquetas} />
              {tarea.descripcion !== null && (
                <span className="inline-flex items-center">
                  <TextAlignStart size={13} strokeWidth={1.75} aria-hidden />
                  <span className="sr-only">Tiene nota</span>
                </span>
              )}
            </span>
          )}
        </button>
      </div>
      {marcadorAhora === "despues" && <MarcadorAhora hora={ahora.hora} />}
    </motion.li>
  );
}
