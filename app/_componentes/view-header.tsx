/** Cabecera fija de cada vista: título grande, acciones a la derecha y controles propios debajo. */
export function ViewHeader({
  titulo,
  subtitulo,
  acciones,
  children,
}: {
  titulo: string;
  subtitulo?: string | null;
  acciones?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 bg-bg pt-3 sm:pt-8">
      <div className="flex min-h-12 items-end justify-between gap-3">
        <div className="min-w-0 pb-1">
          <p className="h-[18px] text-[13px] leading-[18px] text-fg-muted" aria-hidden={!subtitulo}>
            {subtitulo}
          </p>
          <h1 id="titulo-vista" tabIndex={-1} className="truncate text-[26px] leading-8 font-[650] tracking-[-0.015em]">
            {titulo}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-1 pb-0.5">{acciones}</div>
      </div>
      {children}
    </header>
  );
}
