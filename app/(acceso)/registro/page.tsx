import type { Metadata } from "next";
import { AuthForm } from "@/app/_componentes/auth-form";
import { prepararAcceso } from "../sesion-existente";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function PaginaRegistro() {
  const { cuentaDemo, errorConfiguracion } = await prepararAcceso();
  return <AuthForm modo="registro" cuentaDemo={cuentaDemo} aviso={errorConfiguracion} />;
}
