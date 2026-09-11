"use client";

import { useCallback, useEffect, useRef } from "react";

/** Función retrasada con `flush` (ejecutar ya lo pendiente) y `cancelar`. Siempre usa la última `accion`. */
export function useDebounced<A extends unknown[]>(accion: (...args: A) => void, espera: number) {
  const accionRef = useRef(accion);
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pendientes = useRef<A | null>(null);

  useEffect(() => {
    accionRef.current = accion;
  });

  const flush = useCallback(() => {
    clearTimeout(temporizador.current);
    if (pendientes.current) {
      const args = pendientes.current;
      pendientes.current = null;
      accionRef.current(...args);
    }
  }, []);

  const cancelar = useCallback(() => {
    clearTimeout(temporizador.current);
    pendientes.current = null;
  }, []);

  const programar = useCallback(
    (...args: A) => {
      pendientes.current = args;
      clearTimeout(temporizador.current);
      temporizador.current = setTimeout(flush, espera);
    },
    [espera, flush],
  );

  // Al desmontar se guarda lo pendiente: cerrar el panel nunca pierde lo escrito.
  useEffect(() => flush, [flush]);

  return { programar, flush, cancelar };
}
