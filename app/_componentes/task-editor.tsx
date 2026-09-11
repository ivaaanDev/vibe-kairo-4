"use client";

import { Calendar, Clock, Plus, Tag, Trash, X, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useId, useLayoutEffect, useRef, useState } from "react";
import { usePanel } from "@/app/_estado/panel-contextual";
import { useKairo } from "@/app/_estado/proveedor-kairo";
import { useAhora } from "@/app/_estado/use-ahora";
import { useBorrador } from "@/app/_estado/use-borrador";
import { useDebounced } from "@/app/_estado/use-debounced";
import { etiquetasDeTarea } from "@/lib/dominio/etiquetas";
import { esFechaValida, esHoraValida, momentoLocalDesde, sumarDias } from "@/lib/dominio/fecha-local";
import { fechaCorta } from "@/lib/dominio/formato-fecha";
import { longitud } from "@/lib/dominio/texto";
import { LIMITES_TAREA, validarTitulo } from "@/lib/dominio/validacion-tarea";
import { diaRelativo, estaVencida } from "@/lib/dominio/vencimiento";
import type { Tarea } from "@/lib/tipos/tarea";
import { CompletionControl } from "./completion-control";
import { ChipButton } from "./primitivas/chip-button";
import { IconButton } from "./primitivas/icon-button";
import { TagPicker } from "./tag-picker";
import { colorDeEtiqueta } from "./tag-indicator";

/** Ajusta la altura de un textarea a su contenido. */
function useAutoTamano(ref: React.RefObject<HTMLTextAreaElement | null>, valor: string) {
  useLayoutEffect(() => {
    const campo = ref.current;
    if (!campo) return;
    campo.style.height = "auto";
    campo.style.height = `${campo.scrollHeight}px`;
  }, [ref, valor]);
}

