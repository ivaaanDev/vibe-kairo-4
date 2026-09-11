import type { ColorEtiqueta, Etiqueta } from "@/lib/tipos/etiqueta";
import type { FechaLocal, Instante, Tarea } from "@/lib/tipos/tarea";
import { sumarDias } from "./fecha-local";

/*
 * Datos de desarrollo para demostrar todos los estados. Las fechas se calculan
 * respecto a `hoy`, así los ejemplos siguen teniendo sentido cualquier día.
 * Solo se usan en desarrollo local o mediante el script de siembra.
 */

interface PlantillaTarea {
  titulo: string;
  descripcion?: string;
  /** Desplazamiento en días respecto a hoy; `null` = sin fecha. */
  dias: number | null;
  hora?: string;
  etiquetas?: string[];
  completada?: boolean;
}

const ETIQUETAS: { nombre: string; color: ColorEtiqueta }[] = [
  { nombre: "Trabajo", color: "pizarra" },
  { nombre: "Personal", color: "salvia" },
  { nombre: "Casa", color: "arena" },
  { nombre: "Pendientes por cobrar", color: "ciruela" },
];

const TAREAS: PlantillaTarea[] = [
  { titulo: "Enviar propuesta revisada a Estudio Norte", dias: -2, hora: "10:00", etiquetas: ["Trabajo"] },
  { titulo: "Pagar el recibo de la luz", dias: -1, etiquetas: ["Casa"] },
  { titulo: "Llamada con el equipo de diseño", dias: 0, hora: "17:30", etiquetas: ["Trabajo"] },
  {
    titulo: "Comprar fruta, pan y café",
    descripcion: "Pasar por el mercado de la esquina antes de las ocho.",
    dias: 0,
    etiquetas: ["Casa", "Personal"],
  },
  { titulo: "Responder el correo de Andrea", dias: 0, hora: "09:00", etiquetas: ["Trabajo"], completada: true },
  {
    titulo: "Cobrar la factura 0142 a Luma",
    dias: 1,
    hora: "12:00",
    etiquetas: ["Trabajo", "Pendientes por cobrar"],
  },
  { titulo: "Recoger el paquete en la oficina de correos", dias: 2, etiquetas: ["Personal"] },
  { titulo: "Cita con la dentista", dias: 3, hora: "16:00", etiquetas: ["Personal"] },
  { titulo: "Preparar la presentación trimestral", dias: 5, etiquetas: ["Trabajo"] },
  { titulo: "Ordenar el armario del estudio", dias: null, etiquetas: ["Casa"] },
  {
    titulo: "Ideas para el viaje de octubre",
    descripcion: "Mirar vuelos a mitad de semana. Preguntar a Sofía por el hostal de la última vez.",
    dias: null,
    etiquetas: ["Personal"],
  },
  { titulo: "Recordarle a Marta el préstamo de agosto", dias: null, etiquetas: ["Pendientes por cobrar"] },
];

export interface DatosDemostracion {
  etiquetas: Etiqueta[];
  tareas: Tarea[];
}

export function generarDatosDemostracion(hoy: FechaLocal, ahora: Instante, generarId: () => string): DatosDemostracion {
  const etiquetas: Etiqueta[] = ETIQUETAS.map(({ nombre, color }) => ({ id: generarId(), nombre, color, creadaEn: ahora }));
  const idPorNombre = new Map(etiquetas.map((etiqueta) => [etiqueta.nombre, etiqueta.id]));
  const base = Date.parse(ahora);

  const tareas: Tarea[] = TAREAS.map((plantilla, indice) => {
    // Creación escalonada: la primera plantilla es la más antigua.
    const creadaEn = new Date(base - (TAREAS.length - indice) * 60_000).toISOString();
    const fecha = plantilla.dias === null ? null : sumarDias(hoy, plantilla.dias);
    return {
      id: generarId(),
      titulo: plantilla.titulo,
      descripcion: plantilla.descripcion ?? null,
      fechaVencimiento: fecha,
      horaVencimiento: fecha === null ? null : (plantilla.hora ?? null),
      completada: plantilla.completada ?? false,
      completadaEn: plantilla.completada ? ahora : null,
      etiquetaIds: (plantilla.etiquetas ?? []).flatMap((nombre) => {
        const id = idPorNombre.get(nombre);
        return id ? [id] : [];
      }),
      creadaEn,
      actualizadaEn: creadaEn,
    };
  });

  return { etiquetas, tareas };
}
