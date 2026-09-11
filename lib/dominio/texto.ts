/** Longitud en caracteres visibles (puntos de código), coherente con `char_length` de PostgreSQL. */
export function longitud(texto: string): number {
  return Array.from(texto).length;
}

/** Recorta a `maximo` puntos de código sin partir pares sustitutos. */
export function recortar(texto: string, maximo: number): string {
  return Array.from(texto).slice(0, maximo).join("");
}

const PATRON_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function esIdValido(id: unknown): id is string {
  return typeof id === "string" && PATRON_UUID.test(id);
}

/** Comparación insensible a mayúsculas y acentos, usada para nombres de etiqueta. */
export function claveComparable(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}
