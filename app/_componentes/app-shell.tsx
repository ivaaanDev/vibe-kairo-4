"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ProveedorCapas, useCapaModal, useFondoInerte, useMontado } from "@/app/_estado/capas-modales";
import { ProveedorPanel, usePanel, type PanelContextual } from "@/app/_estado/panel-contextual";
import { useEsAmplio, useEsMedio } from "@/app/_estado/use-media-query";
import { medidas, movimiento } from "@/lib/diseno/tokens";
import { ProveedorViajeEnElTiempo } from "./huevos-de-pascua/viaje-en-el-tiempo/contexto";
import { MobileNavigation } from "./mobile-navigation";
import { NavigationRail } from "./navigation-rail";
import { NoticeBanner } from "./notice-banner";
import { TagManager } from "./tag-manager";
import { TaskInspector } from "./task-inspector";

const segundos = (ms: number) => ms / 1000;

/** Conserva el último panel abierto para poder animar su salida con contenido. */
function useUltimoPanel(panel: PanelContextual): Exclude<PanelContextual, null> | null {
  const [ultimo, setUltimo] = useState<Exclude<PanelContextual, null> | null>(panel);
  if (panel && panel !== ultimo) setUltimo(panel);
  return panel ?? ultimo;
}

function ContenidoPanel({ panel, modo }: { panel: Exclude<PanelContextual, null>; modo: "acoplado" | "superpuesto" }) {
  const contenedor = useRef<HTMLDivElement>(null);
  const clave = panel.tipo === "tarea" ? panel.id : "etiquetas";

  // Al abrir, el foco entra en el panel para que el teclado continúe ahí.
  useEffect(() => {
    contenedor.current?.focus({ preventScroll: true });
  }, [clave]);

  return (
    <div ref={contenedor} tabIndex={-1} className="h-full focus-visible:outline-none">
      {panel.tipo === "tarea" ? <TaskInspector id={panel.id} modo={modo} /> : <TagManager modo={modo} />}
    </div>
  );
}

function etiquetaPanel(panel: Exclude<PanelContextual, null>): string {
  return panel.tipo === "tarea" ? "Detalle de la tarea" : "Etiquetas";
}

/** ≥ 1024 px: inspector acoplado a la derecha; la lista sigue visible y utilizable. */
function PanelAcoplado() {
  const { panel } = usePanel();
  const mostrado = useUltimoPanel(panel);
  return (
    <AnimatePresence initial={false}>
      {panel && mostrado && (
        <motion.aside
          key="inspector"
          aria-label={etiquetaPanel(mostrado)}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: medidas.anchoInspector, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: segundos(movimiento.duracion.panel), ease: movimiento.curva.estandar }}
          className="h-full shrink-0 overflow-hidden border-l border-line bg-surface"
        >
          <div className="h-full" style={{ width: medidas.anchoInspector }}>
            <ContenidoPanel panel={mostrado} modo="acoplado" />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/**
 * < 1024 px: el panel se superpone. En móvil entra desde la derecha como una pantalla
 * apilada; en tableta, como un panel lateral con velo.
 */
function PanelSuperpuesto() {
  const { panel, cerrar } = usePanel();
  const mostrado = useUltimoPanel(panel);
  const esMedio = useEsMedio();
  const montado = useMontado();
  useCapaModal(panel !== null);

  if (!montado) return null;

  const desplazamiento = esMedio ? { x: movimiento.desplazamiento.panel, opacity: 0 } : { x: "100%", opacity: 1 };

  return createPortal(
    <AnimatePresence>
      {panel && mostrado && (
        <motion.div key="capa" className="fixed inset-0 z-40" initial={{ opacity: 1 }} exit={{ opacity: 1 }}>
          {esMedio && (
            <motion.div
              aria-hidden
              className="absolute inset-0 bg-scrim"
              onClick={cerrar}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: segundos(movimiento.duracion.panel) }}
            />
          )}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={etiquetaPanel(mostrado)}
            onKeyDown={(evento) => {
              if (evento.key === "Escape" && !evento.defaultPrevented) {
                evento.preventDefault();
                cerrar();
              }
            }}
            initial={desplazamiento}
            animate={{ x: 0, opacity: 1 }}
            exit={desplazamiento}
            transition={{ duration: segundos(movimiento.duracion.panel), ease: movimiento.curva.estandar }}
            className="absolute inset-y-0 right-0 flex w-full flex-col bg-surface pt-[env(safe-area-inset-top)] relleno-seguro-inferior sm:w-[420px] sm:border-l sm:border-line sm:shadow-[-12px_0_32px_-24px_rgb(0_0_0/0.3)]"
          >
            <ContenidoPanel panel={mostrado} modo="superpuesto" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function Estructura({ children }: { children: React.ReactNode }) {
  const fondoInerte = useFondoInerte();
  const esAmplio = useEsAmplio();
  const { panel, cerrar } = usePanel();

  // Escape cierra el inspector acoplado (los popovers detienen el evento antes).
  useEffect(() => {
    if (!panel || !esAmplio) return;
    const alPulsarTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape" && !evento.defaultPrevented) cerrar();
    };
    window.addEventListener("keydown", alPulsarTecla);
    return () => window.removeEventListener("keydown", alPulsarTecla);
  }, [panel, esAmplio, cerrar]);

  return (
    <>
      <div inert={fondoInerte} className="flex h-dvh overflow-hidden bg-bg">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-control focus:bg-surface focus:px-3 focus:py-2"
        >
          Saltar al contenido
        </a>
        <NavigationRail />
        <main id="contenido" className="min-w-0 flex-1 overflow-y-auto pb-[calc(3.5rem+env(safe-area-inset-bottom))] sm:pb-0">
          <div className="mx-auto w-full max-w-[720px] px-4 pb-16 sm:px-8">{children}</div>
        </main>
        {esAmplio && <PanelAcoplado />}
        <MobileNavigation />
      </div>
      {!esAmplio && <PanelSuperpuesto />}
      <NoticeBanner />
    </>
  );
}

/** Rail + contenido + inspector opcional. En móvil: contenido + barra inferior. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ProveedorCapas>
      <ProveedorPanel>
        <MotionConfig reducedMotion="user">
          <ProveedorViajeEnElTiempo>
            <Estructura>{children}</Estructura>
          </ProveedorViajeEnElTiempo>
        </MotionConfig>
      </ProveedorPanel>
    </ProveedorCapas>
  );
}
