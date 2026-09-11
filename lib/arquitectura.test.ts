import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/*
 * Guardas de arquitectura: el núcleo (dominio, tipos, servicios, estado y tokens)
 * no puede depender de React, Next.js, Supabase, Tailwind ni del navegador.
 */

const RAIZ = join(import.meta.dirname, "..");
const NUCLEO = ["lib/dominio", "lib/tipos", "lib/servicios", "lib/estado", "lib/diseno"];
const PROHIBIDOS = [/^react/, /^next/, /^@supabase\//, /^tailwindcss/, /^motion/, /^lucide/, /^node:/, /^@\/app\//, /^@\/lib\/adaptadores/];
const GLOBALES_DE_NAVEGADOR = /\b(window|document|localStorage|sessionStorage|navigator)\s*\./;

function archivos(directorio: string): string[] {
  return readdirSync(directorio).flatMap((nombre) => {
    const ruta = join(directorio, nombre);
    if (statSync(ruta).isDirectory()) return archivos(ruta);
    return /\.tsx?$/.test(nombre) && !nombre.endsWith(".test.ts") ? [ruta] : [];
  });
}

describe("núcleo aislado", () => {
  const fuentes = NUCLEO.flatMap((carpeta) => archivos(join(RAIZ, carpeta)));

  it("existen módulos que comprobar", () => {
    expect(fuentes.length).toBeGreaterThan(10);
  });

  it.each(fuentes.map((ruta) => [relative(RAIZ, ruta), ruta]))("%s no importa infraestructura", (_nombre, ruta) => {
    const codigo = readFileSync(ruta, "utf8");
    const importaciones = [...codigo.matchAll(/(?:import|export)[^'"]*from\s+["']([^"']+)["']/g)].map((m) => m[1] ?? "");
    for (const modulo of importaciones) {
      for (const patron of PROHIBIDOS) expect(modulo, `${modulo} en ${ruta}`).not.toMatch(patron);
    }
    expect(codigo).not.toMatch(GLOBALES_DE_NAVEGADOR);
  });
});
