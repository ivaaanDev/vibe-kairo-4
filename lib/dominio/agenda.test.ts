import { describe, expect, it } from "vitest";
import { calcularAgenda, contarPendientesHoy, limitesDelRango, posicionMarcadorAhora } from "./agenda";
import { AHORA, tarea } from "./pruebas/fabricas";

const titulos = (grupos: ReturnType<typeof calcularAgenda>) =>
  grupos.map((grupo) => [grupo.titulo, grupo.tareas.map((t) => t.titulo)]);

describe("agenda", () => {
  const tareas = [
    tarea({ titulo: "sin fecha" }),
    tarea({ titulo: "vencida hace dos días", fechaVencimiento: "2026-09-08" }),
    tarea({ titulo: "completada ayer", fechaVencimiento: "2026-09-09", completada: true }),
    tarea({ titulo: "hoy 17:30", fechaVencimiento: "2026-09-10", horaVencimiento: "17:30" }),
    tarea({ titulo: "hoy 09:00", fechaVencimiento: "2026-09-10", horaVencimiento: "09:00" }),
    tarea({ titulo: "hoy sin hora", fechaVencimiento: "2026-09-10" }),
    tarea({ titulo: "hoy completada", fechaVencimiento: "2026-09-10", completada: true }),
    tarea({ titulo: "mañana", fechaVencimiento: "2026-09-11" }),
    tarea({ titulo: "en seis días", fechaVencimiento: "2026-09-16" }),
    tarea({ titulo: "en siete días", fechaVencimiento: "2026-09-17" }),
  ];

  it("Hoy: vencidas anteriores y luego las de hoy, en orden cronológico", () => {
    expect(titulos(calcularAgenda(tareas, "hoy", AHORA))).toEqual([
      ["Vencidas", ["vencida hace dos días"]],
      ["Hoy", ["hoy sin hora", "hoy completada", "hoy 09:00", "hoy 17:30"]],
    ]);
  });

  it("Esta semana: ventana de hoy más seis días, agrupada por día", () => {
    expect(titulos(calcularAgenda(tareas, "semana", AHORA))).toEqual([
      ["Vencidas", ["vencida hace dos días"]],
      ["Hoy", ["hoy sin hora", "hoy completada", "hoy 09:00", "hoy 17:30"]],
      ["Mañana", ["mañana"]],
      ["Miércoles 16 sep", ["en seis días"]],
    ]);
  });

  it("las tareas sin fecha nunca aparecen", () => {
    for (const rango of ["hoy", "semana"] as const) {
      const todas = calcularAgenda(tareas, rango, AHORA).flatMap((grupo) => grupo.tareas);
      expect(todas.some((t) => t.fechaVencimiento === null)).toBe(false);
    }
  });

  it("las completadas de días pasados no se muestran", () => {
    const todas = calcularAgenda(tareas, "semana", AHORA).flatMap((grupo) => grupo.tareas);
    expect(todas.map((t) => t.titulo)).not.toContain("completada ayer");
  });

  it("sin tareas con fecha, la agenda está vacía", () => {
    expect(calcularAgenda([tarea(), tarea()], "semana", AHORA)).toEqual([]);
  });

  it("define los límites de cada rango", () => {
    expect(limitesDelRango("hoy", AHORA)).toEqual({ desde: "2026-09-10", hasta: "2026-09-10" });
    expect(limitesDelRango("semana", AHORA)).toEqual({ desde: "2026-09-10", hasta: "2026-09-16" });
  });

  it("cuenta las pendientes de hoy, incluidas las vencidas", () => {
    expect(contarPendientesHoy(tareas, AHORA)).toBe(4);
  });

  it("una vencida completada en la sesión se queda en su grupo mientras está retenida", () => {
    const vencida = tareas[1];
    if (!vencida) throw new Error("falta la tarea de prueba");
    const completada = { ...vencida, completada: true, completadaEn: "2026-09-10T14:00:00Z" };
    const conCompletada = tareas.map((t) => (t.id === vencida.id ? completada : t));
    expect(calcularAgenda(conCompletada, "hoy", AHORA)[0]?.titulo).toBe("Hoy");
    const retenida = calcularAgenda(conCompletada, "hoy", AHORA, { retenidas: new Set([vencida.id]) });
    expect(retenida[0]?.tareas).toEqual([completada]);
  });
});

describe("marcador de ahora", () => {
  const conHora = (hora: string | null) => ({ horaVencimiento: hora });

  it("se sitúa antes de la primera tarea con hora posterior", () => {
    expect(posicionMarcadorAhora([conHora(null), conHora("09:00"), conHora("17:30")], AHORA)).toBe(2);
  });

  it("va al final si todas las horas ya pasaron", () => {
    expect(posicionMarcadorAhora([conHora("09:00"), conHora("10:00")], AHORA)).toBe(2);
  });

  it("no aparece si ninguna tarea tiene hora", () => {
    expect(posicionMarcadorAhora([conHora(null)], AHORA)).toBeNull();
  });
});
