import { describe, expect, it } from "vitest";
import { calcularAgenda } from "./agenda";
import { generarDatosDemostracion } from "./demostracion";
import { idDePrueba } from "./pruebas/fabricas";
import { estaVencida } from "./vencimiento";

describe("datos de demostración", () => {
  const ahora = { fecha: "2026-09-10", hora: "08:00" };
  const { tareas, etiquetas } = generarDatosDemostracion(ahora.fecha, "2026-09-10T13:00:00.000Z", idDePrueba);

  it("cubre todos los estados exigidos", () => {
    expect(tareas.length).toBeGreaterThanOrEqual(8);
    expect(tareas.length).toBeLessThanOrEqual(12);
    expect(tareas.filter((t) => estaVencida(t, ahora)).length).toBeGreaterThanOrEqual(2);
    const deHoy = tareas.filter((t) => t.fechaVencimiento === ahora.fecha);
    expect(deHoy.length).toBeGreaterThanOrEqual(2);
    expect(deHoy.some((t) => t.horaVencimiento !== null)).toBe(true);
    expect(deHoy.some((t) => t.horaVencimiento === null)).toBe(true);
    const semana = calcularAgenda(tareas, "semana", ahora).filter((g) => g.tipo === "dia" && g.fecha !== ahora.fecha);
    expect(semana.flatMap((g) => g.tareas).length).toBeGreaterThanOrEqual(3);
    expect(tareas.filter((t) => t.fechaVencimiento === null).length).toBeGreaterThanOrEqual(3);
    expect(tareas.some((t) => t.completada)).toBe(true);
    expect(tareas.some((t) => t.etiquetaIds.length >= 2)).toBe(true);
  });

  it("usa las cuatro etiquetas previstas", () => {
    expect(etiquetas.map((e) => e.nombre)).toEqual(["Trabajo", "Personal", "Casa", "Pendientes por cobrar"]);
  });
});
