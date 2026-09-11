export type CodigoError =
  | "titulo-vacio"
  | "titulo-largo"
  | "descripcion-larga"
  | "fecha-invalida"
  | "hora-invalida"
  | "hora-sin-fecha"
  | "etiqueta-desconocida"
  | "nombre-etiqueta-vacio"
  | "nombre-etiqueta-largo"
  | "nombre-etiqueta-duplicado"
  | "color-invalido"
  | "id-invalido"
  | "no-encontrado"
  | "solicitud-invalida"
  | "no-autenticado"
  | "credenciales-invalidas"
  | "correo-invalido"
  | "contrasena-corta"
  | "correo-registrado"
  | "error-servidor";

export interface ErrorDominio {
  codigo: CodigoError;
  /** Mensaje en español, listo para mostrarse al usuario. */
  mensaje: string;
  campo?: string;
}

export type Resultado<T, E = ErrorDominio> =
  | { ok: true; valor: T }
  | { ok: false; error: E };

export function exito<T>(valor: T): Resultado<T, never> {
  return { ok: true, valor };
}

export function fallo<E = ErrorDominio>(error: E): Resultado<never, E> {
  return { ok: false, error };
}
