"use client";

import { useState } from "react";

/**
 * Valor editable localmente que se resincroniza cuando el valor externo cambia
 * (p. ej. el servidor normaliza un título). Evita efectos para copiar props a estado.
 */
export function useBorrador<T>(externo: T): [T, (valor: T) => void] {
  const [estado, setEstado] = useState({ externo, borrador: externo });
  if (!Object.is(estado.externo, externo)) {
    setEstado({ externo, borrador: externo });
    return [externo, (borrador) => setEstado({ externo, borrador })];
  }
  return [estado.borrador, (borrador) => setEstado((actual) => ({ ...actual, borrador }))];
}
