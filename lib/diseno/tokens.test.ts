import { describe, expect, it } from "vitest";
import { COLORES_ETIQUETA } from "@/lib/tipos/etiqueta";
import { relacionDeContraste } from "./contraste";
import { hojaDeTokens } from "./css-tokens";
import { coloresEtiquetaClaros, coloresEtiquetaOscuros, movimiento, paletaClara, paletaOscura } from "./tokens";

const paletas = [
  ["clara", paletaClara, coloresEtiquetaClaros],
  ["oscura", paletaOscura, coloresEtiquetaOscuros],
] as const;

describe.each(paletas)("paleta %s", (_nombre, paleta, etiquetas) => {
  const fondos = [paleta.background, paleta.surface, paleta.surfaceSecondary];

  it.each(fondos)("el texto primario y secundario alcanzan 4.5:1 sobre %s", (fondo) => {
    expect(relacionDeContraste(paleta.textPrimary, fondo)).toBeGreaterThanOrEqual(4.5);
    expect(relacionDeContraste(paleta.textSecondary, fondo)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(fondos)("acento y peligro son legibles como texto sobre %s", (fondo) => {
    expect(relacionDeContraste(paleta.accent, fondo)).toBeGreaterThanOrEqual(4.5);
    expect(relacionDeContraste(paleta.danger, fondo)).toBeGreaterThanOrEqual(4.5);
  });

  it("el texto sobre relleno de acento alcanza 4.5:1", () => {
    expect(relacionDeContraste(paleta.accentContrast, paleta.accent)).toBeGreaterThanOrEqual(4.5);
  });

  it("el texto sobre la selección tenue sigue siendo legible", () => {
    expect(relacionDeContraste(paleta.textPrimary, paleta.accentSoft)).toBeGreaterThanOrEqual(4.5);
    expect(relacionDeContraste(paleta.textSecondary, paleta.accentSoft)).toBeGreaterThanOrEqual(4.5);
  });

  it("los contornos de controles y el foco alcanzan 3:1 (WCAG 1.4.11)", () => {
    for (const fondo of fondos) {
      expect(relacionDeContraste(paleta.borderStrong, fondo)).toBeGreaterThanOrEqual(3);
      expect(relacionDeContraste(paleta.focus, fondo)).toBeGreaterThanOrEqual(3);
    }
  });

  it("los indicadores de etiqueta alcanzan 3:1 sobre el fondo", () => {
    for (const color of COLORES_ETIQUETA) {
      expect(relacionDeContraste(etiquetas[color], paleta.background)).toBeGreaterThanOrEqual(3);
      expect(relacionDeContraste(etiquetas[color], paleta.surface)).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("movimiento", () => {
  it("ninguna duración supera 280 ms", () => {
    for (const duracion of Object.values(movimiento.duracion)) expect(duracion).toBeLessThanOrEqual(280);
  });
});

describe("hoja de tokens", () => {
  it("declara cada token semántico para ambos esquemas", () => {
    const hoja = hojaDeTokens();
    for (const nombre of ["background", "surface", "surface-secondary", "text-primary", "text-secondary", "border", "accent", "danger", "focus"]) {
      expect(hoja.match(new RegExp(`--k-${nombre}:`, "g"))).toHaveLength(2);
    }
    expect(hoja).toContain("prefers-color-scheme:dark");
  });
});
