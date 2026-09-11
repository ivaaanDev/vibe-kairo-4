export const COLORES_ETIQUETA = [
  "pizarra",
  "salvia",
  "arena",
  "ciruela",
  "teja",
  "bruma",
  "musgo",
  "grafito",
] as const;

export type ColorEtiqueta = (typeof COLORES_ETIQUETA)[number];

export interface Etiqueta {
  id: string;
  nombre: string;
  color: ColorEtiqueta;
  creadaEn: string;
}

export interface NuevaEtiqueta {
  id: string;
  nombre: string;
  color?: ColorEtiqueta;
}

export interface CambiosEtiqueta {
  nombre?: string;
  color?: ColorEtiqueta;
}
