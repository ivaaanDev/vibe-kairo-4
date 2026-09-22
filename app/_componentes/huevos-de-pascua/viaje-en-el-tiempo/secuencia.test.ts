import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { describirVencimiento } from "@/lib/dominio/vencimiento";
import type { MomentoLocal, Tarea } from "@/lib/tipos/tarea";
import { ahoraDesfasado, textoVencimientoDesfasado, tituloGrupoDesfasado } from "./desfase";
import { CLICS_NECESARIOS, FIN, GESTO_INICIAL, GUION, VENTANA_CLICS, registrarPulsacion } from "./secuencia";

/*
 * El easter egg es presentación pura: aquí se comprueba el gesto, el guion y que
 * la lectura desplazada de las fechas no toca ni un dato.
 */

const AHORA: MomentoLocal = { fecha: "2026-09-18", hora: "10:00" };

function tarea(cambios: Partial<Tarea> = {}): Tarea {
  return {
    id: "t1",
    titulo: "Revisar el informe",
    descripcion: null,
    fechaVencimiento: "2026-09-18",
    horaVencimiento: "18:30",
    completada: false,
    completadaEn: null,
    etiquetaIds: [],
    creadaEn: "2026-09-18T08:00:00.000Z",
    actualizadaEn: "2026-09-18T08:00:00.000Z",
    ...cambios,
  };
}

/** Repite el gesto con los intervalos indicados y devuelve si llegó a activarse. */
function pulsar(intervalos: number[]): boolean {
  let estado = GESTO_INICIAL;
  let instante = 1_000;
  let activado = false;
  for (const intervalo of intervalos) {
    instante += intervalo;
    const resultado = registrarPulsacion(estado, instante);
    estado = resultado.estado;
    activado ||= resultado.activar;
  }
  return activado;
}

describe("gesto de la marca", () => {
  it("cinco clics dentro de la ventana lo activan", () => {
    expect(pulsar([0, 200, 200, 200, 200])).toBe(true);
  });

  it("cuatro clics no bastan", () => {
    expect(pulsar([0, 200, 200, 200])).toBe(false);
  });

  it("un clic suelto no deja rastro que active nada", () => {
    const { estado, activar } = registrarPulsacion(GESTO_INICIAL, 1_000);
    expect(activar).toBe(false);
    expect(estado.conteo).toBe(1);
  });

  it("clics demasiado separados reinician el contador", () => {
    expect(pulsar([0, 200, 200, 200, VENTANA_CLICS + 1])).toBe(false);
    expect(pulsar([0, VENTANA_CLICS + 1, 200, 200, 200])).toBe(false);
  });

  it("tras reiniciarse, cinco clics seguidos vuelven a activarlo", () => {
    expect(pulsar([0, 200, VENTANA_CLICS + 1, 100, 100, 100, 100])).toBe(true);
  });

  it("al activarse la racha queda limpia: no encadena activaciones", () => {
    let estado = GESTO_INICIAL;
    for (let i = 0; i < CLICS_NECESARIOS; i += 1) estado = registrarPulsacion(estado, 1_000 + i * 100).estado;
    expect(estado).toEqual(GESTO_INICIAL);
    expect(registrarPulsacion(estado, 1_500).activar).toBe(false);
  });
});

describe("guion del efecto", () => {
  it("empieza y termina en la fecha real", () => {
    expect(GUION.at(-1)).toMatchObject({ desfase: 0, atenuado: false });
  });

  it("solo se desplaza un día en cada sentido", () => {
    expect(GUION.every((paso) => Math.abs(paso.desfase) <= 1)).toBe(true);
    expect(GUION.map((paso) => paso.desfase)).toContain(1);
    expect(GUION.map((paso) => paso.desfase)).toContain(-1);
  });

  it("los pasos van en orden y el efecto es breve", () => {
    const tiempos = GUION.map((paso) => paso.en);
    expect(tiempos).toEqual([...tiempos].sort((a, b) => a - b));
    expect(tiempos.at(-1)).toBeLessThanOrEqual(1_500);
    expect(FIN).toBeLessThanOrEqual(3_000);
  });
});

describe("lectura desplazada", () => {
  it("no modifica el momento real", () => {
    const original = { ...AHORA };
    const desplazado = ahoraDesfasado(AHORA, 1);
    expect(AHORA).toEqual(original);
    expect(desplazado).not.toBe(AHORA);
    expect(ahoraDesfasado(AHORA, 0)).toBe(AHORA);
  });

  it("«Hoy · 18:30» se lee «Mañana» y luego «Ayer», y vuelve", () => {
    const real = describirVencimiento(tarea(), AHORA);
    expect(real?.texto).toBe("Hoy · 18:30");
    const leer = (dias: -1 | 0 | 1) => textoVencimientoDesfasado("2026-09-18", "18:30", AHORA, dias);
    expect(leer(1)).toBe("Mañana · 18:30");
    expect(leer(-1)).toBe("Ayer · 18:30");
    expect(leer(0)).toBe(real?.texto);
  });

  it("una fecha absoluta se convierte en otra etiqueta temporal coherente", () => {
    expect(textoVencimientoDesfasado("2026-09-19", null, AHORA, 0)).toBe("Mañana");
    expect(textoVencimientoDesfasado("2026-09-19", null, AHORA, 1)).toBe("Sábado");
  });

  it("no toca la tarea ni recalcula si está vencida: el prefijo se mantiene", () => {
    const atrasada = tarea({ fechaVencimiento: "2026-09-17", horaVencimiento: null });
    const antes = { ...atrasada };
    const real = describirVencimiento(atrasada, AHORA);
    expect(real?.estado).toBe("vencida");
    expect(real?.texto).toBe("Ayer");
    // Cambia el día que se lee, nunca el estado: «Vencida» sigue delante y en rojo.
    expect(textoVencimientoDesfasado(atrasada.fechaVencimiento, null, AHORA, 1, "Vencida · ")).toBe("Vencida · Hoy");
    expect(textoVencimientoDesfasado(atrasada.fechaVencimiento, null, AHORA, 0, "Vencida · ")).toBe("Vencida · Ayer");
    expect(atrasada).toEqual(antes);
  });

  it("sin fecha no inventa ninguna", () => {
    expect(textoVencimientoDesfasado(null, null, AHORA, 1)).toBe("");
  });

  it("«Vencidas» no es una fecha y no viaja", () => {
    expect(tituloGrupoDesfasado(null, "Vencidas", AHORA, 1)).toBe("Vencidas");
    expect(tituloGrupoDesfasado("2026-09-18", "Hoy", AHORA, 1)).toBe("Mañana");
    expect(tituloGrupoDesfasado("2026-09-18", "Hoy", AHORA, 0)).toBe("Hoy");
  });
});

describe("aislamiento", () => {
  const carpeta = import.meta.dirname;
  const fuentes = readdirSync(carpeta)
    .filter((nombre) => /\.tsx?$/.test(nombre) && !nombre.endsWith(".test.ts"))
    .map((nombre) => [nombre, readFileSync(join(carpeta, nombre), "utf8")] as const);

  it.each(fuentes.map(([nombre, codigo]) => [nombre, codigo]))("%s no persiste nada", (_nombre, codigo) => {
    expect(codigo).not.toMatch(/\bfetch\s*\(/);
    expect(codigo).not.toMatch(/localStorage|sessionStorage|indexedDB/);
    expect(codigo).not.toMatch(/@\/lib\/(cliente|servicios|adaptadores)/);
    expect(codigo).not.toMatch(/proveedor-kairo/);
  });
});
