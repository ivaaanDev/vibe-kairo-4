import { expect, test } from "@playwright/test";
import { abrirMas, crearEtiquetaApi, crearTarea, crearTareaApi, fila, marcarEnFiltro, registrarUsuario } from "./utilidades";

test.beforeEach(async ({ page }) => {
  await registrarUsuario(page);
});

test("crear y asignar varias etiquetas desde el detalle", async ({ page }) => {
  await crearTarea(page, "Cobrar factura");
  await fila(page, "Cobrar factura").click();
  const panel = page.locator('[aria-label="Detalle de la tarea"]');

  await panel.getByRole("button", { name: "Añadir etiqueta" }).click();
  const buscador = panel.getByRole("textbox", { name: "Buscar o crear etiqueta" });
  await buscador.fill("Trabajo");
  await buscador.press("Enter");
  await buscador.fill("Pendientes por cobrar");
  await buscador.press("Enter");
  await panel.getByRole("button", { name: "Listo" }).click();

  await expect(panel.getByRole("button", { name: "Quitar etiqueta Trabajo" })).toBeVisible();
  await expect(panel.getByRole("button", { name: "Quitar etiqueta Pendientes por cobrar" })).toBeVisible();
  await page.keyboard.press("Escape");

  await expect(fila(page, "Cobrar factura")).toContainText("Trabajo, Pendientes por cobrar");
  await page.reload();
  await expect(fila(page, "Cobrar factura")).toContainText("Trabajo, Pendientes por cobrar");
});

test("el filtro es un único control cerrado que filtra por etiquetas", async ({ page }) => {
  const trabajo = await crearEtiquetaApi(page, "Trabajo");
  await crearEtiquetaApi(page, "Casa");
  await crearTareaApi(page, { titulo: "Con etiqueta", etiquetaIds: [trabajo] });
  await crearTareaApi(page, { titulo: "Sin etiqueta" });
  await page.reload();

  const filtro = page.getByRole("button", { name: "Filtrar por etiqueta" });
  await expect(filtro).toHaveAttribute("aria-expanded", "false");
  await filtro.click();
  await marcarEnFiltro(page, "Trabajo");

  await expect(fila(page, "Con etiqueta")).toBeVisible();
  await expect(fila(page, "Sin etiqueta")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Filtro de etiquetas: Trabajo" })).toBeVisible();

  await page.getByRole("button", { name: "Quitar filtro" }).click();
  await expect(fila(page, "Sin etiqueta")).toBeVisible();
});

test("renombrar y eliminar una etiqueta nunca elimina tareas", async ({ page }) => {
  const casa = await crearEtiquetaApi(page, "Casa");
  await crearTareaApi(page, { titulo: "Pintar la cocina", etiquetaIds: [casa] });
  await page.reload();

  await abrirMas(page);
  await page.getByRole("button", { name: "Etiquetas", exact: true }).click();
  const gestor = page.locator('[aria-label="Etiquetas"]').last();

  const nombre = gestor.getByRole("textbox", { name: "Nombre de la etiqueta Casa" });
  await nombre.fill("Hogar");
  await nombre.press("Enter");
  await expect(gestor.getByRole("textbox", { name: "Nombre de la etiqueta Hogar" })).toBeVisible();

  await gestor.getByRole("button", { name: "Eliminar Hogar" }).click();
  await expect(gestor.getByText("Las tareas se conservan.")).toBeVisible();
  await gestor.getByRole("button", { name: "Eliminar", exact: true }).click();
  await expect(gestor.getByText("Aún no hay etiquetas.")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(fila(page, "Pintar la cocina")).toHaveText("Pintar la cocina");
  await page.reload();
  await expect(fila(page, "Pintar la cocina")).toBeVisible();
});
