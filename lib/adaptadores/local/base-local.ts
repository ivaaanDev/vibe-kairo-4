import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { AlmacenDatosUsuario, DatosUsuario } from "@/lib/adaptadores/memoria/repositorios-memoria";

/*
 * Adaptador local de desarrollo: un único archivo JSON en disco.
 * Existe para trabajar y ejecutar las pruebas E2E sin un proyecto de Supabase.
 * Las operaciones son síncronas: en un proceso de Node cada lectura-modificación-escritura
 * es atómica respecto al bucle de eventos, y la escritura usa archivo temporal + rename.
 */

export interface UsuarioLocal {
  id: string;
  correo: string;
  sal: string;
  hash: string;
  creadoEn: string;
  demo?: boolean;
}

export interface BaseLocal {
  version: 1;
  secreto: string;
  usuarios: UsuarioLocal[];
  datos: Record<string, DatosUsuario & { sembradoEl?: string }>;
}

function directorio(): string {
  return process.env.KAIRO_DIRECTORIO_LOCAL ?? join(process.cwd(), ".kairo-local");
}

function ruta(): string {
  return join(directorio(), "datos.json");
}

function baseVacia(): BaseLocal {
  return { version: 1, secreto: randomBytes(32).toString("hex"), usuarios: [], datos: {} };
}

export function leerBase(): BaseLocal {
  if (!existsSync(ruta())) return baseVacia();
  return JSON.parse(readFileSync(ruta(), "utf8")) as BaseLocal;
}

function escribirBase(base: BaseLocal): void {
  mkdirSync(directorio(), { recursive: true });
  const temporal = `${ruta()}.${process.pid}.tmp`;
  writeFileSync(temporal, JSON.stringify(base, null, 2));
  renameSync(temporal, ruta());
}

export function modificarBase<T>(cambio: (base: BaseLocal) => T): T {
  const base = leerBase();
  const resultado = cambio(base);
  escribirBase(base);
  return resultado;
}

/** Secreto de firma de sesión: el de entorno o uno generado y guardado en la base. */
export function secretoLocal(): string {
  if (process.env.KAIRO_SECRETO_LOCAL) return process.env.KAIRO_SECRETO_LOCAL;
  const base = leerBase();
  if (existsSync(ruta())) return base.secreto;
  escribirBase(base);
  return base.secreto;
}

export function almacenDeUsuario(usuarioId: string): AlmacenDatosUsuario {
  return {
    leer() {
      return structuredClone(leerBase().datos[usuarioId] ?? { tareas: [], etiquetas: [] });
    },
    modificar(cambio) {
      return modificarBase((base) => {
        const datos = base.datos[usuarioId] ?? { tareas: [], etiquetas: [] };
        const resultado = cambio(datos);
        base.datos[usuarioId] = datos;
        return resultado;
      });
    },
  };
}
