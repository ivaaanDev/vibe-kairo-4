/*
 * La marca: un anillo —el mismo trazo que la casilla de completado— y un punto
 * que marca un instante sobre él. Kairós: el momento oportuno.
 * `animada` hace que el punto recorra un tramo del anillo al aparecer (solo en el acceso).
 */

const RADIO = 7.5;
const ANGULO = (-30 * Math.PI) / 180;
const PUNTO = { x: 12 + RADIO * Math.cos(ANGULO), y: 12 + RADIO * Math.sin(ANGULO) };

export function KairoMark({ tamano = 20, animada = false, className = "" }: { tamano?: number; animada?: boolean; className?: string }) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <circle cx="12" cy="12" r={RADIO} stroke="currentColor" strokeWidth="1.75" />
      <g
        style={{ transformOrigin: "12px 12px" }}
        className={animada ? "motion-safe:animate-[kairo-orbita_900ms_var(--k-curva-estandar)_120ms_both]" : undefined}
      >
        <circle cx={PUNTO.x} cy={PUNTO.y} r="2.4" fill="var(--k-accent)" />
      </g>
    </svg>
  );
}

export function KairoWordmark({ className = "" }: { className?: string }) {
  return <span className={`text-[17px] leading-none font-semibold tracking-[-0.02em] ${className}`}>kairo</span>;
}
