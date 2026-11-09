import { defineConfig, devices } from "@playwright/test";

/*
 * Flujos funcionales contra el servidor de producción con el adaptador local:
 * mismas rutas, mismos servicios y dominio que con Supabase, sin depender de la red.
 */

const PUERTO = 3200;

// CP-17 (RNF-07): Firefox y Edge se activan con KAIRO_E2E_NAVEGADORES=1; la CI los corre en un trabajo aparte.
const ESCRITORIO = { width: 1440, height: 900 };
const navegadoresExtra =
  process.env.KAIRO_E2E_NAVEGADORES === "1"
    ? [
        { name: "firefox", use: { ...devices["Desktop Firefox"], viewport: ESCRITORIO } },
        { name: "edge", use: { ...devices["Desktop Edge"], channel: "msedge", viewport: ESCRITORIO } },
      ]
    : [];

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  // En CI, un reintento separa los fallos reales de los intermitentes (Playwright los marca como «flaky»).
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 3,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PUERTO}`,
    locale: "es-ES",
    timezoneId: "America/Mexico_City",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "escritorio", use: { ...devices["Desktop Chrome"], viewport: ESCRITORIO } },
    { name: "movil-360", use: { ...devices["Pixel 7"], viewport: { width: 360, height: 780 } } },
    ...navegadoresExtra,
  ],
  webServer: {
    command: `npx next build && npx next start -p ${PUERTO}`,
    port: PUERTO,
    timeout: 240_000,
    reuseExistingServer: !process.env.CI,
    env: {
      KAIRO_ADAPTADOR: "local",
      KAIRO_PERMITIR_LOCAL: "1",
      KAIRO_DIRECTORIO_LOCAL: ".kairo-local/e2e",
    },
  },
});
