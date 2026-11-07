# Changelog

Todos los cambios notables de Kairo. El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el proyecto usa [versionado semántico](https://semver.org/lang/es/). Cada entrada cita el requisito, la
solicitud de cambio (CR) o el defecto (DEF) del Documento Maestro.

## [Sin publicar]

## [0.9.0] - 2026-11-08

Liberación de H3 (planeada para el 6 de noviembre): DEF-01 corregido, dependencias de producción sin avisos de
seguridad, RF-11 e integración continua. Registro en `docs/liberacion/v0.9.0.md`.

### Agregado

- Formatos de registro del cierre: liberación con el checklist de 8.3 y su acta (`docs/liberacion/v0.9.0.md`),
  hoja de la sesión de validación con CP-12 (`docs/validacion/sesion-v0.9.0.md`), minutas semanales y
  informe de niveles de servicio (`docs/operacion/`).
- Integración continua en GitHub Actions (`.github/workflows/ci.yml`): tipos, lint y unitarias, y después E2E en
  Chromium a 1440 y 360 px en cada PR y en cada push a `main` y `dev`. Un trabajo informativo corre los flujos en
  Firefox y Edge (CP-17, RNF-07). En CI, Playwright reintenta una vez y marca como intermitente lo que pasa al
  segundo intento.
- RF-11 (CR-04): aviso de privacidad público en `/privacidad`, enlazado desde el registro, con responsable,
  datos tratados, finalidad, encargados (Supabase y Vercel), conservación y derechos ARCO. Caso CP-19 con tres
  pruebas E2E y revisión de accesibilidad.
- CP-11 (RNF-01): `npm run medir:carga` siembra el lote de 200 tareas de 6.2 en una cuenta de pruebas y mide la
  carga de la lista y de la agenda (mediana y máximo de cinco cargas sin caché). Con `--limpiar` borra el lote.

### Corregido

- DEF-01 (#1): recargar o cerrar la pestaña con cambios pendientes ya no los pierde. El navegador pide
  confirmación mientras hay guardados en curso y las escrituras usan `keepalive`. Prueba de regresión E2E
  nueva; la prueba de varias etiquetas pasó 30 de 30 repeticiones (RF-07).
- DEF-02: `docs/05-verificacion.md` refleja los conteos reales de pruebas y el estado de producción.

### Seguridad

- Next.js 16.3.4 → 16.4.5 y `eslint-config-next` a la misma versión: corrige la vulnerabilidad crítica y las
  altas que reportaba `npm audit` en las dependencias de producción (avisos de Next.js, sharp y source-map-js).
  `npm audit --omit=dev` queda en cero.

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
