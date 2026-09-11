"use client";

import { createContext, use, useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";

/*
 * Mientras haya una capa modal (sheet o panel superpuesto) el resto de la app queda
 * `inert`: no recibe foco ni clics. Así el foco queda contenido sin trampas manuales.
 */

interface ValorCapas {
  registrar: () => () => void;
  fondoInerte: boolean;
}

const ContextoCapas = createContext<ValorCapas>({ registrar: () => () => {}, fondoInerte: false });

export function ProveedorCapas({ children }: { children: React.ReactNode }) {
  const [abiertas, setAbiertas] = useState(0);
  const registrar = useCallback(() => {
    setAbiertas((n) => n + 1);
    return () => setAbiertas((n) => n - 1);
  }, []);
  const valor = useMemo(() => ({ registrar, fondoInerte: abiertas > 0 }), [registrar, abiertas]);
  return <ContextoCapas value={valor}>{children}</ContextoCapas>;
}

export function useCapaModal(activa: boolean): void {
  const { registrar } = use(ContextoCapas);
  useEffect(() => (activa ? registrar() : undefined), [activa, registrar]);
}

export function useFondoInerte(): boolean {
  return use(ContextoCapas).fondoInerte;
}

const sinSuscripcion = () => () => {};

/** `false` en el servidor y durante la hidratación; `true` después. Necesario para portales. */
export function useMontado(): boolean {
  return useSyncExternalStore(
    sinSuscripcion,
    () => true,
    () => false,
  );
}
