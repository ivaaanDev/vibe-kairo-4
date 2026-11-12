# Minutas de los puntos de control semanales

Punto de control de 1.8.8 y 12.8 del Documento Maestro: al cierre de cada semana se contrasta el avance con la
lista de verificación para detectar evidencia faltante mientras aún es posible generarla. Tres líneas bastan.

Las semanas hasta el 08/11/2026 se reconstruyeron el 12/11/2026 a partir de evidencia fechada (versiones del
Documento Maestro, commits, etiquetas y entregables). Una semana sin evidencia dice «Sin registro»; no se
rellena después.

| Semana | Avance contra la lista | Evidencia faltante o desvío | Siguiente |
| --- | --- | --- | --- |
| 10–16 ago | Documento Maestro 1.0 (14/08): definición del sistema y requisitos | — | — |
| 17–23 ago | Sin registro | — | — |
| 24–30 ago | Revisión de requisitos con el auditor (29/08, 2.4) | — | — |
| 31 ago–06 sep | Sin registro | — | — |
| 07–13 sep | Repositorio y aplicación construidos (5 commits del 11/09) | Código antes de la revisión formal de requisitos; sin ramas ni PR (4.2, 4.7) | Revisar requisitos y registrar el estado real del repositorio |
| 14–20 sep | Sin registro | — | — |
| 21–27 sep | Autoauditoría contra la lista: 34 de 48 (22/09); evaluación ISO/IEC 14598 (24/09); Documento Maestro 1.1 y 1.2; 2 commits del 22/09 (7bbd1b2) | Sin ramas, PR ni etiquetas | Sección 6 (verificación) |
| 28 sep–04 oct | Sin registro | — | — |
| 05–11 oct | Sin registro | — | — |
| 12–18 oct | Documento Maestro 1.3 y 1.4: plan y casos de prueba (12/10) y verificación ejecutada sobre 7bbd1b2 (13/10) | DEF-01 abierto (CP-07) | Secciones 7 a 12 |
| 19–25 oct | Documento Maestro 1.5 a 1.7: autoevaluación 143 → 154 de 190; aprobaciones firmadas; monitor y primer respaldo (25/10) | Sin CI, PR, etiquetas ni liberación; validación pendiente | Corregir DEF-01 y liberar v0.9.0 |
| 26 oct–01 nov | Sin registro | H3 (v0.9.0, 6/11) en riesgo: sin avance en el repositorio | — |
| 02–08 nov | 07/11: parches de cierre preparados y probados (DEF-01, CI, Next.js 16.4.5, RF-11); etiqueta v0.1.0 y rama dev; Supabase reanudado tras una pausa por inactividad | H3 no se cumplió el 6/11. El respaldo semanal del 07/11 falló (archivo vacío) | Integrar los cambios por PR y liberar v0.9.0 |
| 09–15 nov (al 12/11) | PR #2 (CI, 09/11), #4 (DEF-01, 10/11), #5 (Next.js 16.4.5, 10/11), #6 (RF-11) y #7 (11/11); en el #6 la CI detectó una prueba de contraste intermitente y se corrigió. v0.9.0 liberada el 11/11 por el PR #8 con el checklist de 8.3 completo; CP-11 y CP-14 pasan en producción. 12/11: respaldo y primera restauración probada | H4 (10/11) no se cumplió. Un commit directo a main el 12/11 (20444a4), sin PR. Sin respaldos semanales entre el 25/10 y el 12/11 | Sesión de validación con usuarios, v1.0.0 y Documento Maestro 1.8 |
