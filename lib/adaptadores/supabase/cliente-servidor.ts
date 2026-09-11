import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AlmacenCookies } from "@/lib/adaptadores/cookies";
import { configuracionSupabase } from "./configuracion";

/** Cliente de Supabase ligado a las cookies de la petición. Uno nuevo por petición. */
export function crearClienteSupabase(cookies: AlmacenCookies): SupabaseClient {
  const { url, claveAnonima } = configuracionSupabase();
  return createServerClient(url, claveAnonima, {
    cookies: {
      getAll: () => cookies.todas(),
      setAll: (porEstablecer) => {
        for (const { name, value, options } of porEstablecer) {
          cookies.establecer(name, value, {
            ...options,
            sameSite: typeof options.sameSite === "string" ? options.sameSite : undefined,
          });
        }
      },
    },
  });
}
