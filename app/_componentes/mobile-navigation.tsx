"use client";

import { CalendarDays, ListChecks, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OverflowMenu } from "./overflow-menu";

function Pestana({ href, activo, icono: Icono, etiqueta }: { href: string; activo: boolean; icono: LucideIcon; etiqueta: string }) {
  return (
    <li>
      <Link
        href={href}
        aria-current={activo ? "page" : undefined}
        className={`flex h-full flex-col items-center justify-center gap-0.5 text-[12px] font-medium transition-colors ${
          activo ? "text-accent" : "text-fg-muted"
        }`}
      >
        <Icono size={20} strokeWidth={activo ? 2 : 1.75} aria-hidden />
        {etiqueta}
      </Link>
    </li>
  );
}

/** Barra inferior compacta (< 640 px): los dos espacios y «Más», al alcance del pulgar. */
export function MobileNavigation() {
  const ruta = usePathname();
  return (
    <nav aria-label="Principal" className="oculta-con-teclado fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg relleno-seguro-inferior sm:hidden">
      <ul className="grid h-14 grid-cols-3">
        <Pestana href="/" activo={ruta === "/"} icono={ListChecks} etiqueta="Tareas" />
        <Pestana href="/agenda" activo={ruta.startsWith("/agenda")} icono={CalendarDays} etiqueta="Agenda" />
        <li>
          <OverflowMenu variante="barra" />
        </li>
      </ul>
    </nav>
  );
}
