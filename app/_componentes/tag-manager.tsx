"use client";

import { Plus, Trash } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { usePanel } from "@/app/_estado/panel-contextual";
import { useKairo } from "@/app/_estado/proveedor-kairo";
import { useBorrador } from "@/app/_estado/use-borrador";
import { contarTareasPorEtiqueta, ordenarEtiquetas } from "@/lib/dominio/etiquetas";
import { nombresColorEtiqueta } from "@/lib/diseno/tokens";
import { COLORES_ETIQUETA, type Etiqueta } from "@/lib/tipos/etiqueta";
import { PanelHeader } from "./panel-header";
import { IconButton } from "./primitivas/icon-button";
import { colorDeEtiqueta } from "./tag-indicator";

function FilaEtiqueta({ etiqueta, cantidad }: { etiqueta: Etiqueta; cantidad: number }) {
  const { actualizarEtiqueta, eliminarEtiqueta } = useKairo();
  const [nombre, setNombre] = useBorrador(etiqueta.nombre);
  const [error, setError] = useState<string | null>(null);
  const [paleta, setPaleta] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  const guardarNombre = () => {
    if (nombre === etiqueta.nombre) return true;
    const resultado = actualizarEtiqueta(etiqueta.id, { nombre });
    if (!resultado.ok) {
      setError(resultado.error.mensaje);
      return false;
    }
    setError(null);
    return true;
  };

  return (
    <motion.li layout="position" exit={{ opacity: 0, transition: { duration: 0.14 } }} className="border-b border-line">
      <div className="flex items-center gap-1 py-0.5">
        <button
          type="button"
          aria-label={`Color de ${etiqueta.nombre}: ${nombresColorEtiqueta[etiqueta.color]}`}
          aria-expanded={paleta}
          onClick={() => setPaleta((visible) => !visible)}
          className="grid size-11 shrink-0 place-items-center rounded-control hover:bg-surface-2"
        >
          <span aria-hidden className="size-3 rounded-full" style={{ background: colorDeEtiqueta(etiqueta.color) }} />
        </button>
        <input
          value={nombre}
          maxLength={40}
          aria-label={`Nombre de la etiqueta ${etiqueta.nombre}`}
          aria-invalid={error ? true : undefined}
          onChange={(evento) => {
            setNombre(evento.target.value);
            setError(null);
          }}
          onKeyDown={(evento) => {
            if (evento.key === "Enter") {
              evento.preventDefault();
              if (guardarNombre()) evento.currentTarget.blur();
            }
            if (evento.key === "Escape" && nombre !== etiqueta.nombre) {
              evento.preventDefault();
              evento.stopPropagation();
              setNombre(etiqueta.nombre);
              setError(null);
            }
          }}
          onBlur={() => {
            if (!guardarNombre()) {
              setNombre(etiqueta.nombre);
            }
          }}
          className="campo h-10 min-w-0 flex-1 rounded-control bg-transparent px-2 text-[16px] hover:bg-surface-2/60 focus-visible:bg-surface-2 sm:text-[15px]"
        />
        <span className="shrink-0 px-1 text-[13px] text-fg-muted numeros-tabulares">
          {cantidad} {cantidad === 1 ? "tarea" : "tareas"}
        </span>
        <IconButton icono={Trash} etiqueta={`Eliminar ${etiqueta.nombre}`} tamanoIcono={16} onClick={() => setConfirmando(true)} />
      </div>
      {error && (
        <p role="alert" className="pb-2 pl-12 text-[13px] text-danger">
          {error}
        </p>
      )}
      <AnimatePresence initial={false}>
        {paleta && (
          <motion.fieldset
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
            className="overflow-hidden"
          >
            <legend className="sr-only">Color de {etiqueta.nombre}</legend>
            <div className="flex flex-wrap gap-0.5 pb-2 pl-9">
              {COLORES_ETIQUETA.map((color) => (
                <label key={color} className="grid size-10 cursor-pointer place-items-center rounded-control hover:bg-surface-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus">
                  <input
                    type="radio"
                    name={`color-${etiqueta.id}`}
                    className="peer sr-only"
                    checked={etiqueta.color === color}
                    onChange={() => actualizarEtiqueta(etiqueta.id, { color })}
                    aria-label={nombresColorEtiqueta[color]}
                  />
                  <span
                    aria-hidden
                    className="size-4 rounded-full ring-offset-2 ring-offset-surface peer-checked:ring-2 peer-checked:ring-fg"
                    style={{ background: colorDeEtiqueta(color) }}
                  />
                </label>
              ))}
            </div>
          </motion.fieldset>
        )}
      </AnimatePresence>
      {confirmando && (
        <div role="group" aria-label={`Confirmar eliminación de ${etiqueta.nombre}`} className="flex flex-wrap items-center gap-x-2 gap-y-1 pb-3 pl-12">
          <p className="w-full text-[14px]">
            ¿Eliminar «{etiqueta.nombre}»? {cantidad > 0 ? "Las tareas se conservan." : ""}
          </p>
          <button
            type="button"
            autoFocus
            onClick={() => eliminarEtiqueta(etiqueta.id)}
            className="h-10 rounded-control bg-danger px-3 text-[14px] font-semibold text-bg"
          >
            Eliminar
          </button>
          <button type="button" onClick={() => setConfirmando(false)} className="h-10 rounded-control px-3 text-[14px] text-fg-muted hover:bg-surface-2 hover:text-fg">
            Cancelar
          </button>
        </div>
      )}
    </motion.li>
  );
}

