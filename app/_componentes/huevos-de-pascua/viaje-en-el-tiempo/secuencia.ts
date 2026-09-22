/*
 * «Viaje en el tiempo»: gesto secreto de la marca y guion del efecto.
 *
 * Módulo puro —sin React, sin navegador, sin dominio— para que las duraciones vivan
 * en un solo sitio y el gesto se pueda probar sin montar la interfaz. Nada de lo que
 * hay aquí toca datos: el efecto es exclusivamente visual.
 */

/** Clics necesarios en escritorio y ventana total contada desde el primero. */
export const CLICS_NECESARIOS = 5;
export const VENTANA_CLICS = 1500;

/** Pulsación sostenida equivalente, para pantallas táctiles. */
export const PULSACION_LARGA = 2000;

export interface EstadoGesto {
  conteo: number;
  /** Marca temporal del primer clic de la racha. */
  primero: number;
}

export const GESTO_INICIAL: EstadoGesto = { conteo: 0, primero: 0 };

/**
 * Registra un clic sobre la marca. La racha se reinicia cuando el clic llega
 * fuera de la ventana: ese clic pasa a ser el primero de una racha nueva.
 */
export function registrarPulsacion(estado: EstadoGesto, ahora: number): { estado: EstadoGesto; activar: boolean } {
  const continua = estado.conteo > 0 && ahora - estado.primero <= VENTANA_CLICS;
  const conteo = continua ? estado.conteo + 1 : 1;
  if (conteo >= CLICS_NECESARIOS) return { estado: GESTO_INICIAL, activar: true };
  return { estado: { conteo, primero: continua ? estado.primero : ahora }, activar: false };
}

/** Días que se desplaza la lectura de las fechas: +1 «mañana», −1 «ayer», 0 la real. */
export type Desfase = -1 | 0 | 1;

export interface PasoViaje {
  desfase: Desfase;
  /** Durante la transición el texto se apaga un instante antes de cambiar. */
  atenuado: boolean;
}

export const PASO_REPOSO: PasoViaje = { desfase: 0, atenuado: false };

/** Duración del fundido entre dos lecturas. */
export const TRANSICION = 110;

/**
 * Hoy → Mañana → Ayer → (deslizamiento) → Hoy. El último paso deja siempre
 * el desfase en 0: la interfaz termina exactamente como empezó.
 */
export const GUION: readonly (PasoViaje & { en: number })[] = [
  { en: 140, desfase: 0, atenuado: true },
  { en: 250, desfase: 1, atenuado: false },
  { en: 440, desfase: 1, atenuado: true },
  { en: 550, desfase: -1, atenuado: false },
  { en: 740, desfase: -1, atenuado: true },
  { en: 850, desfase: 1, atenuado: false },
  { en: 990, desfase: 1, atenuado: true },
  { en: 1100, desfase: 0, atenuado: false },
];

/** La reacción de la marca acompaña al desfase y termina con él. */
export const DURACION_LOGO = 1100;

export const MENSAJE = "Ups. Línea temporal equivocada.";
export const MENSAJE_ENTRA = 1200;
export const MENSAJE_SALE = 2700;

/** Hasta aquí el efecto se considera en curso: antes no admite una activación nueva. */
export const FIN = 2900;
