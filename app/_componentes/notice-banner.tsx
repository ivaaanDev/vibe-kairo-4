"use client";

import { CircleAlert, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useKairo } from "@/app/_estado/proveedor-kairo";

/** Solo para errores: los cambios que ya se ven en pantalla no necesitan aviso. */
export function NoticeBanner() {
  const { aviso, descartarAviso } = useKairo();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-[60] flex justify-center px-4 sm:bottom-6">
      <AnimatePresence>
        {aviso && (
          <motion.div
            key={aviso.id}
            role="alert"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            className="pointer-events-auto flex w-full max-w-[440px] items-center gap-2 rounded-panel bg-fg py-1.5 pr-1.5 pl-4 text-[14px] text-bg shadow-[0_8px_24px_-12px_rgb(0_0_0/0.35)]"
          >
            <CircleAlert size={16} strokeWidth={2} aria-hidden className="shrink-0" />
            <p className="flex-1 py-1.5">{aviso.mensaje}</p>
            {aviso.reintentar && (
              <button
                type="button"
                onClick={() => {
                  descartarAviso();
                  aviso.reintentar?.();
                }}
                className="h-9 rounded-control px-3 font-semibold hover:bg-bg/10"
              >
                Reintentar
              </button>
            )}
            <button type="button" aria-label="Cerrar aviso" onClick={descartarAviso} className="grid size-9 place-items-center rounded-control hover:bg-bg/10">
              <X size={16} strokeWidth={2} aria-hidden />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
