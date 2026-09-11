import { expect, type Page } from "@playwright/test";

export const CONTRASENA = "contrasena-segura";

export function correoUnico(): string {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@kairo.test`;
}

/** Registra una cuenta nueva y vacía; deja la sesión abierta en la vista Tareas. */
export async function registrarUsuario(page: Page): Promise<string> {
  const correo = correoUnico();
  await page.goto("/registro");
  await page.getByLabel("Correo").fill(correo);
  await page.getByLabel("Contraseña", { exact: true }).fill(CONTRASENA);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await page.waitForURL("/");
  await expect(page.getByRole("heading", { level: 1, name: "Tareas" })).toBeVisible();
  return correo;
}

export function campoAlta(page: Page) {
  return page.getByRole("textbox", { name: "Nueva tarea" });
}

/** El botón principal de una fila: su nombre accesible empieza por el título. */
export function fila(page: Page, titulo: string) {
  return page.getByRole("button", { name: new RegExp(`^${titulo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`) });
}

export function casilla(page: Page, titulo: string) {
  return page.getByRole("checkbox", { name: `Completar: ${titulo}` });
}

export async function crearTarea(page: Page, titulo: string): Promise<void> {
  const campo = campoAlta(page);
  await campo.fill(titulo);
  await campo.press("Enter");
  await expect(fila(page, titulo)).toBeVisible();
}

/** Marca una etiqueta en el filtro pulsando su fila, como haría una persona. */
export async function marcarEnFiltro(page: Page, nombre: string): Promise<void> {
  await page.locator("label", { has: page.getByRole("checkbox", { name: nombre, exact: true }) }).click();
  await expect(page.getByRole("checkbox", { name: nombre, exact: true })).toBeChecked();
}

export async function abrirMas(page: Page): Promise<void> {
  await page.getByRole("button", { name: /^Más/ }).click();
}

/** Fecha local del navegador (YYYY-MM-DD) desplazada `dias`. */
export async function fechaLocal(page: Page, dias = 0): Promise<string> {
  return page.evaluate((desplazamiento) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + desplazamiento);
    const dos = (n: number) => String(n).padStart(2, "0");
    return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
  }, dias);
}

interface DatosTareaApi {
  titulo: string;
  fechaVencimiento?: string | null;
  horaVencimiento?: string | null;
  etiquetaIds?: string[];
  completada?: boolean;
}

/** Preparación rápida por API (misma sesión que la página). Los flujos de UI se prueban aparte. */
export async function crearTareaApi(page: Page, datos: DatosTareaApi): Promise<string> {
  const id = crypto.randomUUID();
  const creada = await page.request.post("/api/tareas", { data: { id, titulo: datos.titulo } });
  expect(creada.status()).toBe(201);
  const cambios = Object.fromEntries(Object.entries(datos).filter(([clave]) => clave !== "titulo"));
  if (Object.keys(cambios).length > 0) {
    const actualizada = await page.request.patch(`/api/tareas/${id}`, { data: cambios });
    expect(actualizada.status()).toBe(200);
  }
  return id;
}

export async function crearEtiquetaApi(page: Page, nombre: string): Promise<string> {
  const id = crypto.randomUUID();
  const respuesta = await page.request.post("/api/etiquetas", { data: { id, nombre } });
  expect(respuesta.status()).toBe(201);
  return id;
}
