/*
 * CP-11 (RNF-01): tiempo de carga de la lista y de la agenda con el lote de 200 tareas de 6.2.
 *
 *   KAIRO_QA_CORREO=qa@... KAIRO_QA_CONTRASENA=... node scripts/medir-carga.mjs [URL] [--limpiar]
 *
 * - URL: por omisión, producción (https://vibe-kairo-4.vercel.app).
 * - Usa una cuenta dedicada a pruebas que ya exista y esté confirmada; nunca la de un usuario real.
 * - Siembra el lote si falta: 5 etiquetas y 200 tareas «Carga CP-11 · NNN» (150 con fecha en 14 días,
 *   20 de ellas vencidas, y 50 sin fecha). Si ya existen de una corrida anterior, las reutiliza.
 * - Mide 6 cargas de cada vista con la caché deshabilitada y descarta la primera (arranque en frío,
 *   C-03 de 2.9). Reporta mediana y máximo; el criterio es 2 s o menos.
 * - Con --limpiar borra el lote al terminar.
 *
 * Requiere Chromium de Playwright: npx playwright install chromium
 */
import { randomUUID } from "node:crypto";
import { chromium } from "@playwright/test";

const argumentos = process.argv.slice(2);
const limpiar = argumentos.includes("--limpiar");
const BASE = (argumentos.find((valor) => !valor.startsWith("--")) ?? "https://vibe-kairo-4.vercel.app").replace(/\/$/, "");
const correo = process.env.KAIRO_QA_CORREO;
const contrasena = process.env.KAIRO_QA_CONTRASENA;
if (!correo || !contrasena) {
  console.error("Define KAIRO_QA_CORREO y KAIRO_QA_CONTRASENA con la cuenta de pruebas.");
  process.exit(1);
}

const PREFIJO = "Carga CP-11 · ";
const TOTAL = 200;
const CON_FECHA = 150;
const VENCIDAS = 20;
const MEDICIONES = 6;
const LIMITE_MS = 2000;

// KAIRO_CHROMIUM permite usar un Chromium ya instalado en otra ruta.
const navegador = await chromium.launch({ executablePath: process.env.KAIRO_CHROMIUM || undefined });
const contexto = await navegador.newContext({
  viewport: { width: 1440, height: 900 },
  locale: "es-MX",
  timezoneId: "America/Mexico_City",
});
const api = contexto.request;

async function pedir(metodo, ruta, datos) {
  const respuesta = await api.fetch(`${BASE}${ruta}`, { method: metodo, data: datos });
  if (!respuesta.ok()) throw new Error(`${metodo} ${ruta} respondió ${respuesta.status()}: ${await respuesta.text()}`);
  return respuesta.status() === 204 ? null : respuesta.json();
}

function fechaLocal(desplazamientoDias) {
  const fecha = new Date(Date.now() + desplazamientoDias * 86_400_000);
  return fecha.toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
}

try {
  await pedir("POST", "/api/sesion", { correo, contrasena });
  console.log(`Sesión iniciada en ${BASE} como ${correo}`);

  // ─── Lote de 6.2 ───
  const { etiquetas } = await pedir("GET", "/api/etiquetas");
  const etiquetasLote = [];
  for (let n = 1; n <= 5; n++) {
    const nombre = `Carga ${n}`;
    const existente = etiquetas.find((etiqueta) => etiqueta.nombre === nombre);
    etiquetasLote.push(existente ?? (await pedir("POST", "/api/etiquetas", { id: randomUUID(), nombre })).etiqueta);
  }

  const { tareas } = await pedir("GET", "/api/tareas");
  const existentes = new Set(tareas.filter((tarea) => tarea.titulo.startsWith(PREFIJO)).map((tarea) => tarea.titulo));
  let creadas = 0;
  for (let i = 1; i <= TOTAL; i++) {
    const titulo = `${PREFIJO}${String(i).padStart(3, "0")}`;
    if (existentes.has(titulo)) continue;
    const id = randomUUID();
    await pedir("POST", "/api/tareas", { id, titulo });
    const desplazamiento = i <= VENCIDAS ? -1 - (i % 3) : i % 14;
    await pedir("PATCH", `/api/tareas/${id}`, {
      fechaVencimiento: i <= CON_FECHA ? fechaLocal(desplazamiento) : null,
      etiquetaIds: [etiquetasLote[i % 5].id],
    });
    creadas++;
    if (creadas % 25 === 0) console.log(`  ${creadas} tareas creadas…`);
  }
  console.log(`Lote listo: ${TOTAL} tareas (${creadas} creadas ahora, ${TOTAL - creadas} reutilizadas) y 5 etiquetas.`);

  // ─── Mediciones ───
  const vistas = [
    {
      nombre: "Lista (Tareas)",
      ruta: "/",
      // Lista completa: las 200 tareas del lote están en el DOM.
      lista: (pagina) =>
        pagina.waitForFunction(
          ([prefijo, total]) => (document.querySelector("main")?.textContent ?? "").split(prefijo).length - 1 >= total,
          [PREFIJO, TOTAL],
          { polling: 50, timeout: 20_000 },
        ),
    },
    {
      nombre: "Agenda (Esta semana)",
      ruta: "/agenda?rango=semana",
      lista: (pagina) => pagina.locator("#agenda-contenido").getByText(PREFIJO).first().waitFor({ timeout: 20_000 }),
    },
  ];

  const resultados = [];
  for (const vista of vistas) {
    const tiempos = [];
    for (let n = 0; n < MEDICIONES; n++) {
      const pagina = await contexto.newPage();
      const cdp = await contexto.newCDPSession(pagina);
      await cdp.send("Network.enable");
      await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
      const inicio = performance.now();
      await pagina.goto(`${BASE}${vista.ruta}`);
      await vista.lista(pagina);
      const tiempo = Math.round(performance.now() - inicio);
      if (n > 0) tiempos.push(tiempo);
      await pagina.close();
    }
    const ordenados = [...tiempos].sort((a, b) => a - b);
    const mediana = ordenados[Math.floor(ordenados.length / 2)];
    const maximo = ordenados.at(-1);
    resultados.push({ vista: vista.nombre, tiempos, mediana, maximo });
  }

  console.log(`\nCP-11 · ${new Date().toLocaleString("es-MX", { timeZone: "America/Mexico_City" })} · ${BASE}`);
  console.log("Chromium de escritorio, 1440 px, caché deshabilitada; se descarta la primera carga.\n");
  for (const { vista, tiempos, mediana, maximo } of resultados) {
    const veredicto = maximo <= LIMITE_MS ? "PASA" : mediana <= LIMITE_MS ? "PASA en mediana, máximo fuera" : "NO PASA";
    console.log(`${vista}: ${tiempos.join(", ")} ms · mediana ${mediana} ms · máximo ${maximo} ms → ${veredicto}`);
  }

  if (limpiar) {
    const { tareas: actuales } = await pedir("GET", "/api/tareas");
    const lote = actuales.filter((tarea) => tarea.titulo.startsWith(PREFIJO));
    for (const tarea of lote) await pedir("DELETE", `/api/tareas/${tarea.id}`);
    for (const etiqueta of etiquetasLote) await pedir("DELETE", `/api/etiquetas/${etiqueta.id}`);
    console.log(`\nLote eliminado: ${lote.length} tareas y 5 etiquetas.`);
  }
} finally {
  await navegador.close();
}
