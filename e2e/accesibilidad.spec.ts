import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { campoAlta, casilla, crearEtiquetaApi, crearTareaApi, fechaLocal, fila, registrarUsuario } from "./utilidades";

async function sinViolacionesGraves(page: Page) {
  const resultado = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = resultado.violations.filter((violacion) => violacion.impact === "serious" || violacion.impact === "critical");
  expect(graves.map((violacion) => `${violacion.id}: ${violacion.nodes.map((nodo) => nodo.target.join(" ")).join(", ")}`)).toEqual([]);
}

async function prepararDatos(page: Page) {
  await registrarUsuario(page);
  const trabajo = await crearEtiquetaApi(page, "Trabajo");
  await crearTareaApi(page, { titulo: "Vencida de ayer", fechaVencimiento: await fechaLocal(page, -1), etiquetaIds: [trabajo] });
  await crearTareaApi(page, { titulo: "Hoy por la noche", fechaVencimiento: await fechaLocal(page), horaVencimiento: "23:59" });
  await crearTareaApi(page, { titulo: "Terminada", completada: true });
  await page.reload();
}

test("sin violaciones WCAG graves en acceso, tareas, detalle, filtro y agenda", async ({ page }) => {
  await page.goto("/acceso");
  await sinViolacionesGraves(page);

  await prepararDatos(page);
  await sinViolacionesGraves(page);

  await fila(page, "Hoy por la noche").click();
  await expect(page.locator('[aria-label="Detalle de la tarea"]')).toBeVisible();
  await sinViolacionesGraves(page);
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Filtrar por etiqueta" }).click();
  await sinViolacionesGraves(page);
  await page.keyboard.press("Escape");

  await page.goto("/agenda?rango=semana");
  await expect(page.getByRole("tabpanel")).toBeVisible();
  await sinViolacionesGraves(page);
});

test("toda la gestión principal se opera con teclado", async ({ page }) => {
  await registrarUsuario(page);
  await page.locator("body").click({ position: { x: 1, y: 1 } });

  // Tab llega al alta rápida.
  for (let intento = 0; intento < 12 && !(await campoAlta(page).evaluate((el) => el === document.activeElement)); intento++) {
    await page.keyboard.press("Tab");
  }
  await expect(campoAlta(page)).toBeFocused();
  await page.keyboard.type("Con teclado");
  await page.keyboard.press("Enter");
  await expect(fila(page, "Con teclado")).toBeVisible();

  // Completar con Espacio.
  await casilla(page, "Con teclado").focus();
  await page.keyboard.press("Space");
  await expect(casilla(page, "Con teclado")).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("Space");
  await expect(casilla(page, "Con teclado")).toHaveAttribute("aria-checked", "false");

  // Enter abre el detalle; Escape lo cierra y devuelve el foco.
  await page.keyboard.press("Tab");
  await expect(fila(page, "Con teclado")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator('[aria-label="Detalle de la tarea"]')).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator('[aria-label="Detalle de la tarea"]')).toHaveCount(0);
  await expect(fila(page, "Con teclado")).toBeFocused();

  // El filtro se abre y se cierra con teclado, devolviendo el foco.
  const filtro = page.getByRole("button", { name: "Filtrar por etiqueta" });
  await filtro.focus();
  await page.keyboard.press("Enter");
  await expect(filtro).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(filtro).toHaveAttribute("aria-expanded", "false");
  await expect(filtro).toBeFocused();
});

test("el foco es visible", async ({ page }) => {
  await registrarUsuario(page);
  await campoAlta(page).fill("Foco visible");
  await campoAlta(page).press("Enter");
  const control = casilla(page, "Foco visible");
  // Llegar con teclado activa :focus-visible.
  await control.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(control).toBeFocused();
  const contorno = await control.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(contorno).not.toBe("none");
});

test.describe("movimiento reducido", () => {
  test.use({ reducedMotion: "reduce" });

  test("las transiciones se anulan cuando el sistema lo pide", async ({ page }) => {
    await registrarUsuario(page);
    await campoAlta(page).fill("Sin movimiento");
    await campoAlta(page).press("Enter");
    const duracion = await fila(page, "Sin movimiento")
      .locator(".tachado-animado")
      .evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration));
    expect(duracion).toBeLessThan(0.01);
  });
});

test("la pantalla principal expone como máximo cinco acciones globales", async ({ page }) => {
  await registrarUsuario(page);
  const globales = page.locator(
    'nav[aria-label="Principal"] a:visible, nav[aria-label="Principal"] button:visible, header button:visible, header input:visible',
  );
  await expect(globales).toHaveCount(5);
  const nombres = await globales.evaluateAll((elementos) =>
    elementos.map((el) => el.getAttribute("aria-label") ?? el.textContent?.trim() ?? ""),
  );
  expect(nombres.join(" | ")).toMatch(/Tareas/);
  expect(nombres.join(" | ")).toMatch(/Agenda/);
  expect(nombres.join(" | ")).toMatch(/Más/);
  expect(nombres.join(" | ")).toMatch(/Filtrar por etiqueta/);
});

test("sin desplazamiento horizontal en ninguna vista", async ({ page }) => {
  await prepararDatos(page);
  const sinDesbordar = () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(await sinDesbordar()).toBe(true);
  await fila(page, "Vencida de ayer").click();
  expect(await sinDesbordar()).toBe(true);
  await page.goto("/agenda?rango=semana");
  expect(await sinDesbordar()).toBe(true);
});
