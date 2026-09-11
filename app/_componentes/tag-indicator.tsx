import type { ColorEtiqueta, Etiqueta } from "@/lib/tipos/etiqueta";

export function colorDeEtiqueta(color: ColorEtiqueta): string {
  return `var(--k-etiqueta-${color})`;
}

export function TagDot({ color, tamano = 8 }: { color: ColorEtiqueta; tamano?: number }) {
  return (
    <span aria-hidden className="inline-block shrink-0 rounded-full" style={{ width: tamano, height: tamano, background: colorDeEtiqueta(color) }} />
  );
}

/** Indicador compacto: puntos de color y nombres, nunca chips grandes dentro de la fila. */
export function TagIndicator({ etiquetas, maximoNombres = 2 }: { etiquetas: readonly Etiqueta[]; maximoNombres?: number }) {
  if (etiquetas.length === 0) return null;
  const nombres = etiquetas.slice(0, maximoNombres).map((etiqueta) => etiqueta.nombre);
  const resto = etiquetas.length - nombres.length;
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <span aria-hidden className="flex shrink-0 items-center -space-x-[2px]">
        {etiquetas.slice(0, 3).map((etiqueta) => (
          <span
            key={etiqueta.id}
            className="inline-block size-[8px] rounded-full ring-[1.5px] ring-bg"
            style={{ background: colorDeEtiqueta(etiqueta.color) }}
          />
        ))}
      </span>
      <span className="truncate">
        <span className="sr-only">Etiquetas: </span>
        {nombres.join(", ")}
        {resto > 0 && ` +${resto}`}
      </span>
    </span>
  );
}
