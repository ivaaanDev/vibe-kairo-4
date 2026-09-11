# Kairo — Arquitectura

Monolito modular por capas con núcleo de dominio aislado.

```
app/                      Presentación (Next.js App Router, React)
  (acceso)/               Acceso y registro
  (app)/                  Tareas y Agenda; el layout valida la sesión y carga los datos
  _componentes/           Componentes de interfaz (AppShell, TaskRow, TaskInspector…)
  _estado/                Proveedor optimista, panel contextual, capas modales, hooks
  api/                    Orquestación HTTP: lee la sesión, llama a servicios, responde
lib/
  dominio/                Reglas puras: validación, vencimiento, agenda, orden, etiquetas, exportación
  servicios/              Casos de uso: dominio + puertos de persistencia
  estado/                 Reductor de estado de cliente (puro)
  tipos/                  Contratos: entidades, puertos, API
  diseno/                 Tokens de diseño (independientes de CSS)
  adaptadores/            Supabase, local (desarrollo), memoria (pruebas), contexto de servidor
  cliente/                Cliente HTTP de la API (solo fetch)
  plataforma/web/         Lo que solo existe en el navegador (descargar archivos)
supabase/migrations/      Esquema, RLS y función de guardado atómico
```

## Reglas de dependencia

`dominio`, `tipos`, `servicios`, `estado` y `diseno` no importan React, Next.js, Supabase,
Motion, Lucide, Node ni el navegador. Lo comprueban dos guardas:
[`lib/arquitectura.test.ts`](../lib/arquitectura.test.ts) (Vitest) y `no-restricted-imports`
en ESLint.

## Flujo de una mutación

1. El componente llama al proveedor (`useKairo().actualizarTarea(id, cambios)`).
2. El proveedor valida con el **mismo dominio** que el servidor (`aplicarCambios`) y actualiza el
   estado al instante.
3. Encola la petición en una cola por entidad (y espera a las entidades de las que depende, p. ej.
   una etiqueta recién creada).
4. `app/api` resuelve la sesión, construye los repositorios del usuario y llama al servicio.
5. El servicio vuelve a aplicar el dominio y persiste mediante el puerto.
6. Si falla, el proveedor revierte y ofrece «Reintentar». Los ids se generan en el cliente (UUID),
   así que no hay intercambio de ids temporales.

## Persistencia y autenticación

Puertos en [`lib/tipos/puertos.ts`](../lib/tipos/puertos.ts):
`RepositorioTareas`, `RepositorioEtiquetas`, `AdaptadorAutenticacion`.

- **Supabase** (producción): `@supabase/ssr` con cookies; RLS con `auth.uid()` separa los datos por
  usuario; `guardar_tarea` actualiza la fila y reemplaza etiquetas en una transacción
  (`SECURITY INVOKER`, así RLS sigue aplicando). Solo se usa la clave anónima; la service key
  queda para el script de siembra que corre en tu máquina.
- **Local** (desarrollo y E2E): un JSON en `.kairo-local/`, contraseñas con scrypt y cookie de
  sesión firmada con HMAC. Se niega a arrancar en producción salvo con `KAIRO_PERMITIR_LOCAL=1`
  (lo usa Playwright).
- **Memoria**: los mismos repositorios sobre un almacén en memoria para las pruebas de servicios.

## Preparado para React Native

Nada de esto requiere dos implementaciones hoy; son decisiones que evitan reescribir mañana.

| Web | React Native |
| --- | --- |
| `lib/dominio`, `lib/servicios`, `lib/estado`, `lib/tipos` | Se importan tal cual |
| `lib/diseno/tokens.ts` → variables CSS | `StyleSheet` / tema |
| `lib/cliente/api-kairo.ts` (fetch) | Igual, con `base` apuntando al servidor |
| NavigationRail / MobileNavigation | Drawer adaptativo / Bottom Tabs |
| TaskInspector (panel) | Stack screen o sheet de gran altura |
| AdaptiveSurface (popover / sheet) | Bottom Sheet |
| `lucide-react` | `lucide-react-native` (mismos nombres) |
| Motion (opacity, translate) | Reanimated (`withTiming` con las mismas curvas) |
| `descargarArchivo` | `expo-file-system` + hoja de compartir |
| `useAhora` (reloj compartido) | Mismo patrón con AppState |

Además: no hay interacciones que dependan de hover; las áreas táctiles son de 44 px; las fechas
se formatean en español sin `Intl` para que el resultado sea idéntico en Hermes.

## Pruebas

| Capa | Herramienta | Qué cubre |
| --- | --- | --- |
| Dominio | Vitest | Validación, vencimiento, agenda, orden, etiquetas, exportación, demostración |
| Servicios | Vitest + repositorios en memoria | Casos de uso extremo a extremo sin red |
| Diseño | Vitest | Contraste WCAG de todos los tokens, duraciones |
| Arquitectura | Vitest + ESLint | Aislamiento del núcleo |
| Base de datos | SQL (`supabase/pruebas/rls.sql`) | RLS, restricciones, `guardar_tarea` |
| Flujos | Playwright (1440 px y 360 px) | Autenticación, tareas, etiquetas, agenda, exportación, teclado, axe, movimiento reducido, desbordamiento, límite de acciones |
