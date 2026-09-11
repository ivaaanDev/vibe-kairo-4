import type { ColorEtiqueta } from "@/lib/tipos/etiqueta";

/*
 * Tokens de diseño de Kairo. Fuente única de verdad, independiente de CSS:
 * la web los convierte en variables CSS (css-tokens.ts) y una app React Native
 * podría consumirlos tal cual en StyleSheet / Reanimated.
 */

export interface PaletaSemantica {
  background: string;
  surface: string;
  surfaceSecondary: string;
  textPrimary: string;
  textSecondary: string;
  /** Separadores y contornos decorativos. */
  border: string;
  /** Contorno de controles (casilla de completado, campos): ≥ 3:1 sobre el fondo. */
  borderStrong: string;
  accent: string;
  /** Texto e iconos sobre un relleno de acento. */
  accentContrast: string;
  /** Fondo tenue de selección. */
  accentSoft: string;
  danger: string;
  focus: string;
  /** Velo detrás de sheets y paneles superpuestos. */
  scrim: string;
}

export const paletaClara: PaletaSemantica = {
  background: "#F7F6F3",
  surface: "#FFFFFF",
  surfaceSecondary: "#EEEDE9",
  textPrimary: "#1C1B19",
  textSecondary: "#5E5B55",
  border: "#E3E1DC",
  borderStrong: "#817E78",
  accent: "#3F4FC0",
  accentContrast: "#FFFFFF",
  accentSoft: "#E9EBF8",
  danger: "#B42318",
  focus: "#3F4FC0",
  scrim: "rgba(28, 27, 25, 0.28)",
};

export const paletaOscura: PaletaSemantica = {
  background: "#151514",
  surface: "#1C1C1A",
  surfaceSecondary: "#272725",
  textPrimary: "#ECEAE5",
  textSecondary: "#A6A39C",
  border: "#2F2E2B",
  borderStrong: "#75726B",
  accent: "#97A3FF",
  accentContrast: "#12131F",
  accentSoft: "#252842",
  danger: "#FF8F84",
  focus: "#97A3FF",
  scrim: "rgba(0, 0, 0, 0.5)",
};

/** Colores de etiqueta: se usan solo como pequeños indicadores, siempre junto al nombre. */
export const coloresEtiquetaClaros: Record<ColorEtiqueta, string> = {
  pizarra: "#52698A",
  salvia: "#4F8061",
  arena: "#9A7530",
  ciruela: "#8A5486",
  teja: "#B35A38",
  bruma: "#3F7F97",
  musgo: "#6C7A36",
  grafito: "#6B6964",
};

export const coloresEtiquetaOscuros: Record<ColorEtiqueta, string> = {
  pizarra: "#8FA6C7",
  salvia: "#86BC98",
  arena: "#D6B26E",
  ciruela: "#C895C3",
  teja: "#E8906C",
  bruma: "#7CBCD3",
  musgo: "#AAB86F",
  grafito: "#A8A6A0",
};

export const nombresColorEtiqueta: Record<ColorEtiqueta, string> = {
  pizarra: "Pizarra",
  salvia: "Salvia",
  arena: "Arena",
  ciruela: "Ciruela",
  teja: "Teja",
  bruma: "Bruma",
  musgo: "Musgo",
  grafito: "Grafito",
};

/** Escala de espaciado en px (base 4). */
export const espaciado = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

export const radios = {
  control: 6,
  panel: 10,
  sheet: 14,
  completo: 9999,
} as const;

export const tipografia = {
  familia:
    'var(--font-kairo), ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  /** [tamaño px, alto de línea px, peso] */
  tituloVista: [26, 32, 650],
  tituloPanel: [20, 28, 600],
  cuerpo: [15, 22, 400],
  /** En pantallas táctiles los campos usan 16 px para evitar el zoom automático de iOS. */
  cuerpoTactil: [16, 24, 400],
  meta: [13, 18, 450],
  encabezadoGrupo: [13, 18, 600],
} as const;

/** Duraciones en ms. Nada supera 280 ms en uso normal. */
export const movimiento = {
  duracion: {
    inmediata: 120,
    normal: 180,
    panel: 240,
  },
  /** Curvas cúbicas equivalentes a `Easing.bezier` de Reanimated. */
  curva: {
    estandar: [0.2, 0, 0, 1],
    entrada: [0, 0, 0.2, 1],
    salida: [0.4, 0, 1, 1],
  },
  /** Desplazamiento de entrada de filas y paneles, en px. */
  desplazamiento: {
    fila: 6,
    panel: 24,
  },
} as const;

/** Anchos mínimos en px. */
export const puntosDeCorte = {
  medio: 640,
  amplio: 1024,
  extendido: 1280,
} as const;

export const medidas = {
  objetivoTactil: 44,
  anchoContenido: 720,
  anchoRail: 64,
  anchoRailExtendido: 232,
  anchoInspector: 400,
  altoBarraInferior: 56,
} as const;