function FilaPropiedad({
  icono: Icono,
  etiqueta,
  htmlFor,
  children,
}: {
  icono: LucideIcon;
  etiqueta: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  const Rotulo = htmlFor ? "label" : "span";
  return (
    <div className="flex items-start gap-3 border-b border-line py-2">
      <Rotulo htmlFor={htmlFor} className="flex h-10 w-24 shrink-0 items-center gap-2 text-[14px] text-fg-muted">
        <Icono size={16} strokeWidth={1.75} aria-hidden />
        {etiqueta}
      </Rotulo>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

const CLASE_CAMPO =
  "campo h-10 rounded-control border border-line bg-surface px-2.5 text-[16px] text-fg sm:text-[15px] focus-visible:border-accent focus-visible:outline-1 focus-visible:outline-focus";

export function TaskEditor({ tarea }: { tarea: Tarea }) {
  const { actualizarTarea, eliminarTarea, etiquetasPorId } = useKairo();
  const { cerrar } = usePanel();
  const ahora = useAhora();
  const id = useId();

  // ─── Título ───
  const [titulo, setTitulo] = useBorrador(tarea.titulo);
  const [errorTitulo, setErrorTitulo] = useState<string | null>(null);
  const campoTitulo = useRef<HTMLTextAreaElement>(null);
  useAutoTamano(campoTitulo, titulo);
  const guardarTitulo = useDebounced((valor: string) => {
    const resultado = validarTitulo(valor);
    if (!resultado.ok) {
      setErrorTitulo(resultado.error.mensaje);
      return;
    }
    setErrorTitulo(null);
    if (resultado.valor !== tarea.titulo) actualizarTarea(tarea.id, { titulo: resultado.valor });
  }, 400);

  // ─── Descripción ───
  const [descripcion, setDescripcion] = useBorrador(tarea.descripcion ?? "");
  const campoDescripcion = useRef<HTMLTextAreaElement>(null);
  useAutoTamano(campoDescripcion, descripcion);
  const guardarDescripcion = useDebounced((valor: string) => {
    if ((valor.trim() || null) !== tarea.descripcion) actualizarTarea(tarea.id, { descripcion: valor });
  }, 500);
  const caracteresDescripcion = longitud(descripcion);

  // ─── Fecha y hora ───
  const [borradorFecha, setBorradorFecha] = useBorrador(tarea.fechaVencimiento ?? "");
  const [borradorHora, setBorradorHora] = useBorrador(tarea.horaVencimiento ?? "");
  const [eligiendoFecha, setEligiendoFecha] = useState(false);
  const [eligiendoHora, setEligiendoHora] = useState(false);
  const campoFecha = useRef<HTMLInputElement>(null);
  const campoHora = useRef<HTMLInputElement>(null);

  const revelar = (campo: React.RefObject<HTMLInputElement | null>) =>
    requestAnimationFrame(() => {
      campo.current?.focus();
      try {
        campo.current?.showPicker();
      } catch {
        // showPicker no está disponible en todos los navegadores; el foco basta.
      }
    });

  // ─── Etiquetas ───
  const [eligiendoEtiquetas, setEligiendoEtiquetas] = useState(false);
  const asignadas = etiquetasDeTarea(tarea, etiquetasPorId);

  // ─── Eliminar ───
  const [confirmando, setConfirmando] = useState(false);

  const vencida = ahora ? estaVencida(tarea, ahora) : false;
  const creada = momentoLocalDesde(new Date(tarea.creadaEn)).fecha;
  const completadaEl = tarea.completadaEn ? momentoLocalDesde(new Date(tarea.completadaEn)).fecha : null;
  const referencia = ahora?.fecha ?? creada;

  return (
    <div className="px-3 pt-3 pb-10 sm:px-4">
      <div className="flex items-start gap-1">
        <CompletionControl
          completada={tarea.completada}
          titulo={tarea.titulo}
          onAlternar={() => actualizarTarea(tarea.id, { completada: !tarea.completada })}
        />
        <textarea
          ref={campoTitulo}
          rows={1}
          value={titulo}
          maxLength={LIMITES_TAREA.tituloMaximo}
          aria-label="Título"
          aria-invalid={errorTitulo ? true : undefined}
          aria-describedby={errorTitulo ? `${id}-error-titulo` : undefined}
          onChange={(evento) => {
            const valor = evento.target.value.replace(/[\r\n]+/g, " ");
            setTitulo(valor);
            guardarTitulo.programar(valor);
          }}
          onKeyDown={(evento) => {
            if (evento.key === "Enter") {
              evento.preventDefault();
              evento.currentTarget.blur();
            }
          }}
          onBlur={() => {
            if (!validarTitulo(titulo).ok) {
              guardarTitulo.cancelar();
              setTitulo(tarea.titulo);
              setErrorTitulo(null);
              return;
            }
            guardarTitulo.flush();
          }}
          data-tachado={tarea.completada}
          className={`campo tachado-animado min-w-0 flex-1 resize-none overflow-hidden rounded-control bg-transparent px-1 py-2 text-[20px] leading-7 font-semibold tracking-[-0.01em] focus-visible:bg-surface-2/60 ${
            tarea.completada ? "text-fg-muted" : "text-fg"
          }`}
        />
      </div>
      {errorTitulo && (
        <p id={`${id}-error-titulo`} role="alert" className="ml-12 text-[13px] text-danger">
          {errorTitulo}
        </p>
      )}

      <div className="ml-12">
        <textarea
          ref={campoDescripcion}
          rows={2}
          value={descripcion}
          maxLength={LIMITES_TAREA.descripcionMaxima}
          placeholder="Añade una nota"
          aria-label="Descripción"
          onChange={(evento) => {
            setDescripcion(evento.target.value);
            guardarDescripcion.programar(evento.target.value);
          }}
          onBlur={() => guardarDescripcion.flush()}
          className="campo mt-1 block min-h-16 w-full resize-none overflow-hidden rounded-control bg-transparent px-1 py-1.5 text-[16px] leading-6 text-fg focus-visible:bg-surface-2/60 sm:text-[15px] sm:leading-[22px]"
        />
        {caracteresDescripcion >= LIMITES_TAREA.descripcionMaxima - 100 && (
          <p aria-live="polite" className="px-1 text-right text-[12px] text-fg-muted numeros-tabulares">
            {caracteresDescripcion}/{LIMITES_TAREA.descripcionMaxima}
          </p>
        )}
      </div>

      <section aria-label="Propiedades" className="mt-5 border-t border-line">
        <FilaPropiedad icono={Calendar} etiqueta="Fecha" htmlFor={tarea.fechaVencimiento || eligiendoFecha ? `${id}-fecha` : undefined}>
          {tarea.fechaVencimiento || eligiendoFecha ? (
            <div className="flex items-center gap-x-1">
              <input
                ref={campoFecha}
                id={`${id}-fecha`}
                type="date"
                value={borradorFecha}
                onChange={(evento) => {
                  setBorradorFecha(evento.target.value);
                  if (esFechaValida(evento.target.value)) {
                    actualizarTarea(tarea.id, { fechaVencimiento: evento.target.value });
                    setEligiendoFecha(false);
                  }
                }}
                onBlur={() => {
                  setBorradorFecha(tarea.fechaVencimiento ?? "");
                  if (!tarea.fechaVencimiento) setEligiendoFecha(false);
                }}
                className={`${CLASE_CAMPO} min-w-0`}
              />
              {tarea.fechaVencimiento && (
                <IconButton
                  icono={X}
                  etiqueta="Quitar fecha"
                  tamanoIcono={16}
                  onClick={() => actualizarTarea(tarea.id, { fechaVencimiento: null })}
                />
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5 py-0.5">
              <ChipButton disabled={!ahora} onClick={() => ahora && actualizarTarea(tarea.id, { fechaVencimiento: ahora.fecha })}>
                Hoy
              </ChipButton>
              <ChipButton
                disabled={!ahora}
                onClick={() => ahora && actualizarTarea(tarea.id, { fechaVencimiento: sumarDias(ahora.fecha, 1) })}
              >
                Mañana
              </ChipButton>
              <ChipButton
                onClick={() => {
                  setEligiendoFecha(true);
                  revelar(campoFecha);
                }}
              >
                Elegir fecha
              </ChipButton>
            </div>
          )}
          {tarea.fechaVencimiento && ahora && (
            <p className={`mt-1 px-0.5 text-[13px] ${vencida ? "font-medium text-danger" : "text-fg-muted"}`}>
              {vencida ? "Vencida · " : ""}
              {diaRelativo(tarea.fechaVencimiento, ahora)}
            </p>
          )}
        </FilaPropiedad>

        <AnimatePresence initial={false}>
          {tarea.fechaVencimiento && (
            <motion.div
              key="hora"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
              className="overflow-hidden"
            >
              <FilaPropiedad icono={Clock} etiqueta="Hora" htmlFor={tarea.horaVencimiento || eligiendoHora ? `${id}-hora` : undefined}>
                {tarea.horaVencimiento || eligiendoHora ? (
                  <div className="flex items-center gap-x-1">
                    <input
                      ref={campoHora}
                      id={`${id}-hora`}
                      type="time"
                      value={borradorHora}
                      onChange={(evento) => {
                        setBorradorHora(evento.target.value);
                        if (esHoraValida(evento.target.value)) {
                          actualizarTarea(tarea.id, { horaVencimiento: evento.target.value });
                          setEligiendoHora(false);
                        }
                      }}
                      onBlur={() => {
                        setBorradorHora(tarea.horaVencimiento ?? "");
                        if (!tarea.horaVencimiento) setEligiendoHora(false);
                      }}
                      className={CLASE_CAMPO}
                    />
                    {tarea.horaVencimiento && (
                      <IconButton
                        icono={X}
                        etiqueta="Quitar hora"
                        tamanoIcono={16}
                        onClick={() => actualizarTarea(tarea.id, { horaVencimiento: null })}
                      />
                    )}
                  </div>
                ) : (
                  <div className="py-0.5">
                    <ChipButton
                      onClick={() => {
                        setEligiendoHora(true);
                        revelar(campoHora);
                      }}
                    >
                      Añadir hora
                    </ChipButton>
                  </div>
                )}
              </FilaPropiedad>
            </motion.div>
          )}
        </AnimatePresence>

        <FilaPropiedad icono={Tag} etiqueta="Etiquetas">
          <div className="flex flex-wrap items-center gap-1.5 py-0.5">
            {asignadas.map((etiqueta) => (
              <button
                key={etiqueta.id}
                type="button"
                aria-label={`Quitar etiqueta ${etiqueta.nombre}`}
                onClick={() => actualizarTarea(tarea.id, { etiquetaIds: tarea.etiquetaIds.filter((otra) => otra !== etiqueta.id) })}
                className="group/chip inline-flex h-9 max-w-full items-center gap-1.5 rounded-control border border-line bg-surface pr-2 pl-2.5 text-[14px] hover:border-line-strong"
              >
                <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: colorDeEtiqueta(etiqueta.color) }} />
                <span className="truncate">{etiqueta.nombre}</span>
                <X size={14} strokeWidth={2} aria-hidden className="shrink-0 text-fg-muted group-hover/chip:text-fg" />
              </button>
            ))}
            <ChipButton aria-expanded={eligiendoEtiquetas} onClick={() => setEligiendoEtiquetas((visible) => !visible)}>
              <Plus size={14} strokeWidth={2} aria-hidden />
              {asignadas.length > 0 ? "Añadir" : "Añadir etiqueta"}
            </ChipButton>
          </div>
          {eligiendoEtiquetas && <TagPicker tarea={tarea} onCerrar={() => setEligiendoEtiquetas(false)} />}
        </FilaPropiedad>
      </section>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <p className="text-[13px] text-fg-muted">
          Creada el {fechaCorta(creada, referencia)}
          {completadaEl && ` · Completada el ${fechaCorta(completadaEl, referencia)}`}
        </p>
        {confirmando ? (
          <div role="group" aria-label="Confirmar eliminación" className="flex items-center gap-1.5">
            <span className="text-[14px]">¿Eliminar esta tarea?</span>
            <button
              type="button"
              autoFocus
              onClick={() => {
                cerrar();
                eliminarTarea(tarea.id);
              }}
              className="h-10 rounded-control bg-danger px-3 text-[14px] font-semibold text-bg"
            >
              Eliminar
            </button>
            <button type="button" onClick={() => setConfirmando(false)} className="h-10 rounded-control px-3 text-[14px] text-fg-muted hover:bg-surface-2 hover:text-fg">
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            className="-mr-2 inline-flex h-11 items-center gap-2 rounded-control px-2 text-[14px] text-danger hover:bg-surface-2"
          >
            <Trash size={16} strokeWidth={1.75} aria-hidden />
            Eliminar tarea
          </button>
        )}
      </footer>
    </div>
  );
}
