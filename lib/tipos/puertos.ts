import type { Etiqueta } from "./etiqueta";
import type { Resultado } from "./resultado";
import type { Tarea } from "./tarea";
import type { Credenciales, Usuario } from "./usuario";

/**
 * Puertos de persistencia. Cada instancia ya está limitada a un único usuario
 * (por RLS en Supabase o por el adaptador local), así que los métodos no reciben
 * el identificador de usuario.
 */
export interface RepositorioTareas {
  listar(): Promise<Tarea[]>;
  obtener(id: string): Promise<Tarea | null>;
  insertar(tarea: Tarea): Promise<Tarea>;
  /** Guarda la tarea completa, incluidas sus etiquetas. */
  guardar(tarea: Tarea): Promise<Tarea>;
  eliminar(id: string): Promise<boolean>;
}

export interface RepositorioEtiquetas {
  listar(): Promise<Etiqueta[]>;
  obtener(id: string): Promise<Etiqueta | null>;
  insertar(etiqueta: Etiqueta): Promise<Etiqueta>;
  guardar(etiqueta: Etiqueta): Promise<Etiqueta>;
  /** Elimina la etiqueta y sus relaciones. Nunca elimina tareas. */
  eliminar(id: string): Promise<boolean>;
}

export interface RegistroCompletado {
  usuario: Usuario;
  /** `true` cuando el proveedor exige confirmar el correo antes de iniciar sesión. */
  requiereConfirmacion: boolean;
}

export interface AdaptadorAutenticacion {
  usuarioActual(): Promise<Usuario | null>;
  iniciarSesion(credenciales: Credenciales): Promise<Resultado<Usuario>>;
  registrar(credenciales: Credenciales): Promise<Resultado<RegistroCompletado>>;
  /** Verifica el enlace de confirmación de correo y abre la sesión. */
  confirmarCorreo(tokenHash: string, tipo: string): Promise<Resultado<null>>;
  cerrarSesion(): Promise<void>;
}
