/** Cookie jar mínimo que los adaptadores necesitan. Lo implementa la capa de Next. */
export interface OpcionesCookie {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
  path?: string;
  maxAge?: number;
  expires?: Date;
  domain?: string;
}

export interface AlmacenCookies {
  todas(): { name: string; value: string }[];
  obtener(nombre: string): string | undefined;
  establecer(nombre: string, valor: string, opciones?: OpcionesCookie): void;
  eliminar(nombre: string): void;
}
