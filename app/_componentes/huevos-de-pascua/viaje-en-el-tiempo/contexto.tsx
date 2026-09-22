"use client";

import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FIN,
  GESTO_INICIAL,
  GUION,
  MENSAJE_ENTRA,
  MENSAJE_SALE,
  PASO_REPOSO,
  PULSACION_LARGA,
  registrarPulsacion,
  type PasoViaje,
} from "./secuencia";

/*
 * Estado del easter egg. Vive solo en memoria y solo mientras dura el efecto:
 * al recargar, Kairo vuelve a no saber nada. No se persiste el descubrimiento.
 */

interface ValorViaje extends PasoViaje {
  /** Efecto en curso: la marca reacciona y el gesto deja de admitir activaciones. */
  activo: boolean;
  mensaje: boolean;
  iniciar: () => void;
}

const REPOSO: ValorViaje = { ...PASO_REPOSO, activo: false, mensaje: false, iniciar: () => {} };

/** Fuera del proveedor todo se comporta como siempre: desfase 0 y nada que animar. */
const ContextoViaje = createContext<ValorViaje>(REPOSO);

export function useViajeEnElTiempo(): ValorViaje {
  return use(ContextoViaje);
}

export function ProveedorViajeEnElTiempo({ children }: { children: React.ReactNode }) {
  const [activo, setActivo] = useState(false);
  const [paso, setPaso] = useState<PasoViaje>(PASO_REPOSO);
  const [mensaje, setMensaje] = useState(false);

  // Un solo viaje a la vez: volver a activar mientras `activo` es true no reprograma nada.
  const iniciar = useCallback(() => setActivo(true), []);

  useEffect(() => {
    if (!activo) return;
    const temporizadores = GUION.map(({ en, desfase, atenuado }) => setTimeout(() => setPaso({ desfase, atenuado }), en));
    temporizadores.push(
      setTimeout(() => setMensaje(true), MENSAJE_ENTRA),
      setTimeout(() => setMensaje(false), MENSAJE_SALE),
      setTimeout(() => {
        setPaso(PASO_REPOSO);
        setActivo(false);
      }, FIN),
    );
    return () => {
      for (const temporizador of temporizadores) clearTimeout(temporizador);
    };
  }, [activo]);

  const valor = useMemo<ValorViaje>(
    () => ({ ...paso, activo, mensaje, iniciar }),
    [paso, activo, mensaje, iniciar],
  );

  return <ContextoViaje value={valor}>{children}</ContextoViaje>;
}

export interface GestoMarca {
  activo: boolean;
  /** Se extiende sobre el contenedor de la marca; no altera sus atributos ni su semántica. */
  props: React.HTMLAttributes<HTMLElement> & { "data-marca": string };
}

/**
 * Cinco clics seguidos, o dos segundos de pulsación en pantallas táctiles.
 * La marca no es un enlace ni un botón: no hay navegación ni foco que respetar,
 * y un clic suelto sigue sin hacer absolutamente nada.
 */
export function useGestoMarca(): GestoMarca {
  const { iniciar, activo } = useViajeEnElTiempo();
  const racha = useRef(GESTO_INICIAL);
  const pulsacion = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const cancelarPulsacion = useCallback(() => {
    clearTimeout(pulsacion.current);
    pulsacion.current = undefined;
  }, []);

  // El temporizador de la pulsación no sobrevive al desmontaje.
  useEffect(() => cancelarPulsacion, [cancelarPulsacion]);

  return {
    activo,
    props: {
      "data-marca": "kairo",
      style: { touchAction: "manipulation", WebkitTouchCallout: "none" } as React.CSSProperties,
      onClick: () => {
        const resultado = registrarPulsacion(racha.current, Date.now());
        racha.current = resultado.estado;
        if (resultado.activar) iniciar();
      },
      onPointerDown: (evento: React.PointerEvent) => {
        if (evento.pointerType === "mouse") return;
        cancelarPulsacion();
        pulsacion.current = setTimeout(() => {
          pulsacion.current = undefined;
          iniciar();
        }, PULSACION_LARGA);
      },
      onPointerUp: cancelarPulsacion,
      onPointerCancel: cancelarPulsacion,
      onPointerLeave: cancelarPulsacion,
      // Una pulsación larga no debe abrir el menú contextual del navegador.
      onContextMenu: (evento: React.MouseEvent) => evento.preventDefault(),
    },
  };
}
