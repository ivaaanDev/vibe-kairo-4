import { expect, test } from "@playwright/test";
import { campoAlta, casilla, crearTarea, fila, registrarUsuario } from "./utilidades";

test.beforeEach(async ({ page }) => {
  await registrarUsuario(page);
});

test("crear una tarea: tres interacciones, menos de diez segundos, sin modal", async ({ page }) => {
  const inicio = Date.now();
  const campo = campoAlta(page);
  await campo.click(); // 1
  await campo.pressSequentially("Llamar al banco"); // 2
  await campo.press("Enter"); // 3
  await expect(fila(page, "Llamar al banco")).toBeVisible();
  expect(Date.now() - inicio).toBeLessThan(10_000);

  // Sin diálogos y con el campo listo para la siguiente.
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(campo).toBeFocused();
  await expect(campo).toHaveValue("");

  await page.reload();
  await expect(fila(page, "Llamar al banco")).toBeVisible();
});

test("Enter con el campo vacío no crea nada", async ({ page }) => {
  await campoAlta(page).press("Enter");
  await expect(page.getByText("Nada pendiente.")).toBeVisible();
});

test("completar y revertir con el mismo control", async ({ page }) => {
  await crearTarea(page, "Regar las plantas");
  await crearTarea(page, "Otra tarea");
  const control = casilla(page, "Regar las plantas");

  await control.click();
  await expect(control).toHaveAttribute("aria-checked", "true");
  // La fila no desaparece: sigue en su sitio y puede revertirse.
  await expect(page.getByRole("list", { name: "Tareas pendientes" }).getByText("Regar las plantas")).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: /Completadas/ }).click();
  const completada = page.getByRole("list", { name: "Tareas completadas" });
  await expect(completada.getByText("Regar las plantas")).toBeVisible();

  await casilla(page, "Regar las plantas").click();
  await expect(page.getByRole("list", { name: "Tareas pendientes" }).getByText("Regar las plantas")).toBeVisible();
  await page.reload();
  await expect(casilla(page, "Regar las plantas")).toHaveAttribute("aria-checked", "false");
});

test("editar título, descripción, fecha y hora desde el detalle", async ({ page }) => {
  await crearTarea(page, "Informe");
  await fila(page, "Informe").click();

  // Inspector acoplado en escritorio, pantalla apilada en móvil: el mismo nombre accesible.
  const panel = page.locator('[aria-label="Detalle de la tarea"]');
  await expect(panel).toBeVisible();

  const titulo = panel.getByRole("textbox", { name: "Título" });
  await titulo.fill("Informe trimestral");
  await titulo.press("Enter");
  await panel.getByRole("textbox", { name: "Descripción" }).fill("Incluir cifras de agosto.");
  await panel.getByRole("button", { name: "Mañana" }).click();
  await panel.getByRole("button", { name: "Añadir hora" }).click();
  await panel.getByLabel("Hora").fill("09:30");
  await expect(panel.getByRole("status")).toContainText(/Guardado|Guardando/);

  // «Añadir hora» abre el selector nativo de hora: el primer Escape lo cierra a él, el segundo cierra el panel.
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  const actualizada = fila(page, "Informe trimestral");
  await expect(actualizada).toContainText("Mañana · 09:30");
  await expect(actualizada).toContainText("Tiene nota");
  // El foco vuelve a la fila que abrió el detalle.
  await expect(actualizada).toBeFocused();

  await page.reload();
  await expect(fila(page, "Informe trimestral")).toContainText("Mañana · 09:30");
});

test("quitar la fecha quita también la hora", async ({ page }) => {
  await crearTarea(page, "Cita");
  await fila(page, "Cita").click();
  const panel = page.locator('[aria-label="Detalle de la tarea"]');
  await panel.getByRole("button", { name: "Hoy" }).click();
  await panel.getByRole("button", { name: "Añadir hora" }).click();
  await panel.getByLabel("Hora").fill("23:59");
  await panel.getByRole("button", { name: "Quitar fecha" }).click();
  await expect(panel.getByRole("button", { name: "Añadir hora" })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(fila(page, "Cita")).toHaveText("Cita");
});

test("eliminar es deliberado y persiste", async ({ page }) => {
  await crearTarea(page, "Borrar esto");
  await fila(page, "Borrar esto").click();
  const panel = page.locator('[aria-label="Detalle de la tarea"]');
  await panel.getByRole("button", { name: "Eliminar tarea" }).click();
  await expect(page.getByRole("group", { name: "Confirmar eliminación" })).toBeVisible();
  await page.getByRole("button", { name: "Eliminar", exact: true }).click();

  await expect(fila(page, "Borrar esto")).toHaveCount(0);
  await page.reload();
  await expect(fila(page, "Borrar esto")).toHaveCount(0);
});

test("una tarea sin fecha no muestra marcadores de fecha", async ({ page }) => {
  await crearTarea(page, "Sin fecha");
  await expect(fila(page, "Sin fecha")).toHaveText("Sin fecha");
});
