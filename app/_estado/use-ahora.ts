"use client";

import { useSyncExternalStore } from "react";
import { momentoLocalDesde } from "@/lib/dominio/fecha-local";
import type { MomentoLocal } from "@/lib/tipos/tarea";

/*
 * Reloj compartido con resolución de minuto. Todas las vistas leen el mismo «ahora»,
 * así una tarea pasa a vencida a la vez en la lista y en la agenda.
 * En el servidor devuelve null: la zona horaria que importa es la del usuario.
 */

let actual: MomentoLocal | null = null;
const oyentes = new Set<() => void>();
let temporizador: ReturnType<typeof setTimeout> | undefined;

function refrescar() {
  const siguiente = momentoLocalDesde(new Date());
  if (!actual || siguiente.fecha !== actual.fecha || siguiente.hora !== actual.hora) {
    actual = siguiente;
    for (const oyente of oyentes) oyente();
  }
}

function programar() {
  const ahora = new Date();
  const hastaSiguienteMinuto = 60_000 - (ahora.getSeconds() * 1000 + ahora.getMilliseconds()) + 50;
  temporizador = setTimeout(() => {
    refrescar();
    programar();
  }, hastaSiguienteMinuto);
}

function alVolverVisible() {
  if (document.visibilityState === "visible") refrescar();
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  if (oyentes.size === 1) {
    refrescar();
    programar();
    document.addEventListener("visibilitychange", alVolverVisible);
  }
  return () => {
    oyentes.delete(oyente);
    if (oyentes.size === 0) {
      clearTimeout(temporizador);
      document.removeEventListener("visibilitychange", alVolverVisible);
    }
  };
}

function instantanea(): MomentoLocal {
  if (!actual) actual = momentoLocalDesde(new Date());
  return actual;
}

export function useAhora(): MomentoLocal | null {
  return useSyncExternalStore(suscribir, instantanea, () => null);
}
