/** Relación de contraste WCAG 2.x entre dos colores hexadecimales opacos. */
export function relacionDeContraste(a: string, b: string): number {
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x) as [number, number];
  return (claro + 0.05) / (oscuro + 0.05);
}

function luminancia(hex: string): number {
  const limpio = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(limpio)) throw new Error(`Color no admitido: ${hex}`);
  const canales = [0, 2, 4].map((inicio) => {
    const valor = parseInt(limpio.slice(inicio, inicio + 2), 16) / 255;
    return valor <= 0.04045 ? valor / 12.92 : ((valor + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * canales[0] + 0.7152 * canales[1] + 0.0722 * canales[2];
}
