import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/*
 * Proxy (antes middleware):
 * - con Supabase, refresca la sesión y reenvía las cookies actualizadas;
 * - redirige a /acceso cuando no hay sesión en rutas de la aplicación.
 * Es una comprobación optimista: el layout de la app vuelve a validar al usuario.
 */

const RUTAS_PUBLICAS = ["/acceso", "/registro", "/auth/"];

export async function proxy(peticion: NextRequest) {
  let respuesta = NextResponse.next({ request: peticion });
  let autenticado = false;

  if (process.env.KAIRO_ADAPTADOR === "local") {
    autenticado = peticion.cookies.has("kairo_sesion");
  } else {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const clave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    // Sin configuración dejamos pasar: el layout mostrará un error explicativo.
    if (!url || !clave) return respuesta;
    const supabase = createServerClient(url, clave, {
      cookies: {
        getAll: () => peticion.cookies.getAll(),
        setAll: (porEstablecer, cabeceras) => {
          for (const { name, value } of porEstablecer) peticion.cookies.set(name, value);
          respuesta = NextResponse.next({ request: peticion });
          for (const { name, value, options } of porEstablecer) respuesta.cookies.set(name, value, options);
          for (const [clave, valor] of Object.entries(cabeceras)) respuesta.headers.set(clave, valor);
        },
      },
    });
    const { data } = await supabase.auth.getUser();
    autenticado = data.user !== null;
  }

  const ruta = peticion.nextUrl.pathname;
  const esPublica = RUTAS_PUBLICAS.some((prefijo) => ruta.startsWith(prefijo));
  if (!autenticado && !esPublica) {
    const destino = peticion.nextUrl.clone();
    destino.pathname = "/acceso";
    destino.search = "";
    return NextResponse.redirect(destino);
  }
  return respuesta;
}

export const config = {
  // Ni la API (responde 401 por sí misma) ni los recursos estáticos.
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|webp|ico)$).*)"],
};
