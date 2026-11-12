# Bitácora de operación de Kairo

| Fecha | Actividad | Resultado | Observaciones |
|---|---|---|---|
| 2026-10-25 | Monitor en UptimeRobot sobre https://vibe-kairo-4.vercel.app/acceso, cada 5 min, alerta por correo | Activo | — |
| 2026-10-25 | Primer respaldo: public y auth.users | 2 archivos, huellas registradas | Guardado fuera del repositorio |
| 2026-11-07 | Revisión de Supabase | Estaba pausado por inactividad; se reanudó | — |
| 2026-11-07 | Intento de respaldo semanal | Falló: la cadena de conexión se capturó mal y quedó un archivo vacío | Sin respaldo ese día |
| 2026-11-11 | Liberación v0.9.0 (commit 2d1b48c, dpl_C87ia319XvwnrnQ7g1YFt2kFoMhp) | Checklist de 8.3 completo | Ver docs/liberacion/v0.9.0.md |
| 2026-11-11 | CP-11 en producción con el lote de 200 tareas | Lista: mediana 626 ms, máximo 645 ms. Agenda: mediana 566 ms, máximo 796 ms | Pasa; lote eliminado al terminar |
| 2026-11-12 | Respaldo semanal: public, auth.users y esquema de auth.users | 3 archivos: public 20 KB, auth-users 2,7 KB, esquema 6,2 KB | SHA-256 en el Documento Maestro (9.5); guardado fuera del repositorio |
| 2026-11-12 | Prueba de restauración del respaldo del 12/11 en PostgreSQL 17 local (podman) | 6 tareas, 5 etiquetas, 7 asignaciones y 5 usuarios restaurados | Primera restauración probada; los 5 usuarios coinciden con el panel de Authentication |
