import { describe, expect, it } from "vitest";
import { ordenarCronologicamente, ordenarLista } from "./orden";
import { tarea } from "./pruebas/fabricas";

describe("orden cronológico", () => {
  it("ordena por fecha, luego sin hora antes que con hora, luego por hora; sin fecha al final", () => {
    const ordenadas = ordenarCronologicamente([
      tarea({ titulo: "sin fecha" }),
      tarea({ titulo: "11 10:00", fechaVencimiento: "2026-09-11", horaVencimiento: "10:00" }),
      tarea({ titulo: "10 18:00", fechaVencimiento: "2026-09-10", horaVencimiento: "18:00" }),
      tarea({ titulo: "10", fechaVencimiento: "2026-09-10" }),
      tarea({ titulo: "10 08:00", fechaVencimiento: "2026-09-10", horaVencimiento: "08:00" }),
    ]);
    expect(ordenadas.map((t) => t.titulo)).toEqual(["10", "10 08:00", "10 18:00", "11 10:00", "sin fecha"]);
  });

  it("desempata por fecha de creación", () => {
    const ordenadas = ordenarCronologicamente([
      tarea({ titulo: "b", fechaVencimiento: "2026-09-10", creadaEn: "2026-09-02T00:00:00Z" }),
      tarea({ titulo: "a", fechaVencimiento: "2026-09-10", creadaEn: "2026-09-01T00:00:00Z" }),
    ]);
    expect(ordenadas.map((t) => t.titulo)).toEqual(["a", "b"]);
  });
});

describe("orden de la lista general", () => {
  const vieja = tarea({ titulo: "vieja", creadaEn: "2026-09-01T00:00:00Z" });
  const nueva = tarea({ titulo: "nueva", creadaEn: "2026-09-05T00:00:00Z" });
  const hecha = tarea({
    titulo: "hecha",
    creadaEn: "2026-09-03T00:00:00Z",
    completada: true,
    completadaEn: "2026-09-06T00:00:00Z",
  });

  it("pendientes de la más nueva a la más vieja; completadas aparte", () => {
    const { pendientes, completadas } = ordenarLista([vieja, hecha, nueva]);
    expect(pendientes.map((t) => t.titulo)).toEqual(["nueva", "vieja"]);
    expect(completadas.map((t) => t.titulo)).toEqual(["hecha"]);
  });

  it("una tarea recién completada conserva su posición mientras está retenida", () => {
    const { pendientes, completadas } = ordenarLista([vieja, hecha, nueva], new Set([hecha.id]));
    expect(pendientes.map((t) => t.titulo)).toEqual(["nueva", "hecha", "vieja"]);
    expect(completadas).toEqual([]);
  });
});
