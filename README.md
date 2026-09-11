# Kairo

Un gestor de tareas pequeño y preciso. Dos espacios —**Tareas** y **Agenda**—, alta rápida con un
solo campo, etiquetas libres, vencimientos opcionales y exportación completa.

Next.js 16 (App Router) · React 19 · TypeScript estricto · Tailwind CSS 4 · Supabase (PostgreSQL + Auth) ·
Motion · Lucide · Vitest · Playwright.

## Arranque rápido (sin Supabase)

```bash
npm install
npm run dev:local
```

Abre http://localhost:3000 y entra con la cuenta de demostración **demo@kairo.local / kairo-demo**
(el formulario de acceso tiene un botón para rellenarla). La cuenta se vuelve a sembrar cada día
con fechas relativas a hoy: vencidas, hoy, esta semana, sin fecha, completadas y varias etiquetas.

El adaptador local guarda los datos en `.kairo-local/datos.json`. Es solo para desarrollo y pruebas:
se niega a arrancar en producción.

## Con Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecuta [`supabase/migrations/20260911000000_kairo.sql`](supabase/migrations/20260911000000_kairo.sql)
   (tablas, Row Level Security y la función `guardar_tarea`).
3. Opcional: ejecuta [`supabase/pruebas/rls.sql`](supabase/pruebas/rls.sql) en el mismo editor. Corre en una
   transacción que se revierte y termina con «RLS y reglas de datos verificadas».
4. Copia `.env.example` a `.env.local` y rellena `NEXT_PUBLIC_SUPABASE_URL` y
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Settings → API).
5. **Confirmación de correo** (Authentication → Sign In / Providers → Email):
   - para desarrollo, desactiva *Confirm email* y el registro entra directamente;
   - si la dejas activa, en Authentication → Email Templates → *Confirm signup* cambia el enlace a
     `{{ .SiteURL }}/auth/confirmar?token_hash={{ .TokenHash }}&type=email`.
6. `npm run dev`.

Datos de demostración en Supabase (usa la service role key, solo en tu máquina):

```bash
# SUPABASE_SERVICE_ROLE_KEY en .env.local
npm run sembrar:supabase -- demo@kairo.app una-contrasena
```

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` / `npm run dev:local` | Desarrollo con Supabase / con el adaptador local |
| `npm run build` · `npm start` | Producción |
| `npm run typecheck` · `npm run lint` | TypeScript estricto · ESLint (incluye la guarda de arquitectura) |
| `npm test` | Vitest: dominio, servicios, reductor, contraste de tokens, arquitectura |
| `npm run test:e2e` | Playwright a 1440 px y 360 px (compila y arranca su propio servidor local) |

La primera vez que ejecutes las pruebas E2E: `npx playwright install chromium`.

Para verificar la migración sin un proyecto de Supabase, con cualquier PostgreSQL 15+:

```bash
podman run -d --rm --name kairo-pg -e POSTGRES_PASSWORD=kairo -p 55432:5432 docker.io/library/postgres:17-alpine
export PGPASSWORD=kairo
psql -h localhost -p 55432 -U postgres -v ON_ERROR_STOP=1 -f supabase/pruebas/stub-auth.sql
psql -h localhost -p 55432 -U postgres -v ON_ERROR_STOP=1 -f supabase/migrations/20260911000000_kairo.sql
psql -h localhost -p 55432 -U postgres -v ON_ERROR_STOP=1 -f supabase/pruebas/rls.sql
```

## Documentación

- [Fase A · UX](docs/01-ux.md): navegación, flujos y comportamiento en móvil y escritorio.
- [Fase B · Sistema visual](docs/02-sistema-visual.md): tokens, tipografía, iconos, movimiento y breakpoints.
- [Arquitectura](docs/03-arquitectura.md): capas, flujo de datos y cómo pasar a React Native.
- [Posibles evoluciones](docs/04-evolucion.md): ideas que se registraron pero no se implementaron.
- [Verificación](docs/05-verificacion.md): el checklist del producto y su evidencia.
