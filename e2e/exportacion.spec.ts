import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { abrirMas, crearEtiquetaApi, crearTareaApi, marcarEnFiltro, registrarUsuario } from "./utilidades";

test("exportar JSON y CSV en dos acciones incluye todas las tareas y etiquetas, aunque haya filtro", async ({ page }) => {
  await registrarUsuario(page);
  const trabajo = await crearEtiquetaApi(page, "Trabajo");
  const casa = await crearEtiquetaApi(page, "Casa");
  await crearEtiquetaApi(page, "Sin usar");
  await crearTareaApi(page, { titulo: "Con dos etiquetas", etiquetaIds: [trabajo, casa] });
  await crearTareaApi(page, { titulo: "Sin etiquetas" });
  await crearTareaApi(page, { titulo: 'Con "comillas", y comas', completada: true });
  await page.reload();

  // Un filtro activo no limita la exportación.
  await page.getByRole("button", { name: "Filtrar por etiqueta" }).click();
  await marcarEnFiltro(page, "Casa");
  await page.keyboard.press("Escape");

  // JSON: Más → Exportar JSON.
  await abrirMas(page);
  const [descargaJson] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Exportar JSON" }).click()]);
  expect(descargaJson.suggestedFilename()).toMatch(/^kairo-tareas-\d{4}-\d{2}-\d{2}\.json$/);
  const json = JSON.parse(await readFile(await descargaJson.path(), "utf8"));
  expect(json.tareas).toHaveLength(3);
  expect(json.etiquetas.map((e: { nombre: string }) => e.nombre).sort()).toEqual(["Casa", "Sin usar", "Trabajo"]);
  const conEtiquetas = json.tareas.find((t: { titulo: string }) => t.titulo === "Con dos etiquetas");
  expect(conEtiquetas.etiquetas.map((e: { nombre: string }) => e.nombre)).toEqual(["Trabajo", "Casa"]);

  // CSV: Más → Exportar CSV.
  await abrirMas(page);
  const [descargaCsv] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Exportar CSV" }).click()]);
  expect(descargaCsv.suggestedFilename()).toMatch(/\.csv$/);
  const csv = (await readFile(await descargaCsv.path(), "utf8")).replace(/^\uFEFF/, "");
  const lineas = csv.trim().split("\r\n");
  expect(lineas[0]).toContain("titulo");
  expect(lineas).toHaveLength(4);
  expect(csv).toContain("Trabajo; Casa");
  expect(csv).toContain('"Con ""comillas"", y comas"');
});
