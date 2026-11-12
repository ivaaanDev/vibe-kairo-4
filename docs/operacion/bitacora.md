# Bitácora de operación de Kairo

| Fecha | Actividad | Resultado | Observaciones |
|---|---|---|---|
| 2026-10-25 | Monitor en UptimeRobot sobre https://vibe-kairo-4.vercel.app/acceso, cada 5 min, alerta por correo | Activo | — |
| 2026-10-25 | Primer respaldo: public y auth.users | 2 archivos, huellas registradas | Guardado fuera del repositorio |
| 2026-11-11 | Revisión de Supabase y actividad con la cuenta qa | ⟨Activo / Estaba pausado, se reanudó⟩ | — |
| 2026-11-11 | Cambio de la contraseña de la base de datos | Hecho | Se expuso por error al copiar un comando; se cambió el mismo día. La app no usa esa contraseña |
| 2026-11-11 | Respaldo semanal: public, auth.users y esquema de auth.users | 3 archivos: public ⟨tamaño⟩, auth-users ⟨tamaño⟩, esquema ⟨tamaño⟩; SHA-256 registradas | Guardado fuera del repositorio |
| 2026-11-11 | Conteos en producción al momento del respaldo | ⟨n⟩ tareas, ⟨n⟩ etiquetas, ⟨n⟩ asignaciones, ⟨n⟩ usuarios | Consulta en el SQL Editor |
| 2026-11-11 | Prueba de restauración del respaldo del 07/11 en PostgreSQL 17 local (podman) | ⟨n⟩ tareas, ⟨n⟩ etiquetas, ⟨n⟩ asignaciones, ⟨n⟩ usuarios; iguales a producción | Primera restauración probada (9.5, 9.6) |
