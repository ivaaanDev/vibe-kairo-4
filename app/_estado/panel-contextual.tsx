"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { createContext, use, useCallback, useEffect, useMemo, useRef } from "react";
import { enfocarCuandoSeaPosible } from "./foco";

/*
 * Panel contextual (detalle de tarea o gestor de etiquetas). Vive en la URL
 * (`?tarea=<id>` o `?panel=etiquetas`) mediante history.pushState: el botón «atrás»
 * lo cierra en móvil y recargar conserva lo que se estaba viendo.
 * Al cerrarse, el foco vuelve al elemento que lo abrió.
 */

export type PanelContextual = { tipo: "tarea"; id: string } | { tipo: "etiquetas" } | null;

interface ValorPanel {
  panel: PanelContextual;
  abrirTarea: (id: string, origen?: HTMLElement | null) => void;
  abrirEtiquetas: (origen?: HTMLElement | null) => void;
  cerrar: () => void;
}

const ContextoPanel = createContext<ValorPanel | null>(null);

function leerPanel(parametros: URLSearchParams): PanelContextual {
  const tarea = parametros.get("tarea");
  if (tarea) return { tipo: "tarea", id: tarea };
  if (parametros.get("panel") === "etiquetas") return { tipo: "etiquetas" };
  return null;
}

function urlSinPanel(): string {
  const parametros = new URLSearchParams(window.location.search);
  parametros.delete("tarea");
  parametros.delete("panel");
  const consulta = parametros.toString();
  return `${window.location.pathname}${consulta ? `?${consulta}` : ""}`;
}

/** Destino de foco cuando el elemento de origen ya no existe (p. ej. la tarea se eliminó). */
function focoDeRespaldo() {
  const destino = document.getElementById("alta-rapida") ?? document.getElementById("titulo-vista");
  destino?.focus();
}

export function ProveedorPanel({ children }: { children: React.ReactNode }) {
  const parametros = useSearchParams();
  const ruta = usePathname();
  const panel = useMemo(() => leerPanel(new URLSearchParams(parametros.toString())), [parametros]);
  const origen = useRef<HTMLElement | null>(null);
  const empujado = useRef(false);
  const panelAnterior = useRef<PanelContextual>(panel);

  const abrir = useCallback(
    (destino: Exclude<PanelContextual, null>, desde?: HTMLElement | null) => {
      origen.current = desde ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
      const nuevos = new URLSearchParams(window.location.search);
      nuevos.delete("tarea");
      nuevos.delete("panel");
      if (destino.tipo === "tarea") nuevos.set("tarea", destino.id);
      else nuevos.set("panel", "etiquetas");
      const url = `${window.location.pathname}?${nuevos.toString()}`;
      // Cambiar de tarea con el panel abierto no apila historial.
      if (leerPanel(new URLSearchParams(window.location.search))) {
        window.history.replaceState(null, "", url);
      } else {
        window.history.pushState(null, "", url);
        empujado.current = true;
      }
    },
    [],
  );

  const cerrar = useCallback(() => {
    if (!leerPanel(new URLSearchParams(window.location.search))) return;
    if (empujado.current) {
      empujado.current = false;
      window.history.back();
    } else {
      window.history.replaceState(null, "", urlSinPanel());
    }
  }, []);

  // Devuelve el foco al cerrarse, venga el cierre de un botón, de Escape o del «atrás» del sistema.
  useEffect(() => {
    const estabaAbierto = panelAnterior.current !== null;
    panelAnterior.current = panel;
    if (estabaAbierto && panel === null) {
      empujado.current = false;
      const destino = origen.current;
      origen.current = null;
      enfocarCuandoSeaPosible(destino, focoDeRespaldo);
    }
  }, [panel]);

  // Cambiar de vista cierra el panel sin dejar entradas huérfanas en el historial.
  useEffect(() => {
    empujado.current = false;
  }, [ruta]);

  const valor = useMemo<ValorPanel>(
    () => ({
      panel,
      abrirTarea: (id, desde) => abrir({ tipo: "tarea", id }, desde),
      abrirEtiquetas: (desde) => abrir({ tipo: "etiquetas" }, desde),
      cerrar,
    }),
    [panel, abrir, cerrar],
  );

  return <ContextoPanel value={valor}>{children}</ContextoPanel>;
}

export function usePanel(): ValorPanel {
  const valor = use(ContextoPanel);
  if (!valor) throw new Error("usePanel debe usarse dentro de ProveedorPanel");
  return valor;
}
