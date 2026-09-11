import { expect, test } from "@playwright/test";
import { crearTareaApi, fechaLocal, registrarUsuario } from "./utilidades";

test("Hoy y Esta semana: orden cronológico, vencidas distinguidas y sin tareas sin fecha", async ({ page }) => {
  await registrarUsuario(page);
  const [ayer, hoy, manana, enOcho] = await Promise.all([fechaLocal(page, -1), fechaLocal(page), fechaLocal(page, 1), fechaLocal(page, 8)]);

  await crearTareaApi(page, { titulo: "Sin fecha" });
  await crearTareaApi(page, { titulo: "Hoy a última hora", fechaVencimiento: hoy, horaVencimiento: "23:59" });
  await crearTareaApi(page, { titulo: "Hoy sin hora", fechaVencimiento: hoy });
  await crearTareaApi(page, { titulo: "Mañana temprano", fechaVencimiento: manana, horaVencimiento: "08:00" });
  await crearTareaApi(page, { titulo: "Atrasada", fechaVencimiento: ayer });
  await crearTareaApi(page, { titulo: "Fuera de la semana", fechaVencimiento: enOcho });

  await page.goto("/agenda");
  await expect(page.getByRole("tab", { name: "Hoy" })).toHaveAttribute("aria-selected", "true");

  const panel = page.getByRole("tabpanel");
  const vencidas = panel.getByRole("region", { name: /^Vencidas/ });
  await expect(vencidas.getByRole("button", { name: /^Atrasada/ })).toContainText("Vencida");

  const deHoy = panel.getByRole("region", { name: /^Hoy/ });
  await expect(deHoy.getByRole("button", { name: /^Hoy/ })).toHaveText([/^Hoy sin hora/, /^Hoy a última hora/]);

  await expect(panel.getByText("Sin fecha")).toHaveCount(0);
  await expect(panel.getByText("Mañana temprano")).toHaveCount(0);

  await page.getByRole("tab", { name: "Esta semana" }).click();
  await expect(page).toHaveURL(/rango=semana/);
  const titulos = panel.locator("[data-tarea-id]");
  await expect(titulos).toHaveText([/^Atrasada/, /^Hoy sin hora/, /^Hoy a última hora/, /^Mañana temprano/]);
  await expect(panel.getByText("Sin fecha")).toHaveCount(0);
  await expect(panel.getByText("Fuera de la semana")).toHaveCount(0);
});

test("una agenda vacía lo dice en una línea", async ({ page }) => {
  await registrarUsuario(page);
  await page.goto("/agenda");
  await expect(page.getByText("Nada para hoy.")).toBeVisible();
  await page.getByRole("tab", { name: "Esta semana" }).click();
  await expect(page.getByText("Semana despejada.")).toBeVisible();
});

test("el selector de rango se opera con flechas", async ({ page }) => {
  await registrarUsuario(page);
  await page.goto("/agenda");
  await page.getByRole("tab", { name: "Hoy" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Esta semana" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tab", { name: "Esta semana" })).toBeFocused();
});
