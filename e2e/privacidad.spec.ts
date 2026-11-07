import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { registrarUsuario } from "./utilidades";

// CP-19 (RF-11): el aviso de privacidad es público y se llega a él desde el registro.

test("el aviso de privacidad se abre sin sesión y presenta lo que exige R-06", async ({ page }) => {
  await page.goto("/privacidad");
  await expect(page).toHaveURL(/\/privacidad$/);
  await expect(page.getByRole("heading", { level: 1, name: "Aviso de privacidad" })).toBeVisible();

  for (const seccion of ["Responsable", "Qué datos tratamos", "Para qué los usamos", "Quién más los procesa", "Tus derechos ARCO"]) {
    await expect(page.getByRole("heading", { level: 2, name: seccion })).toBeVisible();
  }
  await expect(page.getByText("Supabase", { exact: false }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /@/ }).first()).toHaveAttribute("href", /^mailto:/);

  const resultado = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = resultado.violations.filter((violacion) => violacion.impact === "serious" || violacion.impact === "critical");
  expect(graves.map((violacion) => violacion.id)).toEqual([]);
});

test("el registro enlaza al aviso de privacidad", async ({ page }) => {
  await page.goto("/registro");
  await page.getByRole("link", { name: "aviso de privacidad" }).click();
  await expect(page).toHaveURL(/\/privacidad$/);
  await expect(page.getByRole("heading", { level: 1, name: "Aviso de privacidad" })).toBeVisible();
});

test("con sesión iniciada el aviso también se puede consultar", async ({ page }) => {
  await registrarUsuario(page);
  await page.goto("/privacidad");
  await expect(page).toHaveURL(/\/privacidad$/);
  await expect(page.getByRole("heading", { level: 1, name: "Aviso de privacidad" })).toBeVisible();
});
