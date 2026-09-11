import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import type { AlmacenCookies } from "@/lib/adaptadores/cookies";
import { validarCredenciales } from "@/lib/adaptadores/validacion-credenciales";
import { generarDatosDemostracion } from "@/lib/dominio/demostracion";
import { momentoLocalDesde } from "@/lib/dominio/fecha-local";
import type { AdaptadorAutenticacion } from "@/lib/tipos/puertos";
import { exito, fallo } from "@/lib/tipos/resultado";
import type { Usuario } from "@/lib/tipos/usuario";
import { leerBase, modificarBase, secretoLocal, type BaseLocal, type UsuarioLocal } from "./base-local";

export const COOKIE_SESION_LOCAL = "kairo_sesion";
const DURACION_SESION_S = 60 * 60 * 24 * 30;

export const CUENTA_DEMO = { correo: "demo@kairo.local", contrasena: "kairo-demo" } as const;

function derivar(contrasena: string, sal: string): string {
  return scryptSync(contrasena, sal, 32).toString("hex");
}

function firmar(valor: string): string {
  return createHmac("sha256", secretoLocal()).update(valor).digest("base64url");
}

export function crearValorSesion(usuarioId: string): string {
  return `${usuarioId}.${firmar(usuarioId)}`;
}

/** Devuelve el id de usuario si la cookie está firmada correctamente. */
export function verificarValorSesion(valor: string | undefined): string | null {
  if (!valor) return null;
  const separador = valor.lastIndexOf(".");
  if (separador <= 0) return null;
  const usuarioId = valor.slice(0, separador);
  const firma = Buffer.from(valor.slice(separador + 1));
  const esperada = Buffer.from(firmar(usuarioId));
  return firma.length === esperada.length && timingSafeEqual(firma, esperada) ? usuarioId : null;
}

function aUsuario(usuario: UsuarioLocal): Usuario {
  return { id: usuario.id, correo: usuario.correo };
}

/**
 * La cuenta de demostración se crea sola y se vuelve a sembrar cada día,
 * para que vencidas, hoy y semana sigan siendo relativas a la fecha actual.
 */
function asegurarCuentaDemo(base: BaseLocal): void {
  let demo = base.usuarios.find((usuario) => usuario.demo);
  if (!demo) {
    const sal = randomBytes(16).toString("hex");
    demo = {
      id: randomUUID(),
      correo: CUENTA_DEMO.correo,
      sal,
      hash: derivar(CUENTA_DEMO.contrasena, sal),
      creadoEn: new Date().toISOString(),
      demo: true,
    };
    base.usuarios.push(demo);
  }
  const ahora = new Date();
  const hoy = momentoLocalDesde(ahora).fecha;
  if (base.datos[demo.id]?.sembradoEl !== hoy) {
    base.datos[demo.id] = { ...generarDatosDemostracion(hoy, ahora.toISOString(), randomUUID), sembradoEl: hoy };
  }
}

export function prepararBaseLocal(): void {
  if (process.env.KAIRO_SIN_DEMO === "1") return;
  const base = leerBase();
  const demo = base.usuarios.find((usuario) => usuario.demo);
  const hoy = momentoLocalDesde(new Date()).fecha;
  if (!demo || base.datos[demo.id]?.sembradoEl !== hoy) modificarBase(asegurarCuentaDemo);
}

export function crearAutenticacionLocal(cookies: AlmacenCookies): AdaptadorAutenticacion {
  const abrirSesion = (usuarioId: string) =>
    cookies.establecer(COOKIE_SESION_LOCAL, crearValorSesion(usuarioId), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: DURACION_SESION_S,
    });

  return {
    async usuarioActual() {
      const usuarioId = verificarValorSesion(cookies.obtener(COOKIE_SESION_LOCAL));
      if (!usuarioId) return null;
      const usuario = leerBase().usuarios.find((candidato) => candidato.id === usuarioId);
      return usuario ? aUsuario(usuario) : null;
    },

    async iniciarSesion(credenciales) {
      prepararBaseLocal();
      const correo = credenciales.correo.trim().toLowerCase();
      const usuario = leerBase().usuarios.find((candidato) => candidato.correo === correo);
      const valido =
        usuario !== undefined &&
        timingSafeEqual(Buffer.from(derivar(credenciales.contrasena, usuario.sal), "hex"), Buffer.from(usuario.hash, "hex"));
      if (!usuario || !valido) {
        return fallo({ codigo: "credenciales-invalidas", mensaje: "El correo o la contraseña no coinciden." });
      }
      abrirSesion(usuario.id);
      return exito(aUsuario(usuario));
    },

    async registrar(credenciales) {
      const validas = validarCredenciales(credenciales);
      if (!validas.ok) return validas;
      const { correo, contrasena } = validas.valor;
      const resultado = modificarBase((base) => {
        if (base.usuarios.some((usuario) => usuario.correo === correo)) return null;
        const sal = randomBytes(16).toString("hex");
        const usuario: UsuarioLocal = { id: randomUUID(), correo, sal, hash: derivar(contrasena, sal), creadoEn: new Date().toISOString() };
        base.usuarios.push(usuario);
        base.datos[usuario.id] = { tareas: [], etiquetas: [] };
        return usuario;
      });
      if (!resultado) {
        return fallo({ codigo: "correo-registrado", mensaje: "Ya existe una cuenta con ese correo. Inicia sesión.", campo: "correo" });
      }
      abrirSesion(resultado.id);
      return exito({ usuario: aUsuario(resultado), requiereConfirmacion: false });
    },

    async confirmarCorreo() {
      // El adaptador local no envía correos: las cuentas quedan confirmadas al crearse.
      return exito(null);
    },

    async cerrarSesion() {
      cookies.eliminar(COOKIE_SESION_LOCAL);
    },
  };
}
