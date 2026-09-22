"use client";

import { CalendarDays, ListChecks, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useKairo } from "@/app/_estado/proveedor-kairo";
import { useAhora } from "@/app/_estado/use-ahora";
import { contarPendientesHoy } from "@/lib/dominio/agenda";
import { useGestoMarca } from "./huevos-de-pascua/viaje-en-el-tiempo/contexto";
import { MensajeDelViaje, ReaccionDeLaMarca } from "./huevos-de-pascua/viaje-en-el-tiempo/piezas";
import { KairoMark, KairoWordmark } from "./kairo-mark";
import { OverflowMenu } from "./overflow-menu";

function EnlaceRail({
  href,
  activo,
  icono: Icono,
  etiqueta,
  cuenta,
  descripcionCuenta,
}: {
  href: string;
  activo: boolean;
  icono: LucideIcon;
  etiqueta: string;
  cuenta: number | null;
  descripcionCuenta: string;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={activo ? "page" : undefined}
        className={`group/boton relative flex h-11 items-center gap-3 rounded-control px-2.5 text-[14px] font-medium transition-colors duration-(--k-duracion-inmediata) ${
          activo ? "bg-surface-2 text-fg" : "text-fg-muted hover:bg-surface-2/70 hover:text-fg"
        }`}
      >
        <Icono size={20} strokeWidth={1.75} aria-hidden className={`shrink-0 ${activo ? "text-accent" : ""}`} />
        <span className="sr-only flex-1 xl:not-sr-only">{etiqueta}</span>
        {cuenta !== null && cuenta > 0 && (
          <span className="hidden text-[13px] font-normal text-fg-muted numeros-tabulares xl:inline">
            {cuenta}
            <span className="sr-only"> {descripcionCuenta}</span>
          </span>
        )}
        <span
          aria-hidden
          className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 hidden -translate-y-1/2 whitespace-nowrap rounded-control bg-fg px-2 py-1 text-[12px] font-medium text-bg opacity-0 transition-opacity group-hover/boton:opacity-100 group-hover/boton:delay-500 group-focus-visible/boton:opacity-100 [@media(hover:hover)]:block xl:hidden!"
        >
          {etiqueta}
        </span>
      </Link>
    </li>
  );
}

/** Navegación lateral estrecha: marca, los dos espacios y el menú secundario. Nada más. */
export function NavigationRail() {
  const ruta = usePathname();
  const ahora = useAhora();
  const { tareas } = useKairo();
  const gesto = useGestoMarca();
  const pendientes = tareas.filter((tarea) => !tarea.completada).length;
  const paraHoy = ahora ? contarPendientesHoy(tareas, ahora) : null;

  return (
    <nav aria-label="Principal" className="hidden w-16 shrink-0 flex-col border-r border-line px-2.5 py-4 sm:flex xl:w-[232px] xl:px-3">
      <div {...gesto.props} className="relative mb-5 flex h-11 items-center gap-2.5 px-2.5 text-fg select-none">
        <ReaccionDeLaMarca>
          <KairoMark tamano={22} className="shrink-0" />
        </ReaccionDeLaMarca>
        <KairoWordmark className="hidden xl:inline" />
        <span className="sr-only xl:hidden">Kairo</span>
        <MensajeDelViaje />
      </div>
      <ul className="flex flex-col gap-0.5">
        <EnlaceRail href="/" activo={ruta === "/"} icono={ListChecks} etiqueta="Tareas" cuenta={pendientes} descripcionCuenta="pendientes" />
        <EnlaceRail
          href="/agenda"
          activo={ruta.startsWith("/agenda")}
          icono={CalendarDays}
          etiqueta="Agenda"
          cuenta={paraHoy}
          descripcionCuenta="para hoy"
        />
      </ul>
      <div className="mt-auto">
        <OverflowMenu variante="rail" />
      </div>
    </nav>
  );
}
