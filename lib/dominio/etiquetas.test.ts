import { describe, expect, it } from "vitest";
import {
  asignarEtiqueta,
  contarTareasPorEtiqueta,
  crearEtiqueta,
  desvincularEtiqueta,
  filtrarPorEtiquetas,
  siguienteColor,
  validarNombreEtiqueta,
} from "./etiquetas";
import { etiqueta, idDePrueba, tarea } from "./pruebas/fabricas";

describe("nombre de etiqueta", () => {
  const existentes = [etiqueta({ nombre: "Trabajo" }), etiqueta({ nombre: "Pendientes por cobrar" })];

  it("recorta y colapsa espacios", () => {
    expect(validarNombreEtiqueta("  Casa   nueva ", existentes)).toEqual({ ok: true, valor: "Casa nueva" });
  });

  it("no admite duplicados sin importar mayúsculas ni acentos", () => {
    expect(validarNombreEtiqueta("trabajo", existentes)).toMatchObject({ ok: false, error: { codigo: "nombre-etiqueta-duplicado" } });
    expect(validarNombreEtiqueta("Trabájo", existentes).ok).toBe(false);
  });

  it("permite renombrar una etiqueta a sí misma", () => {
    const propia = existentes[0];
    expect(validarNombreEtiqueta("TRABAJO", existentes, propia?.id).ok).toBe(true);
  });

  it("exige entre 1 y 40 caracteres", () => {
    expect(validarNombreEtiqueta(" ", existentes).ok).toBe(false);
    expect(validarNombreEtiqueta("x".repeat(41), existentes).ok).toBe(false);
  });
});

describe("crear etiqueta", () => {
  it("asigna el color menos usado si no se indica", () => {
    const existentes = [etiqueta({ color: "pizarra" }), etiqueta({ nombre: "Casa", color: "salvia" })];
    expect(siguienteColor(existentes)).toBe("arena");
    const creada = crearEtiqueta({ id: idDePrueba(), nombre: "Personal" }, existentes, "2026-09-10T00:00:00Z");
    expect(creada).toMatchObject({ ok: true, valor: { nombre: "Personal", color: "arena" } });
  });

  it("rechaza colores fuera de la paleta", () => {
    const creada = crearEtiqueta({ id: idDePrueba(), nombre: "X", color: "fucsia" as never }, [], "2026-09-10T00:00:00Z");
    expect(creada).toMatchObject({ ok: false, error: { codigo: "color-invalido" } });
  });
});

describe("relación tarea–etiqueta", () => {
  const trabajo = idDePrueba();
  const casa = idDePrueba();
  const tareas = [
    tarea({ titulo: "a", etiquetaIds: [trabajo] }),
    tarea({ titulo: "b", etiquetaIds: [trabajo, casa] }),
    tarea({ titulo: "c", etiquetaIds: [] }),
  ];

  it("una tarea admite varias etiquetas y no las repite", () => {
    const base = tarea();
    expect(asignarEtiqueta(asignarEtiqueta(asignarEtiqueta(base, trabajo), casa), trabajo).etiquetaIds).toEqual([trabajo, casa]);
  });

  it("filtra por cualquiera de las etiquetas seleccionadas", () => {
    expect(filtrarPorEtiquetas(tareas, [casa]).map((t) => t.titulo)).toEqual(["b"]);
    expect(filtrarPorEtiquetas(tareas, [trabajo, casa]).map((t) => t.titulo)).toEqual(["a", "b"]);
    expect(filtrarPorEtiquetas(tareas, []).map((t) => t.titulo)).toEqual(["a", "b", "c"]);
  });

  it("desvincular una etiqueta conserva todas las tareas", () => {
    const resultado = desvincularEtiqueta(tareas, trabajo);
    expect(resultado).toHaveLength(3);
    expect(resultado.map((t) => t.etiquetaIds)).toEqual([[], [casa], []]);
  });

  it("cuenta tareas por etiqueta", () => {
    const conteo = contarTareasPorEtiqueta(tareas);
    expect(conteo.get(trabajo)).toBe(2);
    expect(conteo.get(casa)).toBe(1);
  });
});
