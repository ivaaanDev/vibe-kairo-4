import type { Metadata } from "next";
import { AuthForm } from "@/app/_componentes/auth-form";
import { prepararAcceso } from "../sesion-existente";

export const metadata: Metadata = { title: "Iniciar sesión" };

const AVISOS: Record<string, string> = {
  confirmacion: "El enlace de confirmación caducó o ya se usó. Inicia sesión o regístrate de nuevo.",
};

export default async function PaginaAcceso({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ cuentaDemo, errorConfiguracion }, { error }] = await Promise.all([prepararAcceso(), searchParams]);
  const aviso = errorConfiguracion ?? (typeof error === "string" ? (AVISOS[error] ?? null) : null);
  return <AuthForm modo="acceso" cuentaDemo={cuentaDemo} aviso={aviso} />;
}
