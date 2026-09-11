import { redirect } from "next/navigation";
import { AppShell } from "@/app/_componentes/app-shell";
import { ProveedorKairo } from "@/app/_estado/proveedor-kairo";
import { contextoServidor } from "@/lib/adaptadores/contexto-servidor";

/**
 * Valida la sesión y carga los datos del usuario en el servidor: la primera pintura
 * ya trae las tareas, sin estados de carga. Cambiar entre Tareas y Agenda no recarga este layout.
 */
export default async function LayoutAplicacion({ children }: { children: React.ReactNode }) {
  const contexto = await contextoServidor();
  const usuario = await contexto.autenticacion.usuarioActual();
  if (!usuario) redirect("/acceso");

  const repositorios = contexto.repositorios(usuario);
  const [tareas, etiquetas] = await Promise.all([repositorios.tareas.listar(), repositorios.etiquetas.listar()]);

  return (
    <ProveedorKairo usuario={usuario} inicial={{ tareas, etiquetas }}>
      <AppShell>{children}</AppShell>
    </ProveedorKairo>
  );
}
