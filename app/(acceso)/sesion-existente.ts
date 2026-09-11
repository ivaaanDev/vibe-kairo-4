import { redirect } from "next/navigation";
import { contextoServidor } from "@/lib/adaptadores/contexto-servidor";
import { CUENTA_DEMO } from "@/lib/adaptadores/local/autenticacion-local";

export interface DatosAcceso {
  cuentaDemo: { correo: string; contrasena: string } | null;
  errorConfiguracion: string | null;
}

/** Si ya hay sesión, va directo a la app. Si falta configuración, lo explica en el formulario. */
export async function prepararAcceso(): Promise<DatosAcceso> {
  let adaptador: string;
  try {
    const contexto = await contextoServidor();
    adaptador = contexto.adaptador;
    const usuario = await contexto.autenticacion.usuarioActual();
    if (usuario) redirect("/");
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_PUBLIC_SUPABASE")) {
      return {
        cuentaDemo: null,
        errorConfiguracion: "Falta configurar Supabase. Copia .env.example a .env.local o arranca con npm run dev:local.",
      };
    }
    throw error;
  }
  return { cuentaDemo: adaptador === "local" ? { ...CUENTA_DEMO } : null, errorConfiguracion: null };
}
