/** Fecha de calendario sin zona horaria: `YYYY-MM-DD`. */
export type FechaLocal = string;

/** Hora de reloj sin zona horaria: `HH:mm` (24 h). */
export type HoraLocal = string;

/** Instante absoluto en ISO 8601 (UTC). */
export type Instante = string;

export interface Tarea {
  id: string;
  titulo: string;
  descripcion: string | null;
  fechaVencimiento: FechaLocal | null;
  /** Solo puede existir si hay `fechaVencimiento`. */
  horaVencimiento: HoraLocal | null;
  completada: boolean;
  completadaEn: Instante | null;
  etiquetaIds: string[];
  creadaEn: Instante;
  actualizadaEn: Instante;
}

/** Lo único que exige el alta rápida. */
export interface NuevaTarea {
  id: string;
  titulo: string;
}

/** Cambios parciales admitidos al editar una tarea. */
export interface CambiosTarea {
  titulo?: string;
  descripcion?: string | null;
  fechaVencimiento?: FechaLocal | null;
  horaVencimiento?: HoraLocal | null;
  completada?: boolean;
  etiquetaIds?: string[];
}

/** El «ahora» del usuario, expresado en su calendario y reloj locales. */
export interface MomentoLocal {
  fecha: FechaLocal;
  hora: HoraLocal;
}
