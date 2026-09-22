"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { movimiento } from "@/lib/diseno/tokens";
import { useViajeEnElTiempo } from "./contexto";
import { DURACION_LOGO, MENSAJE, TRANSICION, type Desfase } from "./secuencia";

const segundos = (ms: number) => ms / 1000;

/**
 * Un texto con fecha que puede leerse desplazado durante el efecto.
 * `base` es siempre el valor real —el que se ve el 100 % del tiempo— y `alternativo`
 * solo se consulta mientras el desfase no es 0. Nada de esto vuelve al dominio.
 */
export function TextoTemporal({
  base,
  alternativo,
  className = "",
}: {
  base: string;
  alternativo: (dias: Desfase) => string;
  className?: string;
}) {
  const { desfase, atenuado } = useViajeEnElTiempo();
  const reducido = useReducedMotion();
  const texto = desfase === 0 ? base : alternativo(desfase);

  // Con movimiento reducido el cambio es un fundido limpio, sin desplazamiento ni desenfoque.
  const animacion = reducido
    ? { opacity: atenuado ? 0 : 1 }
    : atenuado
      ? { opacity: 0.12, y: -3, filter: "blur(1.4px)" }
      : { opacity: 1, y: 0, filter: "blur(0px)" };

  return (
    <motion.span
      className={`inline-block ${className}`}
      animate={animacion}
      transition={{ duration: segundos(TRANSICION), ease: movimiento.curva.estandar }}
    >
      {texto}
    </motion.span>
  );
}

/**
 * Reacción de la marca: un vaivén corto, como un reloj que se reajusta.
 * `MotionConfig reducedMotion="user"` descarta el giro y la escala cuando el
 * sistema pide movimiento reducido y conserva el cambio de opacidad.
 */
export function ReaccionDeLaMarca({ children }: { children: React.ReactNode }) {
  const { activo } = useViajeEnElTiempo();
  return (
    <motion.span
      className="inline-flex shrink-0"
      style={{ transformOrigin: "50% 50%" }}
      animate={activo ? { rotate: [0, -6, 8, -3, 0], scale: [1, 0.96, 1.02, 1, 1], opacity: [1, 0.7, 1, 1, 1] } : { rotate: 0, scale: 1, opacity: 1 }}
      transition={
        activo
          ? { duration: segundos(DURACION_LOGO), times: [0, 0.12, 0.45, 0.78, 1], ease: movimiento.curva.estandar }
          : { duration: 0 }
      }
    >
      {children}
    </motion.span>
  );
}

/**
 * Comentario del producto junto a la marca. No bloquea nada ni pide confirmación.
 * Se coloca como las etiquetas flotantes del rail: a su derecha, fuera del camino.
 */
export function MensajeDelViaje() {
  const { mensaje } = useViajeEnElTiempo();
  return (
    <span role="status" className="pointer-events-none absolute top-1/2 left-full z-50 ml-2 -translate-y-1/2">
      <AnimatePresence>
        {mensaje && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: segundos(movimiento.duracion.normal), ease: movimiento.curva.entrada }}
            className="block w-max max-w-[220px] rounded-control bg-fg px-2 py-1 text-[12px] leading-4 font-medium text-bg shadow-[0_8px_24px_-12px_rgb(0_0_0/0.35)]"
          >
            {MENSAJE}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
