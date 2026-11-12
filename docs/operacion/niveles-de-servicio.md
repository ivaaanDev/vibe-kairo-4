# Informe de niveles de servicio

Indicadores de 9.7 del Documento Maestro (RNF-06 y RNF-01). Se emite cada mes; el primero cubre el periodo
real del monitor, que arrancó el 25/10/2026 (contingencia de RSG-04).

## Periodo del 25/10/2026 al ⟨dd/mm/2026⟩

| Indicador | Objetivo | Fuente | Resultado |
| --- | --- | --- | --- |
| Disponibilidad (RNF-06, CP-16) | 99 % o más | UptimeRobot, monitor sobre `/acceso` cada 5 min | ⟨%⟩ |
| Caídas registradas por el monitor | — | UptimeRobot → Incidents | ⟨n · duración total⟩ |
| Tiempo de carga con 200 tareas (RNF-01, CP-11) | 2 s o menos | `npm run medir:carga` sobre v0.9.0 | ⟨mediana · máximo⟩ |
| Incidentes de severidad 3 resueltos en 1 día o menos | Todos | Registro de incidentes (9.4) | ⟨n de n⟩ |
| Pausas de Supabase | 0 | Panel de Supabase y bitácora | ⟨n⟩ |

Captura del panel del monitor: ⟨nombre del archivo⟩

Conclusión: ⟨se cumple / no se cumple⟩. ⟨Una línea con la causa si no se cumple.⟩
