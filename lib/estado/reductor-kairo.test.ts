import { describe, expect, it } from "vitest";
import { etiqueta, tarea } from "@/lib/dominio/pruebas/fabricas";
import { reductorKairo } from "./reductor-kairo";

describe("reductor de Kairo", () => {
  it("agrega, reemplaza y elimina tareas", () => {
    const t = tarea({ titulo: "a" });
    let estado = reductorKairo({ tareas: [], etiquetas: [] }, { tipo: "tarea-agregada", tarea: t });
    estado = reductorKairo(estado, { tipo: "tarea-agregada", tarea: t });
    expect(estado.tareas).toHaveLength(1);
    estado = reductorKairo(estado, { tipo: "tarea-reemplazada", tarea: { ...t, titulo: "b" } });
    expect(estado.tareas[0]?.titulo).toBe("b");
    estado = reductorKairo(estado, { tipo: "tarea-eliminada", id: t.id });
    expect(estado.tareas).toEqual([]);
  });

  it("no resucita una tarea eliminada al llegar una respuesta tardía", () => {
    const t = tarea();
    const estado = reductorKairo({ tareas: [], etiquetas: [] }, { tipo: "tarea-reemplazada", tarea: t });
    expect(estado.tareas).toEqual([]);
  });

  it("eliminar una etiqueta la quita de las tareas sin eliminarlas", () => {
    const e = etiqueta();
    const t = tarea({ etiquetaIds: [e.id] });
    const estado = reductorKairo({ tareas: [t], etiquetas: [e] }, { tipo: "etiqueta-eliminada", id: e.id });
    expect(estado.etiquetas).toEqual([]);
    expect(estado.tareas).toHaveLength(1);
    expect(estado.tareas[0]?.etiquetaIds).toEqual([]);
  });
});
