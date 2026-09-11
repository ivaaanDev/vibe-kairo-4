import { describe, expect, it } from "vitest";
import {
  diaDeLaSemana,
  diferenciaEnDias,
  esFechaValida,
  esHoraValida,
  momentoLocalDesde,
  sumarDias,
} from "./fecha-local";
import { fechaCorta, fechaLarga } from "./formato-fecha";

describe("fechas locales", () => {
  it("valida fechas reales de calendario", () => {
    expect(esFechaValida("2026-09-10")).toBe(true);
    expect(esFechaValida("2028-02-29")).toBe(true);
    expect(esFechaValida("2026-02-29")).toBe(false);
    expect(esFechaValida("2026-13-01")).toBe(false);
    expect(esFechaValida("2026-9-10")).toBe(false);
    expect(esFechaValida("10/09/2026")).toBe(false);
  });

  it("valida horas de 24 h", () => {
    expect(esHoraValida("00:00")).toBe(true);
    expect(esHoraValida("23:59")).toBe(true);
    expect(esHoraValida("24:00")).toBe(false);
    expect(esHoraValida("9:30")).toBe(false);
  });

  it("suma días cruzando meses, años y cambios de horario", () => {
    expect(sumarDias("2026-09-30", 1)).toBe("2026-10-01");
    expect(sumarDias("2026-12-31", 1)).toBe("2027-01-01");
    expect(sumarDias("2026-03-01", -1)).toBe("2026-02-28");
    expect(sumarDias("2026-10-24", 7)).toBe("2026-10-31");
  });

  it("calcula diferencias y día de la semana", () => {
    expect(diferenciaEnDias("2026-09-10", "2026-09-17")).toBe(7);
    expect(diferenciaEnDias("2026-09-10", "2026-09-08")).toBe(-2);
    expect(diaDeLaSemana("2026-09-10")).toBe(4);
  });

  it("toma calendario y reloj locales de un Date", () => {
    expect(momentoLocalDesde(new Date(2026, 8, 10, 7, 5))).toEqual({ fecha: "2026-09-10", hora: "07:05" });
  });

  it("formatea en español sin depender de Intl", () => {
    expect(fechaLarga("2026-09-10")).toBe("Jueves, 10 de septiembre");
    expect(fechaCorta("2026-09-12", "2026-09-10")).toBe("12 sep");
    expect(fechaCorta("2027-01-03", "2026-09-10")).toBe("3 ene 2027");
  });
});
