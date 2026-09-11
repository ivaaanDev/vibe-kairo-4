import { NextResponse } from "next/server";
import { contextoServidor } from "@/lib/adaptadores/contexto-servidor";

/**
 * Destino del enlace de confirmación de Supabase:
 * {{ .SiteURL }}/auth/confirmar?token_hash={{ .TokenHash }}&type=email
 */
export async function GET(peticion: Request) {
  const url = new URL(peticion.url);
  const tokenHash = url.searchParams.get("token_hash");
  const tipo = url.searchParams.get("type");
  const destino = (ruta: string) => NextResponse.redirect(new URL(ruta, url.origin));

  if (!tokenHash || !tipo) return destino("/acceso?error=confirmacion");
  const { autenticacion } = await contextoServidor();
  const resultado = await autenticacion.confirmarCorreo(tokenHash, tipo);
  return destino(resultado.ok ? "/" : "/acceso?error=confirmacion");
}
