# Informe de niveles de servicio

Indicadores de 9.7 del Documento Maestro (RNF-06 y RNF-01). Se emite cada mes; el primero cubre el periodo
real del monitor, que arrancó el 25/10/2026 (contingencia de RSG-04).

## Periodo del 25/10/2026 al 12/11/2026

| Indicador | Objetivo | Fuente | Resultado |
| --- | --- | --- | --- |
| Disponibilidad (RNF-06, CP-16) | 99 % o más | UptimeRobot, monitor sobre `/acceso` cada 5 min | ✓ 100 % en los últimos 30 días; arriba sin interrupción desde hace 17 d 20 h |
| Caídas registradas por el monitor | — | UptimeRobot → Incidents | 0 caídas, 0 min |
| Tiempo de carga con 200 tareas (RNF-01, CP-11) | 2 s o menos | `npm run medir:carga` sobre v0.9.0 (11/11) | ✓ Lista: mediana 626 ms, máximo 645 ms. Agenda: mediana 566 ms, máximo 796 ms |
| Incidentes de severidad 3 resueltos en 1 día o menos | Todos | Registro de incidentes (9.4) | Ninguno de severidad 3. La pausa de Supabase se registra como INC-01 (abajo) |
| Pausas de Supabase | 0 | Panel de Supabase y bitácora | ✗ 1: el proyecto estaba pausado por inactividad; se detectó y reanudó el 07/11 |

Referencia del monitor: tiempo de respuesta de `/acceso` en la última hora del 12/11, promedio 271 ms (mínimo
153 ms, máximo 388 ms).

Captura del panel del monitor: `uptimerobot-2026-11-12.png`, en el Anexo A del Documento Maestro (fuera del
repositorio).

## INC-01: pausa de Supabase por inactividad

| Dato | Valor |
| --- | --- |
| Detección | 07/11/2026, durante la revisión de operación (no la detectó el monitor) |
| Efecto | Mientras duró la pausa, la base de datos y la autenticación no respondían; la duración exacta no se conoce |
| Causa | El plan gratuito pausa el proyecto tras varios días sin actividad, y la rutina de entrar con la cuenta de pruebas cada 2 días no se cumplió después del 25/10 |
| Resolución | Proyecto reanudado desde el panel el mismo 07/11 |
| Por qué el monitor no lo vio | `/acceso` responde 200 desde Vercel aunque Supabase esté pausado: el monitor vigila el sitio, no la base |

## Conclusión

Se cumplen la disponibilidad del sitio (100 % contra 99 %) y el tiempo de carga de RNF-01. No se cumple el
indicador de pausas de Supabase: hubo una, y el monitor no la detectó porque no consulta la base.

Acción propuesta (solicitud de cambio): una ruta de salud, por ejemplo `/api/salud`, que haga una consulta mínima
a Supabase, y apuntar el monitor a ella. Así el monitor detectaría una pausa, y su propia consulta cada 5 minutos
probablemente bastaría para que el proyecto no se considere inactivo.
