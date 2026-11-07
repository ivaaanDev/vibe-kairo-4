# Sesión de validación sobre v0.9.0

Hoja de trabajo de la sección 7 del Documento Maestro. Los criterios de 7.1 se fijaron antes de la sesión y
no se ajustan a lo observado. Quien conduce solo observa y anota: no explica cómo hacer las tareas.

## Datos de la sesión (7.2)

| Dato | Valor |
| --- | --- |
| Fecha y lugar | ⟨dd/mm/2026⟩ · ⟨lugar⟩ |
| URL de producción | https://vibe-kairo-4.vercel.app |
| Versión validada | `v0.9.0` · commit ⟨hash⟩ |
| Conduce y anota | Rojo Chávez Braulio Ivan |

## Antes de empezar

- Cada usuario crea su propia cuenta en la sesión; no se usa la cuenta de demostración ni la de pruebas.
- Cronómetro listo (el del teléfono basta). Para CP-12 se cuenta desde que el usuario toca el campo hasta que la
  tarea aparece en la lista.
- Una interacción es un toque o clic, o la tecla Enter. Escribir el título cuenta como una sola interacción.

## Guion por usuario (20 minutos)

| Paso | Lo que se le pide | Qué se anota | Criterio |
| --- | --- | --- | --- |
| 1 | Crea una cuenta y entra desde tu teléfono | Si lo logra sin ayuda | N-05 |
| 2 | Anota cinco pendientes, uno por uno, empezando por «Pagar la luz» | Interacciones y segundos de cada uno (tabla CP-12) | N-01 |
| 3 | Crea dos etiquetas tuyas, ponle ambas a una tarea y muestra solo las tareas de una de ellas | Si lo logra sin ayuda; recargar y revisar que sigan las dos etiquetas | N-02 |
| 4 | Pon fecha de hoy a una tarea y de mañana a otra. ¿Qué te toca hoy? | Si la respuesta es correcta | N-03 |
| 5 | Entra desde una computadora con la misma cuenta | Si ve los mismos datos | N-05 |
| 6 | Descarga tus datos y ábrelos en una hoja de cálculo | Si reconoce sus tareas | N-06 |
| 7 | Del 1 al 5, ¿qué tan de acuerdo estás con «la pantalla principal es clara y no me abruma»? | La calificación | N-04 |
| 8 | ¿Qué cambiarías? | Comentario libre | — |

## Participantes (7.3)

| Usuario | Cómo organiza hoy sus pendientes | Teléfono · navegador | Computadora · navegador |
| --- | --- | --- | --- |
| U1 · Mario Lozano Márquez | ⟨ ⟩ | ⟨ ⟩ | ⟨ ⟩ |
| U2 · Martín Humberto Hernández Morales | ⟨ ⟩ | ⟨ ⟩ | ⟨ ⟩ |
| U3 · Ángel Yael Flores Campos | ⟨ ⟩ | ⟨ ⟩ | ⟨ ⟩ |

## CP-12 (RNF-02): captura de cinco tareas, paso 2

Se acepta con 3 interacciones o menos por tarea y un promedio de 10 s o menos.

| Usuario | Tarea 1 | Tarea 2 | Tarea 3 | Tarea 4 | Tarea 5 | Promedio |
| --- | --- | --- | --- | --- | --- | --- |
| U1 | ⟨int · s⟩ | ⟨int · s⟩ | ⟨int · s⟩ | ⟨int · s⟩ | ⟨int · s⟩ | ⟨int · s⟩ |
| U2 | ⟨int · s⟩ | ⟨int · s⟩ | ⟨int · s⟩ | ⟨int · s⟩ | ⟨int · s⟩ | ⟨int · s⟩ |
| U3 | ⟨int · s⟩ | ⟨int · s⟩ | ⟨int · s⟩ | ⟨int · s⟩ | ⟨int · s⟩ | ⟨int · s⟩ |

## Resultados por criterio (7.4)

Un criterio se cumple cuando se cumple con los tres usuarios.

| Criterio | U1 | U2 | U3 | Resultado |
| --- | --- | --- | --- | --- |
| N-01 Captura rápida | ⟨✓/✗ · s⟩ | ⟨✓/✗ · s⟩ | ⟨✓/✗ · s⟩ | ⟨Cumple / No cumple⟩ |
| N-02 Etiquetas propias | ⟨✓/✗⟩ | ⟨✓/✗⟩ | ⟨✓/✗⟩ | ⟨ ⟩ |
| N-03 Agenda | ⟨✓/✗⟩ | ⟨✓/✗⟩ | ⟨✓/✗⟩ | ⟨ ⟩ |
| N-04 Claridad (1 a 5; se acepta 4 o 5) | ⟨n⟩ | ⟨n⟩ | ⟨n⟩ | ⟨ ⟩ |
| N-05 Teléfono y computadora | ⟨✓/✗⟩ | ⟨✓/✗⟩ | ⟨✓/✗⟩ | ⟨ ⟩ |
| N-06 Exportación | ⟨✓/✗⟩ | ⟨✓/✗⟩ | ⟨✓/✗⟩ | ⟨ ⟩ |

## Hallazgos (7.5)

Cada hallazgo termina en uno de tres destinos: defecto (incidencia `bug`), solicitud de cambio (incidencia
`cambio`) o aceptado como está, con la razón.

| # | Usuario | Hallazgo | Destino | Incidencia o razón |
| --- | --- | --- | --- | --- |
| H-01 | ⟨U⟩ | ⟨ ⟩ | ⟨defecto / cambio / aceptado⟩ | ⟨#n o razón⟩ |

## Informe de validación (7.5)

| Apartado | Contenido |
| --- | --- |
| Versión y entorno | `v0.9.0` en https://vibe-kairo-4.vercel.app |
| Participantes | Los tres usuarios de 7.3 |
| Criterios cumplidos | ⟨n⟩ de 6 |
| Hallazgos y tratamiento | ⟨resumen⟩ |
| Limitaciones | Tres usuarios no permiten generalizar (RSG-07); la sesión fue observada, no en uso libre |
| Conclusión | ⟨el producto satisface / no satisface las necesidades N-01 a N-06⟩ |

## Acta de aceptación (7.6)

| Rol | Nombre | Decisión | Fecha | Firma |
| --- | --- | --- | --- | --- |
| Usuario de validación | Mario Lozano Márquez | ⟨Aceptado / Con observaciones / Rechazado⟩ | ⟨ ⟩ | |
| Usuario de validación | Martín Humberto Hernández Morales | ⟨Aceptado / Con observaciones / Rechazado⟩ | ⟨ ⟩ | |
| Usuario de validación | Ángel Yael Flores Campos | ⟨Aceptado / Con observaciones / Rechazado⟩ | ⟨ ⟩ | |
| Product Owner | Rojo Chávez Braulio Ivan | Atiende los hallazgos | ⟨ ⟩ | |

Las firmas se recogen en papel o en PDF; aquí se anota dónde quedó el archivo firmado: ⟨ ⟩
