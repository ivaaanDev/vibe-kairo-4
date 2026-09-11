"use client";

import { Ellipsis, FileBraces, FileSpreadsheet, LoaderCircle, LogOut, Tags, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { usePanel } from "@/app/_estado/panel-contextual";
import { clienteKairo, useKairo } from "@/app/_estado/proveedor-kairo";
import { nombreArchivoExportacion } from "@/lib/dominio/exportacion";
import { momentoLocalDesde } from "@/lib/dominio/fecha-local";
import { descargarArchivo } from "@/lib/plataforma/web/descargar-archivo";
import type { FormatoExportacion } from "@/lib/tipos/api";
import { AdaptiveSurface } from "./primitivas/adaptive-surface";

function ItemMenu({
  icono: Icono,
  children,
  ocupado = false,
  ...resto
}: { icono: LucideIcon; ocupado?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      data-item-menu
      aria-busy={ocupado || undefined}
      className="flex h-11 w-full items-center gap-3 rounded-control px-3 text-left text-[15px] text-fg hover:bg-surface-2 disabled:opacity-60"
      {...resto}
    >
      {ocupado ? (
        <LoaderCircle size={18} strokeWidth={1.75} aria-hidden className="animate-spin text-fg-muted motion-reduce:animate-none" />
      ) : (
        <Icono size={18} strokeWidth={1.75} aria-hidden className="text-fg-muted" />
      )}
      {children}
    </button>
  );
}

/** Menú secundario: todo lo que no se usa a diario, a una acción de distancia. */
export function OverflowMenu({ variante }: { variante: "rail" | "barra" }) {
  const { usuario } = useKairo();
  const { abrirEtiquetas } = usePanel();
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [exportando, setExportando] = useState<FormatoExportacion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ancla = useRef<HTMLButtonElement>(null);

  const cerrarMenu = () => {
    setAbierto(false);
    setError(null);
  };

  const exportar = async (formato: FormatoExportacion) => {
    setError(null);
    setExportando(formato);
    const fecha = momentoLocalDesde(new Date()).fecha;
    const resultado = await clienteKairo.exportar(formato, fecha);
    setExportando(null);
    if (!resultado.ok) {
      setError(resultado.error.mensaje);
      return;
    }
    descargarArchivo(resultado.valor, nombreArchivoExportacion(formato, fecha));
    cerrarMenu();
  };

  const cerrarSesion = async () => {
    await clienteKairo.cerrarSesion();
    router.replace("/acceso");
    router.refresh();
  };

  // Flechas arriba/abajo recorren las acciones, como en un menú nativo.
  const navegar = (evento: React.KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(evento.key)) return;
    const items = [...evento.currentTarget.querySelectorAll<HTMLButtonElement>("[data-item-menu]:not(:disabled)")];
    if (items.length === 0) return;
    evento.preventDefault();
    const actual = items.indexOf(document.activeElement as HTMLButtonElement);
    const siguiente =
      evento.key === "Home"
        ? 0
        : evento.key === "End"
          ? items.length - 1
          : (actual + (evento.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    items[siguiente]?.focus();
  };

  return (
    <>
      {variante === "rail" ? (
        <button
          ref={ancla}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={abierto}
          aria-label="Más opciones"
          onClick={() => (abierto ? cerrarMenu() : setAbierto(true))}
          className={`group/boton relative flex h-11 w-full items-center gap-3 rounded-control px-2.5 text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg ${
            abierto ? "bg-surface-2 text-fg" : ""
          }`}
        >
          <Ellipsis size={20} strokeWidth={1.75} aria-hidden className="shrink-0" />
          <span className="hidden min-w-0 truncate text-[13px] xl:inline">{usuario.correo}</span>
          <span
            aria-hidden
            className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 hidden -translate-y-1/2 whitespace-nowrap rounded-control bg-fg px-2 py-1 text-[12px] font-medium text-bg opacity-0 transition-opacity group-hover/boton:opacity-100 group-hover/boton:delay-500 group-focus-visible/boton:opacity-100 [@media(hover:hover)]:block xl:hidden!"
          >
            Más
          </span>
        </button>
      ) : (
        <button
          ref={ancla}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={abierto}
          onClick={() => (abierto ? cerrarMenu() : setAbierto(true))}
          className={`flex h-full w-full flex-col items-center justify-center gap-0.5 text-[12px] font-medium ${
            abierto ? "text-fg" : "text-fg-muted"
          }`}
        >
          <Ellipsis size={20} strokeWidth={1.75} aria-hidden />
          Más
        </button>
      )}

      <AdaptiveSurface
        abierta={abierto}
        onCerrar={cerrarMenu}
        anclaRef={ancla}
        etiqueta="Más opciones"
        posicion="derecha-fin"
        ancho={264}
      >
        <div onKeyDown={navegar}>
          <div className="mb-1 border-b border-line px-3 pt-1.5 pb-2.5">
            <p className="text-[12px] leading-4 text-fg-muted">Cuenta</p>
            <p className="truncate text-[14px] font-medium">{usuario.correo}</p>
          </div>
          <ItemMenu
            icono={Tags}
            onClick={() => {
              cerrarMenu();
              abrirEtiquetas(ancla.current);
            }}
          >
            Etiquetas
          </ItemMenu>
          <ItemMenu icono={FileBraces} ocupado={exportando === "json"} disabled={exportando !== null} onClick={() => exportar("json")}>
            Exportar JSON
          </ItemMenu>
          <ItemMenu icono={FileSpreadsheet} ocupado={exportando === "csv"} disabled={exportando !== null} onClick={() => exportar("csv")}>
            Exportar CSV
          </ItemMenu>
          {error && (
            <p role="alert" className="px-3 py-1.5 text-[13px] text-danger">
              {error}
            </p>
          )}
          <div role="separator" className="my-1 h-px bg-line" />
          <ItemMenu icono={LogOut} onClick={cerrarSesion}>
            Cerrar sesión
          </ItemMenu>
        </div>
      </AdaptiveSurface>
    </>
  );
}
