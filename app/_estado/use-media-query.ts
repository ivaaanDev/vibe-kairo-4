"use client";

import { useCallback, useSyncExternalStore } from "react";
import { puntosDeCorte } from "@/lib/diseno/tokens";

export function useMediaQuery(consulta: string): boolean {
  const suscribir = useCallback(
    (oyente: () => void) => {
      const lista = window.matchMedia(consulta);
      lista.addEventListener("change", oyente);
      return () => lista.removeEventListener("change", oyente);
    },
    [consulta],
  );
  return useSyncExternalStore(
    suscribir,
    () => window.matchMedia(consulta).matches,
    () => false,
  );
}

/** ≥ 1024 px: inspector acoplado. */
export function useEsAmplio(): boolean {
  return useMediaQuery(`(min-width: ${puntosDeCorte.amplio}px)`);
}

/** ≥ 640 px: popovers en lugar de sheets. */
export function useEsMedio(): boolean {
  return useMediaQuery(`(min-width: ${puntosDeCorte.medio}px)`);
}
