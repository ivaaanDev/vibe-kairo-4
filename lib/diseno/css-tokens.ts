import { COLORES_ETIQUETA } from "@/lib/tipos/etiqueta";
import {
  coloresEtiquetaClaros,
  coloresEtiquetaOscuros,
  movimiento,
  paletaClara,
  paletaOscura,
  radios,
  type PaletaSemantica,
} from "./tokens";

/** `textPrimary` → `text-primary`. */
function aKebab(nombre: string): string {
  return nombre.replace(/[A-Z]/g, (letra) => `-${letra.toLowerCase()}`);
}

function declaraciones(paleta: PaletaSemantica, etiquetas: Record<string, string>): string {
  const colores = Object.entries(paleta).map(([nombre, valor]) => `--k-${aKebab(nombre)}:${valor};`);
  const deEtiqueta = COLORES_ETIQUETA.map((color) => `--k-etiqueta-${color}:${etiquetas[color]};`);
  return [...colores, ...deEtiqueta].join("");
}

function curva([a, b, c, d]: readonly number[]): string {
  return `cubic-bezier(${a},${b},${c},${d})`;
}

/** Hoja de variables CSS derivada de los tokens. Se inyecta en el layout raíz. */
export function hojaDeTokens(): string {
  const comunes = [
    `--k-duracion-inmediata:${movimiento.duracion.inmediata}ms;`,
    `--k-duracion-normal:${movimiento.duracion.normal}ms;`,
    `--k-duracion-panel:${movimiento.duracion.panel}ms;`,
    `--k-curva-estandar:${curva(movimiento.curva.estandar)};`,
    `--k-curva-entrada:${curva(movimiento.curva.entrada)};`,
    `--k-curva-salida:${curva(movimiento.curva.salida)};`,
    `--k-radio-control:${radios.control}px;`,
    `--k-radio-panel:${radios.panel}px;`,
    `--k-radio-sheet:${radios.sheet}px;`,
  ].join("");

  return [
    `:root{color-scheme:light dark;${comunes}${declaraciones(paletaClara, coloresEtiquetaClaros)}}`,
    `@media (prefers-color-scheme:dark){:root{${declaraciones(paletaOscura, coloresEtiquetaOscuros)}}}`,
  ].join("");
}
