# Changelog

Todos los cambios notables de Kairo. El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el proyecto usa [versionado semántico](https://semver.org/lang/es/). Cada entrada cita el requisito, la
solicitud de cambio (CR) o el defecto (DEF) del Documento Maestro.

## [Sin publicar]

### Agregado

- Integración continua en GitHub Actions (`.github/workflows/ci.yml`): tipos, lint y unitarias, y después E2E en
  Chromium a 1440 y 360 px en cada PR y en cada push a `main` y `dev`. Un trabajo informativo corre los flujos en
  Firefox y Edge (CP-17, RNF-07). En CI, Playwright reintenta una vez y marca como intermitente lo que pasa al
  segundo intento.

## [0.1.0] - 2026-09-22

Línea base de construcción (etiqueta `v0.1.0` sobre `7bbd1b2`).

### Agregado

- Cuentas con correo y contraseña: registro, inicio y cierre de sesión (RF-01, RF-02).
- Tareas: alta rápida con solo el título, edición de nota, fecha y hora, completar y revertir, eliminar
  (RF-03 a RF-05, RF-08).
- Etiquetas: crear, renombrar, eliminar sin borrar tareas y asignar varias por tarea (RF-06, RF-07).
- Filtro por etiquetas en un único control (RF-07).
- Agenda con las vistas Hoy y Esta semana, vencidas primero (RF-09).
- Exportación de tareas y etiquetas en JSON y CSV (RF-10).
- «Viaje en el tiempo»: cinco clics en la marca desplazan las fechas un instante (RF-12, incorporado por CR-03
  el 25/10/2026).
- Datos separados por usuario con RLS en Supabase (RNF-04, RNF-05) y adaptador local para desarrollo y pruebas.
