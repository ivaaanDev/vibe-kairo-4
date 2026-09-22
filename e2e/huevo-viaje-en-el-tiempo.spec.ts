import { expect, test } from "@playwright/test";
import { crearTareaApi, fechaLocal, fila, registrarUsuario } from "./utilidades";

/*
 * Easter egg «Viaje en el tiempo». Solo es presentación: lo que se comprueba aquí
 * es que ocurre, que no escribe nada y que la interfaz queda como estaba.
 * La marca vive en el rail lateral, que no existe por debajo de 640 px.
 */

const MENSAJE = "Ups. Línea temporal equivocada.";

test.skip(({ viewport }) => (viewport?.width ?? 0) < 640, "Sin rail lateral no hay marca que pulsar.");

test("cinco clics en la marca desplazan las fechas y las devuelven intactas", async ({ page }) => {
  await registrarUsuario(page);
  await crearTareaApi(page, { titulo: "Llamar al banco", fechaVencimiento: await fechaLocal(page), horaVencimiento: "18:30" });
  await page.reload();

  const tarea = fila(page, "Llamar al banco");
  await expect(tarea).toContainText("Hoy · 18:30");

  const escrituras: string[] = [];
  page.on("request", (peticion) => {
    if (peticion.method() !== "GET") escrituras.push(`${peticion.method()} ${peticion.url()}`);
  });

  const marca = page.locator("[data-marca='kairo']");

  // Un clic suelto sobre la marca no hace absolutamente nada.
  await marca.click();
  await page.waitForTimeout(1_600);
  await expect(page.getByText(MENSAJE)).toHaveCount(0);

  await marca.click({ clickCount: 5, delay: 40 });

  // Durante un instante la tarea de hoy se lee como si fuese de mañana.
  await page.waitForFunction(() => document.getElementById("contenido")?.textContent?.includes("Mañana · 18:30") ?? false, null, {
    timeout: 3_000,
  });
  await expect(page.getByText(MENSAJE)).toBeVisible();

  // Y vuelve sola, mensaje incluido.
  await expect(tarea).toContainText("Hoy · 18:30");
  await expect(page.getByText(MENSAJE)).toHaveCount(0);
  await expect(tarea).toContainText("Hoy · 18:30");

  expect(escrituras).toEqual([]);
});

test.describe("con movimiento reducido", () => {
  test.use({ reducedMotion: "reduce" });

  test("en Agenda cambian las etiquetas, nunca los grupos ni el orden", async ({ page }) => {
    await registrarUsuario(page);
    const [ayer, hoy] = await Promise.all([fechaLocal(page, -1), fechaLocal(page)]);
    await crearTareaApi(page, { titulo: "Pagar la luz", fechaVencimiento: ayer });
    await crearTareaApi(page, { titulo: "Comprar pan", fechaVencimiento: hoy, horaVencimiento: "09:00" });
    await crearTareaApi(page, { titulo: "Recoger paquete", fechaVencimiento: hoy, horaVencimiento: "17:00" });
    await page.goto("/agenda");

    const filas = page.locator("[data-tarea-id]");
    const ordenAntes = await filas.evaluateAll((elementos) => elementos.map((elemento) => elemento.getAttribute("data-tarea-id")));
    expect(ordenAntes).toHaveLength(3);
    await expect(page.getByRole("region", { name: /^Vencidas/ })).toBeVisible();
    await expect(page.getByRole("region", { name: /^Hoy/ })).toBeVisible();

    await page.locator("[data-marca='kairo']").click({ clickCount: 5, delay: 40 });

    // Instantánea tomada mientras el grupo «Hoy» se lee «Mañana».
    const durante = await page
      .waitForFunction(
        () => {
          const titulos = [...document.querySelectorAll("section h2")].map((titulo) => titulo.textContent?.trim() ?? "");
          if (!titulos.some((titulo) => titulo.startsWith("Mañana"))) return null;
          return {
            titulos,
            orden: [...document.querySelectorAll("[data-tarea-id]")].map((elemento) => elemento.getAttribute("data-tarea-id")),
          };
        },
        null,
        { timeout: 3_000 },
      )
      .then((resultado) => resultado.jsonValue());

    expect(durante?.orden).toEqual(ordenAntes);
    expect(durante?.titulos.some((titulo) => titulo.startsWith("Vencidas"))).toBe(true);
    await expect(page.getByText(MENSAJE)).toBeVisible();

    await expect(page.getByRole("region", { name: /^Hoy/ })).toBeVisible();
    await expect(filas).toHaveCount(3);
    expect(await filas.evaluateAll((elementos) => elementos.map((elemento) => elemento.getAttribute("data-tarea-id")))).toEqual(ordenAntes);
  });
});
