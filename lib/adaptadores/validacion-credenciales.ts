import { exito, fallo, type Resultado } from "@/lib/tipos/resultado";
import type { Credenciales } from "@/lib/tipos/usuario";

export const CONTRASENA_MINIMA = 8;

/** Validación previa al proveedor de identidad: mensajes claros antes de ir a la red. */
export function validarCredenciales(credenciales: Credenciales): Resultado<Credenciales> {
  const correo = credenciales.correo.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return fallo({ codigo: "correo-invalido", mensaje: "Escribe un correo válido.", campo: "correo" });
  }
  if (credenciales.contrasena.length < CONTRASENA_MINIMA) {
    return fallo({
      codigo: "contrasena-corta",
      mensaje: `La contraseña necesita al menos ${CONTRASENA_MINIMA} caracteres.`,
      campo: "contrasena",
    });
  }
  return exito({ correo, contrasena: credenciales.contrasena });
}
