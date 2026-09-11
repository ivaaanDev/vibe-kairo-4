import { describe, expect, it } from "vitest";
import { AHORA, tarea } from "./pruebas/fabricas";
import { clasificarTemporalmente, describirVencimiento, estaVencida } from "./vencimiento";

describe("tarea vencida", () => {
  it("sin fecha nunca vence", () => {
    expect(estaVencida(tarea(), AHORA)).toBe(false);
  });

  it("vence si su día ya pasó", () => {
    expect(estaVencida(tarea({ fechaVencimiento: "2026-09-09" }), AHORA)).toBe(true);
  });

  it("para hoy sin hora no vence hasta que termina el día", () => {
    expect(estaVencida(tarea({ fechaVencimiento: "2026-09-10" }), AHORA)).toBe(false);
  });

  it("para hoy con hora vence cuando ese minuto ya pasó", () => {
    expect(estaVencida(tarea({ fechaVencimiento: "2026-09-10", horaVencimiento: "14:29" }), AHORA)).toBe(true);
    expect(estaVencida(tarea({ fechaVencimiento: "2026-09-10", horaVencimiento: "14:30" }), AHORA)).toBe(false);
    expect(estaVencida(tarea({ fechaVencimiento: "2026-09-10", horaVencimiento: "18:00" }), AHORA)).toBe(false);
  });

  it("una tarea completada no está vencida", () => {
    expect(estaVencida(tarea({ fechaVencimiento: "2026-09-01", completada: true }), AHORA)).toBe(false);
  });
});

describe("clasificación temporal", () => {
  it.each([
    [null, false, "sin-fecha"],
    ["2026-09-08", false, "vencida"],
    ["2026-09-08", true, "pasada"],
    ["2026-09-10", false, "hoy"],
    ["2026-09-16", false, "proxima"],
    ["2026-09-17", false, "futura"],
  ] as const)("fecha %s, completada %s → %s", (fecha, completada, esperado) => {
    expect(clasificarTemporalmente(tarea({ fechaVencimiento: fecha, completada }), AHORA)).toBe(esperado);
  });
});

describe("descripción del vencimiento", () => {
  it("no describe nada cuando no hay fecha", () => {
    expect(describirVencimiento(tarea(), AHORA)).toBeNull();
  });

  it.each([
    ["2026-09-10", null, "Hoy"],
    ["2026-09-10", "17:30", "Hoy · 17:30"],
    ["2026-09-11", null, "Mañana"],
    ["2026-09-09", null, "Ayer"],
    ["2026-09-14", null, "Lunes"],
    ["2026-09-07", "10:00", "Lun 7 sep · 10:00"],
    ["2026-10-02", null, "2 oct"],
  ] as const)("%s %s → «%s»", (fecha, hora, texto) => {
    expect(describirVencimiento(tarea({ fechaVencimiento: fecha, horaVencimiento: hora }), AHORA)?.texto).toBe(texto);
  });
});