/** Crear, renombrar, recolorear y eliminar etiquetas. Vive en el panel contextual. */
export function TagManager({ modo }: { modo: "acoplado" | "superpuesto" }) {
  const { etiquetas, tareas, crearEtiqueta } = useKairo();
  const { cerrar } = usePanel();
  const ruta = usePathname();
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState<string | null>(null);
  const ordenadas = useMemo(() => ordenarEtiquetas(etiquetas), [etiquetas]);
  const conteo = useMemo(() => contarTareasPorEtiqueta(tareas), [tareas]);

  const crear = (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!nombre.trim()) return;
    const resultado = crearEtiqueta(nombre);
    if (!resultado.ok) {
      setError(resultado.error.mensaje);
      return;
    }
    setNombre("");
    setError(null);
  };

  return (
    <div className="flex h-full flex-col bg-surface">
      <PanelHeader modo={modo} volverA={ruta.startsWith("/agenda") ? "Agenda" : "Tareas"} titulo="Etiquetas" onCerrar={cerrar} />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-3 pb-10 sm:px-4">
        <h2 className="px-1 pb-3 text-[20px] leading-7 font-semibold sm:hidden">Etiquetas</h2>
        <form onSubmit={crear} aria-label="Nueva etiqueta">
          <div className="flex h-11 items-center rounded-control border border-line bg-surface has-[input:focus-visible]:border-accent has-[input:focus-visible]:shadow-[0_0_0_1px_var(--k-focus)]">
            <span aria-hidden className="grid size-10 place-items-center text-fg-muted">
              <Plus size={16} strokeWidth={1.75} />
            </span>
            <label htmlFor="nueva-etiqueta" className="sr-only">
              Nueva etiqueta
            </label>
            <input
              id="nueva-etiqueta"
              value={nombre}
              maxLength={40}
              autoComplete="off"
              enterKeyHint="enter"
              placeholder="Nueva etiqueta"
              onChange={(evento) => {
                setNombre(evento.target.value);
                setError(null);
              }}
              className="h-full min-w-0 flex-1 bg-transparent pr-3 text-[16px] focus-visible:outline-none sm:text-[15px]"
            />
          </div>
          {error && (
            <p role="alert" className="mt-1.5 px-1 text-[13px] text-danger">
              {error}
            </p>
          )}
        </form>
        {ordenadas.length === 0 ? (
          <p className="px-1 py-8 text-center text-[14px] text-fg-muted">Aún no hay etiquetas.</p>
        ) : (
          <ul aria-label="Etiquetas" className="mt-3">
            <AnimatePresence initial={false}>
              {ordenadas.map((etiqueta) => (
                <FilaEtiqueta key={etiqueta.id} etiqueta={etiqueta} cantidad={conteo.get(etiqueta.id) ?? 0} />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
