import type { Metadata } from "next";
import { AgendaView } from "@/app/_componentes/agenda-view";
import { esRangoAgenda } from "@/lib/dominio/agenda";

export const metadata: Metadata = { title: "Agenda" };

export default async function PaginaAgenda({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { rango } = await searchParams;
  return <AgendaView rangoInicial={esRangoAgenda(rango) ? rango : "hoy"} />;
}
