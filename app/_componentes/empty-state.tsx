"use client";

import { motion } from "motion/react";

export function EmptyState({ titulo, detalle, accion }: { titulo: string; detalle?: string; accion?: React.ReactNode }) {
  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: 0.04, ease: [0, 0, 0.2, 1] }}
      className="px-6 py-16 text-center"
    >
      <p className="text-[15px] font-semibold text-fg">{titulo}</p>
      {detalle && <p className="mt-1 text-[14px] text-fg-muted">{detalle}</p>}
      {accion && <div className="mt-3">{accion}</div>}
    </motion.div>
  );
}
