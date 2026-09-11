"use client";

/**
 * Devuelve el foco a un elemento aunque el fondo siga `inert` unos instantes tras
 * cerrar una capa modal: reintenta durante unos frames hasta que el foco se asiente.
 * Si el elemento ya no existe, se usa `respaldo`.
 */
export function enfocarCuandoSeaPosible(destino: HTMLElement | null | undefined, respaldo?: () => void, intentos = 20): void {
  const intentar = (restantes: number) => {
    if (!destino?.isConnected) {
      respaldo?.();
      return;
    }
    destino.focus({ preventScroll: true });
    if (document.activeElement !== destino && restantes > 0) requestAnimationFrame(() => intentar(restantes - 1));
  };
  requestAnimationFrame(() => intentar(intentos));
}
