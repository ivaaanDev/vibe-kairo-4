import { describe, expect, it } from "vitest";
import { COLUMNAS_CSV, celdaCsv, construirExportacion, nombreArchivoExportacion, serializarCsv, serializarJson } from "./exportacion";
import { etiqueta, tarea } from "./pruebas/fabricas";

const trabajo = etiqueta({ nombre: "Trabajo" });
const casa = etiqueta({ nombre: "Casa", color: "arena" });
const sinUso = etiqueta({ nombre: "Sin uso", color: "bruma" });
const tareas = [
  tarea({ titulo: "Con dos etiquetas", etiquetaIds: [trabajo.id, casa.id], fechaVencimiento: "2026-09-10", horaVencimiento: "09:00" }),
  tarea({ titulo: 'Con "comillas", comas\ny saltos', descripcion: "Nota", creadaEn: "2026-09-02T00:00:00Z" }),
  tarea({ titulo: "Hecha", completada: true, completadaEn: "2026-09-09T10:00:00Z", creadaEn: "2026-09-03T00:00:00Z" }),
];
const documento = construirExportacion(tareas, [trabajo, casa, sinUso], "2026-09-10T12:00:00.000Z");

describe("exportación JSON", () => {
  it("incluye todas las tareas y todas las etiquetas", () => {
    const json = JSON.parse(serializarJson(documento));
    expect(json.formato).toBe("kairo.exportacion");
    expect(json.tareas).toHaveLength(3);
    expect(json.etiquetas.map((e: { nombre: string }) => e.nombre)).toEqual(["Casa", "Sin uso", "Trabajo"]);
    expect(json.tareas[0].etiquetas.map((e: { nombre: string }) => e.nombre)).toEqual(["Trabajo", "Casa"]);
  });
});

describe("exportación CSV", () => {
  const csv = serializarCsv(documento);
  const lineas = csv.replace(/^\uFEFF/, "").split("\r\n");

  it("empieza con BOM y cabecera", () => {
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(lineas[0]).toBe(COLUMNAS_CSV.join(","));
  });

  it("contiene una fila por tarea con sus etiquetas", () => {
    expect(csv).toContain("Con dos etiquetas");
    expect(csv).toContain("Trabajo; Casa");
    expect(csv).toContain(",si,");
  });

  it("escapa comillas, comas y saltos de línea (RFC 4180)", () => {
    expect(csv).toContain('"Con ""comillas"", comas\ny saltos"');
  });

  it("neutraliza celdas que una hoja de cálculo ejecutaría como fórmula", () => {
    expect(celdaCsv("=SUM(A1)")).toBe("'=SUM(A1)");
    expect(celdaCsv("@cmd")).toBe("'@cmd");
    expect(celdaCsv("Normal")).toBe("Normal");
    expect(celdaCsv(null)).toBe("");
  });
});

it("nombra el archivo con la fecha local", () => {
  expect(nombreArchivoExportacion("csv", "2026-09-10")).toBe("kairo-tareas-2026-09-10.csv");
});
