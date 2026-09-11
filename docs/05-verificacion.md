# Kairo — Verificación final

Estado al cerrar: 131 pruebas unitarias, 46 pruebas E2E (23 flujos × escritorio 1440 px y móvil
360 px), `tsc --noEmit` y ESLint sin avisos, `next build` correcto, migración y RLS verificadas en
PostgreSQL 17. Capturas revisadas a 360, 390, 768, 1024 y 1440 px, en claro y oscuro.

| Requisito | Estado | Evidencia |
| --- | --- | --- |
| ≤ 5 acciones primarias globales | ✔ | Alta rápida · Tareas · Agenda · Filtro de etiquetas · Más. E2E «la pantalla principal expone como máximo cinco acciones globales» |
| Crear escribiendo solo el título + Enter | ✔ | E2E «crear una tarea: tres interacciones, menos de diez segundos, sin modal» (clic, escribir, Enter; mide el tiempo) |
| El alta no abre modal | ✔ | Mismo E2E: `dialog` con recuento 0 |
| Descripción, fecha, hora y etiquetas después | ✔ | E2E «editar título, descripción, fecha y hora desde el detalle», «crear y asignar varias etiquetas» |
| Filtro: un único control cerrado por defecto | ✔ | E2E «el filtro es un único control cerrado…» (`aria-expanded=false` al inicio) |
| Varias etiquetas por tarea | ✔ | Dominio `asignarEtiqueta`, `normalizarEtiquetaIds`; E2E de etiquetas; RLS `guardar_tarea` con dos etiquetas |
| Eliminar una etiqueta no elimina tareas | ✔ | Dominio `desvincularEtiqueta`, servicio, reductor, E2E «renombrar y eliminar…», SQL `rls.sql` |
| Sin fecha no aparece en Agenda | ✔ | Dominio `calcularAgenda`; E2E de agenda |
| Agenda solo Hoy y Esta semana | ✔ | `RANGOS_AGENDA = ["hoy", "semana"]`; selector de dos pestañas |
| Orden cronológico | ✔ | Dominio `compararCronologicamente`; E2E comprueba el orden en ambos rangos |
| Vencidas distinguidas (no solo por color) | ✔ | Palabra «Vencida» + icono + color; grupo «Vencidas»; dominio `estaVencida` |
| Completada puede volver a pendiente | ✔ | E2E «completar y revertir con el mismo control» |
| JSON con todas las tareas y etiquetas | ✔ | Dominio y servicio; E2E «exportar JSON y CSV…» con filtro activo |
| CSV con todas las tareas y etiquetas | ✔ | Mismo E2E: cabecera + una fila por tarea, etiquetas por tarea, escapado RFC 4180 |
| Exportar en ≤ 2 acciones | ✔ | Más → Exportar JSON / Exportar CSV |
| Funciona desde 360 px | ✔ | Toda la suite E2E se ejecuta también a 360 px; «sin desplazamiento horizontal» |
| Operable con teclado | ✔ | E2E «toda la gestión principal se opera con teclado», selector de rango con flechas |
| Foco visible | ✔ | E2E «el foco es visible»; contraste del foco ≥ 3:1 por prueba de tokens |
| Movimiento reducido | ✔ | E2E «las transiciones se anulan cuando el sistema lo pide»; `MotionConfig reducedMotion="user"` |
| El dominio no importa React ni Next | ✔ | `lib/arquitectura.test.ts` + regla ESLint `no-restricted-imports` |
| Dominio con pruebas unitarias | ✔ | `lib/dominio/*.test.ts` |
| Datos por usuario y RLS | ✔ | `supabase/pruebas/rls.sql`; E2E «los datos están separados por usuario» |
| Sesión persistente | ✔ | E2E «registro, persistencia de sesión, cierre e inicio de sesión» |
| Accesibilidad automática | ✔ | axe (WCAG 2.1 A/AA): sin violaciones graves en acceso, tareas, detalle, filtro y agenda |
| Contraste ≥ 4.5:1 | ✔ | `lib/diseno/tokens.test.ts` en ambos esquemas |
| Nada fuera de alcance | ✔ | Sin proyectos, subtareas, prioridades, recordatorios, recurrencia, colaboración, estadísticas, búsqueda ni offline. Ideas registradas en `04-evolucion.md` |

## Decisiones que conviene conocer

- **Esta semana** es una ventana móvil de 7 días (hoy + 6) para que un domingo no muestre una
  «semana» de un solo día.
- **Hoy** incluye también las vencidas pendientes de días anteriores, agrupadas primero.
- **Completar** no mueve la fila mientras sigues en la vista; al volver, las completadas se
  agrupan en «Completadas», plegado.
- **Crear con un filtro activo** asigna a la tarea nueva las etiquetas del filtro, para que no
  desaparezca de la vista donde se acaba de crear. Sigue sin pedir nada más que el título.
- **El filtro** combina etiquetas con «cualquiera de» (OR).

## Pendiente de tu lado

- Conectar un proyecto de Supabase real (ver README). El código, la migración y la verificación de
  RLS están listos, pero el flujo con Supabase Auth no se ha ejecutado contra un proyecto real.
