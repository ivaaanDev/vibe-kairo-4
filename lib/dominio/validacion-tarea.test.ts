import { describe, expect, it } from "vitest";
import { idDePrueba, tarea } from "./pruebas/fabricas";
import { aplicarCambios, crearTarea, validarDescripcion, validarTitulo, validarVencimiento } from "./validacion-tarea";

const INSTANTE = "2026-09-10T12:00:00.000Z";
const contexto = (etiquetas: string[] = []) => ({ etiquetasExistentes: new Set(etiquetas), instante: INSTANTE });

describe("título", () => {
  it("es obligatorio", () => {
    expect(validarTitulo("   ")).toMatchObject({ ok: false, error: { codigo: "titulo-vacio" } });
  });

  it("admite de 1 a 140 caracteres", () => {
    expect(validarTitulo("a")).toEqual({ ok: true, valor: "a" });
    expect(validarTitulo("a".repeat(140)).ok).toBe(true);
    expect(validarTitulo("a".repeat(141))).toMatchObject({ ok: false, error: { codigo: "titulo-largo" } });
  });

  it("cuenta caracteres visibles, no unidades UTF-16", () => {
    expect(validarTitulo("🙂".repeat(140)).ok).toBe(true);
  });

  it("recorta espacios y convierte saltos de línea en espacios", () => {
    expect(validarTitulo("  Llamar a\n  Marta  ")).toEqual({ ok: true, valor: "Llamar a Marta" });
  });
});

describe("descripción", () => {
  it("es opcional y una cadena vacía equivale a ninguna", () => {
    expect(validarDescripcion(null)).toEqual({ ok: true, valor: null });
    expect(validarDescripcion("   ")).toEqual({ ok: true, valor: null });
  });

  it("admite hasta 500 caracteres", () => {
    expect(validarDescripcion("x".repeat(500)).ok).toBe(true);
    expect(validarDescripcion("x".repeat(501))).toMatchObject({ ok: false, error: { codigo: "descripcion-larga" } });
  });
});

describe("vencimiento", () => {
  it("la hora exige fecha", () => {
    expect(validarVencimiento(null, "10:00")).toMatchObject({ ok: false, error: { codigo: "hora-sin-fecha" } });
    expect(validarVencimiento("2026-09-10", "10:00").ok).toBe(true);
    expect(validarVencimiento("2026-09-10", null).ok).toBe(true);
  });

  it("rechaza formatos inválidos", () => {
    expect(validarVencimiento("2026-02-30", null)).toMatchObject({ ok: false, error: { codigo: "fecha-invalida" } });
    expect(validarVencimiento("2026-02-10", "25:00")).toMatchObject({ ok: false, error: { codigo: "hora-invalida" } });
  });
});

describe("crear tarea", () => {
  it("solo necesita un título", () => {
    const id = idDePrueba();
    const resultado = crearTarea({ id, titulo: "Comprar pan" }, INSTANTE);
    expect(resultado).toEqual({
      ok: true,
      valor: {
        id,
        titulo: "Comprar pan",
        descripcion: null,
        fechaVencimiento: null,
        horaVencimiento: null,
        completada: false,
        completadaEn: null,
        etiquetaIds: [],
        creadaEn: INSTANTE,
        actualizadaEn: INSTANTE,
      },
    });
  });

  it("rechaza ids que no son UUID", () => {
    expect(crearTarea({ id: "1", titulo: "x" }, INSTANTE)).toMatchObject({ ok: false, error: { codigo: "id-invalido" } });
  });
});

describe("aplicar cambios", () => {
  it("quitar la fecha quita también la hora", () => {
    const original = tarea({ fechaVencimiento: "2026-09-10", horaVencimiento: "09:00" });
    const resultado = aplicarCambios(original, { fechaVencimiento: null }, contexto());
    expect(resultado).toMatchObject({ ok: true, valor: { fechaVencimiento: null, horaVencimiento: null } });
  });

  it("no permite fijar una hora sin fecha", () => {
    const resultado = aplicarCambios(tarea(), { horaVencimiento: "09:00" }, contexto());
    expect(resultado).toMatchObject({ ok: false, error: { codigo: "hora-sin-fecha" } });
  });

  it("completar registra el instante y revertir lo borra", () => {
    const completada = aplicarCambios(tarea(), { completada: true }, contexto());
    expect(completada).toMatchObject({ ok: true, valor: { completada: true, completadaEn: INSTANTE } });
    if (!completada.ok) return;
    const revertida = aplicarCambios(completada.valor, { completada: false }, contexto());
    expect(revertida).toMatchObject({ ok: true, valor: { completada: false, completadaEn: null } });
  });

  it("asigna varias etiquetas sin duplicados", () => {
    const [a, b] = [idDePrueba(), idDePrueba()];
    const resultado = aplicarCambios(tarea(), { etiquetaIds: [a, b, a] }, contexto([a, b]));
    expect(resultado).toMatchObject({ ok: true, valor: { etiquetaIds: [a, b] } });
  });

  it("rechaza etiquetas inexistentes", () => {
    const resultado = aplicarCambios(tarea(), { etiquetaIds: [idDePrueba()] }, contexto());
    expect(resultado).toMatchObject({ ok: false, error: { codigo: "etiqueta-desconocida" } });
  });

  it("no altera la tarea original", () => {
    const original = tarea({ titulo: "Antes" });
    aplicarCambios(original, { titulo: "Después" }, contexto());
    expect(original.titulo).toBe("Antes");
  });
});
