import type { AuthError, EmailOtpType, SupabaseClient } from "@supabase/supabase-js";
import { validarCredenciales } from "@/lib/adaptadores/validacion-credenciales";
import type { AdaptadorAutenticacion } from "@/lib/tipos/puertos";
import { exito, fallo, type ErrorDominio } from "@/lib/tipos/resultado";

function traducirError(error: AuthError): ErrorDominio {
  switch (error.code) {
    case "invalid_credentials":
      return { codigo: "credenciales-invalidas", mensaje: "El correo o la contraseña no coinciden." };
    case "email_not_confirmed":
      return { codigo: "credenciales-invalidas", mensaje: "Confirma tu correo desde el enlace que te enviamos y vuelve a intentarlo." };
    case "user_already_exists":
    case "email_exists":
      return { codigo: "correo-registrado", mensaje: "Ya existe una cuenta con ese correo. Inicia sesión.", campo: "correo" };
    case "weak_password":
      return { codigo: "contrasena-corta", mensaje: "Elige una contraseña más larga o menos común.", campo: "contrasena" };
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return { codigo: "error-servidor", mensaje: "Demasiados intentos. Espera un minuto y vuelve a probar." };
    default:
      return { codigo: "error-servidor", mensaje: "No se pudo completar el acceso. Inténtalo de nuevo." };
  }
}

export function crearAutenticacionSupabase(cliente: SupabaseClient): AdaptadorAutenticacion {
  return {
    async usuarioActual() {
      // getUser valida el token contra Supabase Auth; no confía solo en la cookie.
      const { data, error } = await cliente.auth.getUser();
      if (error || !data.user) return null;
      return { id: data.user.id, correo: data.user.email ?? "" };
    },

    async iniciarSesion(credenciales) {
      const { data, error } = await cliente.auth.signInWithPassword({
        email: credenciales.correo.trim().toLowerCase(),
        password: credenciales.contrasena,
      });
      if (error || !data.user) return fallo(error ? traducirError(error) : traducirError({ code: "desconocido" } as AuthError));
      return exito({ id: data.user.id, correo: data.user.email ?? credenciales.correo });
    },

    async registrar(credenciales) {
      const validas = validarCredenciales(credenciales);
      if (!validas.ok) return validas;
      const { data, error } = await cliente.auth.signUp({ email: validas.valor.correo, password: validas.valor.contrasena });
      if (error) return fallo(traducirError(error));
      if (!data.user) return fallo({ codigo: "error-servidor", mensaje: "No se pudo crear la cuenta. Inténtalo de nuevo." });
      // Con confirmación de correo activa, Supabase oculta los correos ya registrados devolviendo un usuario sin identidades.
      if (data.user.identities?.length === 0) {
        return fallo({ codigo: "correo-registrado", mensaje: "Ya existe una cuenta con ese correo. Inicia sesión.", campo: "correo" });
      }
      return exito({
        usuario: { id: data.user.id, correo: data.user.email ?? validas.valor.correo },
        requiereConfirmacion: data.session === null,
      });
    },

    async confirmarCorreo(tokenHash, tipo) {
      const tiposValidos: EmailOtpType[] = ["signup", "email", "invite", "magiclink", "recovery", "email_change"];
      if (!(tiposValidos as string[]).includes(tipo)) {
        return fallo({ codigo: "solicitud-invalida", mensaje: "El enlace de confirmación no es válido." });
      }
      const { error } = await cliente.auth.verifyOtp({ type: tipo as EmailOtpType, token_hash: tokenHash });
      if (error) return fallo({ codigo: "credenciales-invalidas", mensaje: "El enlace caducó o ya se usó. Inicia sesión o regístrate de nuevo." });
      return exito(null);
    },

    async cerrarSesion() {
      await cliente.auth.signOut();
    },
  };
}
