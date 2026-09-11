"use client";

import { AnimatePresence, motion, useDragControls } from "motion/react";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useCapaModal, useMontado } from "@/app/_estado/capas-modales";
import { enfocarCuandoSeaPosible } from "@/app/_estado/foco";
import { useEsMedio } from "@/app/_estado/use-media-query";
import { movimiento } from "@/lib/diseno/tokens";

/*
 * Una misma función, dos superficies:
 * - ≥ 640 px: popover anclado al control que lo abre (no modal).
 * - < 640 px: sheet inferior, modal, que se cierra deslizando hacia abajo.
 * Equivalente en React Native: Popover → Bottom Sheet.
 */

export type PosicionPopover = "abajo-fin" | "abajo-inicio" | "derecha-fin";

interface AdaptiveSurfaceProps {
  abierta: boolean;
  onCerrar: () => void;
  anclaRef: RefObject<HTMLElement | null>;
  /** Nombre accesible de la superficie. */
  etiqueta: string;
  /** Encabezado visible en el sheet. */
  titulo?: string;
  posicion?: PosicionPopover;
  ancho?: number;
  rol?: "dialog" | "menu";
  children: React.ReactNode;
}

const SELECTOR_ENFOCABLE =
  'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

const segundos = (ms: number) => ms / 1000;

function calcularPosicion(ancla: DOMRect, posicion: PosicionPopover, ancho: number): React.CSSProperties {
  const margen = 8;
  const maxIzquierda = window.innerWidth - ancho - margen;
  switch (posicion) {
    case "abajo-fin":
      return { top: ancla.bottom + 6, left: Math.max(margen, Math.min(ancla.right - ancho, maxIzquierda)) };
    case "abajo-inicio":
      return { top: ancla.bottom + 6, left: Math.max(margen, Math.min(ancla.left, maxIzquierda)) };
    case "derecha-fin":
      return { bottom: Math.max(margen, window.innerHeight - ancla.bottom), left: Math.min(ancla.right + 8, maxIzquierda) };
  }
}

export function AdaptiveSurface({
  abierta,
  onCerrar,
  anclaRef,
  etiqueta,
  titulo,
  posicion = "abajo-fin",
  ancho = 280,
  rol = "dialog",
  children,
}: AdaptiveSurfaceProps) {
  const montado = useMontado();
  const esMedio = useEsMedio();
  const esSheet = !esMedio;
  const superficieRef = useRef<HTMLDivElement>(null);
  const [estilo, setEstilo] = useState<React.CSSProperties>({});
  const controlesArrastre = useDragControls();
  const idTitulo = useId();

  useCapaModal(abierta && esSheet);

  const reposicionar = useCallback(() => {
    const ancla = anclaRef.current;
    if (ancla) setEstilo(calcularPosicion(ancla.getBoundingClientRect(), posicion, ancho));
  }, [anclaRef, posicion, ancho]);

  useLayoutEffect(() => {
    if (!abierta || esSheet) return;
    reposicionar();
    window.addEventListener("resize", reposicionar);
    window.addEventListener("scroll", reposicionar, true);
    return () => {
      window.removeEventListener("resize", reposicionar);
      window.removeEventListener("scroll", reposicionar, true);
    };
  }, [abierta, esSheet, reposicionar]);

  // Foco inicial dentro de la superficie y retorno al ancla al cerrar.
  useEffect(() => {
    if (!abierta) return;
    const ancla = anclaRef.current;
    let superficie: HTMLDivElement | null = null;
    const marco = requestAnimationFrame(() => {
      superficie = superficieRef.current;
      const primero =
        superficie?.querySelector<HTMLElement>("[data-foco-inicial]") ?? superficie?.querySelector<HTMLElement>(SELECTOR_ENFOCABLE);
      (primero ?? superficie)?.focus();
    });
    return () => {
      cancelAnimationFrame(marco);
      const activo = document.activeElement;
      if (!activo || activo === document.body || superficie?.contains(activo)) {
        // En móvil el sheet es modal: el ancla sigue `inert` hasta que la capa se retira.
        enfocarCuandoSeaPosible(ancla);
      }
    };
  }, [abierta, anclaRef]);

  // Clic fuera cierra el popover (el sheet tiene su propio velo).
  useEffect(() => {
    if (!abierta || esSheet) return;
    const alPresionar = (evento: PointerEvent) => {
      const objetivo = evento.target as Node;
      if (superficieRef.current?.contains(objetivo) || anclaRef.current?.contains(objetivo)) return;
      onCerrar();
    };
    document.addEventListener("pointerdown", alPresionar);
    return () => document.removeEventListener("pointerdown", alPresionar);
  }, [abierta, esSheet, anclaRef, onCerrar]);

  const alPulsarTecla = (evento: React.KeyboardEvent) => {
    if (evento.key === "Escape") {
      evento.preventDefault();
      evento.stopPropagation();
      onCerrar();
    }
  };

  if (!montado) return null;

  const accesibilidad = {
    role: rol,
    "aria-label": titulo && esSheet ? undefined : etiqueta,
    "aria-labelledby": titulo && esSheet ? idTitulo : undefined,
    "aria-modal": esSheet ? true : undefined,
    tabIndex: -1,
    onKeyDown: alPulsarTecla,
  } as const;

  return createPortal(
    <AnimatePresence>
      {abierta &&
        (esSheet ? (
          <motion.div key="sheet" className="fixed inset-0 z-50" initial={{ opacity: 1 }} exit={{ opacity: 1 }}>
            <motion.div
              aria-hidden
              className="absolute inset-0 bg-scrim"
              onClick={onCerrar}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: segundos(movimiento.duracion.panel) }}
            />
            <motion.div
              ref={superficieRef}
              {...accesibilidad}
              className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-sheet border-t border-line bg-surface relleno-seguro-inferior"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: segundos(movimiento.duracion.panel), ease: movimiento.curva.estandar }}
              drag="y"
              dragListener={false}
              dragControls={controlesArrastre}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 80 || info.velocity.y > 600) onCerrar();
              }}
            >
              <div
                className="flex h-6 shrink-0 cursor-grab touch-none items-center justify-center"
                onPointerDown={(evento) => controlesArrastre.start(evento)}
                aria-hidden
              >
                <span className="h-1 w-9 rounded-full bg-line-strong/60" />
              </div>
              {titulo && (
                <h2 id={idTitulo} className="px-5 pb-2 text-[15px] font-semibold">
                  {titulo}
                </h2>
              )}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-3">{children}</div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="popover"
            ref={superficieRef}
            {...accesibilidad}
            style={{ ...estilo, width: ancho }}
            className="fixed z-50 max-h-[min(70dvh,480px)] overflow-y-auto rounded-panel border border-line bg-surface p-1.5 shadow-[0_8px_24px_-12px_rgb(0_0_0/0.18),0_1px_2px_rgb(0_0_0/0.06)]"
            initial={{ opacity: 0, scale: 0.98, y: posicion === "derecha-fin" ? 0 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: segundos(movimiento.duracion.inmediata) } }}
            transition={{ duration: segundos(movimiento.duracion.normal), ease: movimiento.curva.entrada }}
          >
            {children}
          </motion.div>
        ))}
    </AnimatePresence>,
    document.body,
  );
}
