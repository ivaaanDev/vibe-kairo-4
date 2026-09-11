import { expect, test } from "@playwright/test";
import { CONTRASENA, abrirMas, crearTarea, fila, registrarUsuario } from "./utilidades";

test("registro, persistencia de sesión, cierre e inicio de sesión", async ({ page }) => {
  const correo = await registrarUsuario(page);
  await expect(page.getByText("Nada pendiente.")).toBeVisible();
  await crearTarea(page, "Primera tarea");

  // La sesión persiste al recargar.
  await page.reload();
  await expect(fila(page, "Primera tarea")).toBeVisible();

  // Cerrar sesión protege la app.
  await abrirMas(page);
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await page.waitForURL("/acceso");
  await page.goto("/");
  await expect(page).toHaveURL(/\/acceso$/);

  // Volver a entrar recupera los datos del usuario.
  await page.getByLabel("Correo").fill(correo);
  await page.getByLabel("Contraseña", { exact: true }).fill(CONTRASENA);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("/");
  await expect(fila(page, "Primera tarea")).toBeVisible();
});

test("credenciales incorrectas muestran un error claro", async ({ page }) => {
  await page.goto("/acceso");
  await page.getByLabel("Correo").fill("nadie@kairo.test");
  await page.getByLabel("Contraseña", { exact: true }).fill("incorrecta-123");
  await page.getByRole("button", { name: "Entrar" }).click();
  // Next.js añade su propio anunciador de rutas con role="alert": se filtra por contenido.
  await expect(page.getByRole("alert").filter({ hasText: "no coinciden" })).toHaveText("El correo o la contraseña no coinciden.");
});

test("los datos están separados por usuario", async ({ browser }) => {
  const primera = await browser.newPage();
  await registrarUsuario(primera);
  await crearTarea(primera, "Solo de la primera cuenta");

  const segunda = await browser.newPage();
  await registrarUsuario(segunda);
  await expect(segunda.getByText("Nada pendiente.")).toBeVisible();
  await expect(fila(segunda, "Solo de la primera cuenta")).toHaveCount(0);

  await primera.close();
  await segunda.close();
});
