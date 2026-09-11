export interface ConfiguracionSupabase {
  url: string;
  claveAnonima: string;
}

/** Solo valores públicos: la clave anónima está protegida por RLS. La service key nunca se usa aquí. */
export function configuracionSupabase(): ConfiguracionSupabase {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const claveAnonima = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !claveAnonima) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY. Cópialas en .env.local " +
        "(ver .env.example) o usa KAIRO_ADAPTADOR=local para desarrollo.",
    );
  }
  return { url, claveAnonima };
}
