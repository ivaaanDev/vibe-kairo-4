import { afterEach, describe, expect, it, vi } from "vitest";
import { crearClienteKairo } from "./api-kairo";

/** Sustituye fetch y devuelve el espía para inspeccionar cada llamada. */
function simularFetch(respuesta: () => Response | Promise<Response>) {
  const espia = vi.fn<typeof fetch>(async () => respuesta());
  vi.stubGlobal("fetch", espia);
  return espia;
}

function json(cuerpo: unknown, estado = 200): Response {
  return new Response(JSON.stringify(cuerpo), { status: estado, headers: { "Content-Type": "application/json" } });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("cliente HTTP de Kairo", () => {
  it("envía las escrituras con keepalive para que terminen aunque la página se cierre (DEF-01)", async () => {
    const espia = simularFetch(() => json({ tarea: { id: "t1" } }));
    const cliente = crearClienteKairo();

    await cliente.actualizarTarea("t1", { etiquetaIds: ["e1", "e2"] });
    await cliente.crearEtiqueta({ id: "e3", nombre: "Casa", color: "pizarra" });

    expect(espia).toHaveBeenCalledTimes(2);
    for (const [, opciones] of espia.mock.calls) {
      expect(opciones?.keepalive).toBe(true);
    }
    const [ruta, opciones] = espia.mock.calls[0] ?? [];
    expect(ruta).toBe("/api/tareas/t1");
    expect(opciones?.method).toBe("PATCH");
    expect(JSON.parse(String(opciones?.body))).toEqual({ etiquetaIds: ["e1", "e2"] });
  });

  it("no usa keepalive al descargar la exportación", async () => {
    const espia = simularFetch(() => new Response("id,titulo\n", { status: 200 }));
    const resultado = await crearClienteKairo().exportar("csv", "2026-11-07");

    expect(resultado.ok).toBe(true);
    expect(espia.mock.calls[0]?.[1]?.keepalive).toBeUndefined();
  });

  it("devuelve el error del servidor con su código de estado", async () => {
    simularFetch(() => json({ error: { codigo: "no-encontrado", mensaje: "La tarea ya no existe." } }, 404));
    const resultado = await crearClienteKairo().eliminarTarea("t9");

    expect(resultado).toEqual({
      ok: false,
      error: { codigo: "no-encontrado", mensaje: "La tarea ya no existe.", estado: 404 },
    });
  });

  it("distingue la falta de conexión con estado null", async () => {
    simularFetch(() => Promise.reject(new TypeError("Failed to fetch")));
    const resultado = await crearClienteKairo().crearTarea({ id: "t1", titulo: "Pagar la luz" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.estado).toBeNull();
  });

  it("acepta respuestas 204 sin cuerpo", async () => {
    simularFetch(() => new Response(null, { status: 204 }));
    const resultado = await crearClienteKairo().cerrarSesion();

    expect(resultado).toEqual({ ok: true, valor: null });
  });
});
