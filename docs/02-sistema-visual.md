# Kairo — Fase B · Sistema visual

Fuente única: [`lib/diseno/tokens.ts`](../lib/diseno/tokens.ts). La web convierte los tokens en
variables CSS (`--k-*`) al renderizar el layout raíz; Tailwind solo les da nombre en
[`app/globals.css`](../app/globals.css). Una app React Native podría importar el mismo archivo.

## Color

Paleta neutra y cálida (papel, no pantalla), un único acento azul tinta y un color semántico de
peligro que aparece solo para vencidas, errores y eliminar. El esquema oscuro sigue al sistema.
No hay selector de tema: no es una función, es respeto por la preferencia del sistema.

| Token | Claro | Oscuro | Uso |
| --- | --- | --- | --- |
| `background` | `#F7F6F3` | `#151514` | Fondo de la app |
| `surface` | `#FFFFFF` | `#1C1C1A` | Paneles, sheets, campos |
| `surfaceSecondary` | `#EEEDE9` | `#272725` | Hover, selector segmentado |
| `textPrimary` | `#1C1B19` | `#ECEAE5` | Títulos y texto |
| `textSecondary` | `#5E5B55` | `#A6A39C` | Metadatos, placeholders |
| `border` | `#E3E1DC` | `#2F2E2B` | Separadores (decorativo) |
| `borderStrong` | `#817E78` | `#75726B` | Contorno de controles (≥ 3:1) |
| `accent` | `#3F4FC0` | `#97A3FF` | Selección, «Hoy», foco, acción principal |
| `accentSoft` | `#E9EBF8` | `#252842` | Fila seleccionada, filtro activo |
| `danger` | `#B42318` | `#FF8F84` | Vencidas, errores, eliminar |
| `focus` | = accent | = accent | Anillo de foco |

Garantías comprobadas por prueba ([`tokens.test.ts`](../lib/diseno/tokens.test.ts)):
texto primario, secundario, acento y peligro ≥ 4.5:1 sobre los tres fondos, en ambos esquemas;
contornos de controles, foco e indicadores de etiqueta ≥ 3:1 (WCAG 1.4.11).

**Etiquetas.** Ocho tonos apagados (pizarra, salvia, arena, ciruela, teja, bruma, musgo,
grafito) que solo aparecen como puntos de 8 px junto al nombre. El color nunca es el único
portador de información: el nombre siempre está presente. Los estados usan palabra + icono:
«Vencida», check con tachado.

## Tipografía

Inter (autoalojada por `next/font`), con respaldo en la fuente del sistema. Números tabulares
en horas y contadores.

| Rol | Tamaño / línea / peso |
| --- | --- |
| Título de vista | 26/32 · 650 |
| Título en detalle | 20/28 · 600 |
| Cuerpo | 15/22 (16/24 en táctil: evita el zoom de iOS) |
| Metadatos | 13/18 |
| Encabezado de grupo | 13/18 · 600 |

La jerarquía sale del tamaño, el peso y el espacio, no del color.

## Espacio, radios y bordes

- Escala de 4 px. Filas de al menos 48 px en móvil; toda área táctil ≥ 44 × 44.
- Columna de contenido de 720 px como máximo.
- Radios: 6 (controles), 10 (paneles y popovers), 14 (sheets). Nada de píldoras gigantes.
- Bordes de 1 px; los separadores de fila empiezan donde empieza el texto (inset).
- Una sola sombra suave, reservada a lo que flota (popover, panel superpuesto, aviso).

## Iconografía

Una sola familia: Lucide (`lucide-react`; en React Native, `lucide-react-native` con los mismos
nombres). Trazo 1.75; 16–18 px en acciones secundarias, 20 px en navegación.

| Función | Icono |
| --- | --- |
| Tareas / Agenda / Más | `ListChecks` / `CalendarDays` / `Ellipsis` |
| Filtro | `ListFilter` |
| Alta rápida (indicativo) / enviar | `Plus` / `CornerDownLeft` |
| Fecha / hora / etiquetas | `Calendar` / `Clock` / `Tag` |
| Etiquetas (menú) / exportar | `Tags` / `FileBraces`, `FileSpreadsheet` |
| Cerrar / volver | `X` / `ChevronLeft` |
| Vencida / tiene nota | `CircleAlert` / `TextAlignStart` |
| Eliminar / cerrar sesión | `Trash` / `LogOut` |

Los botones de solo icono tienen nombre accesible y tooltip en escritorio (con retardo, solo con
puntero que admite hover).

## Movimiento

| Duración | Uso |
| --- | --- |
| 120 ms | Pulsación, hover, salida de filas y popovers |
| 180 ms | Entrada de filas, tachado, check, cambio de rango, vistas |
| 240 ms | Inspector, panel superpuesto, sheet |

Curvas: estándar `(0.2, 0, 0, 1)`, entrada `(0, 0, 0.2, 1)`, salida `(0.4, 0, 1, 1)`.
Solo `opacity`, `translate` y un `scale` mínimo (0.88–0.98) en pulsaciones.
Cada animación explica algo: dónde apareció la tarea, que se completó, de dónde viene el panel.
La única excepción de más de 350 ms es la marca en el acceso (900 ms, una sola vez).

`prefers-reduced-motion`: CSS anula duraciones y `MotionConfig reducedMotion="user"` desactiva
los desplazamientos (verificado en Playwright).

## Estados de interacción y foco

- Hover solo como realce, nunca como requisito (acciones siempre visibles o dentro del detalle).
- Pulsado: `scale` sutil. Deshabilitado: 40–70 % de opacidad.
- Foco: contorno de 2 px en `focus` con 2 px de separación. Los campos lo muestran en su propio
  borde. El `outline` nunca se elimina sin reemplazo.

## Puntos de corte

| Nombre | Desde | Cambio |
| --- | --- | --- |
| compacto | 0 | Barra inferior, detalle a pantalla completa, sheets |
| medio | 640 | Rail de iconos, popovers, panel lateral superpuesto |
| amplio | 1024 | Inspector acoplado |
| extendido | 1280 | Rail con nombres y contadores |

## La marca

Un anillo —el mismo trazo que la casilla de completado— con un punto que marca un instante.
Kairós, el momento oportuno. Aparece en el rail y en el acceso; en el acceso el punto recorre un
tramo del anillo. No se repite como decoración.
