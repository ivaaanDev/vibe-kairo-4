import { describe, expect, it } from "vitest";
import { CORREO_CONTACTO } from "./contacto";

describe("correo de contacto del aviso de privacidad (RF-11)", () => {
  it("es un correo válido", () => {
    expect(CORREO_CONTACTO).toMatch(/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i);
  });

  it("ya no es el correo de ejemplo", () => {
    expect(CORREO_CONTACTO.endsWith(".invalid")).toBe(false);
  });
});
