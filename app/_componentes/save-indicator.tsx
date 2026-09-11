"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useKairo } from "@/app/_estado/proveedor-kairo";

/** Feedback silencioso de autoguardado: aparece, confirma y se retira. */
export function SaveIndicator() {
  const { guardado, guardadoMarca } = useKairo();
  const [ocultoEnMarca, setOcultoEnMarca] = useState(-1);

  useEffect(() => {
    if (guardado !== "guardado") return;
    const temporizador = setTimeout(() => setOcultoEnMarca(guardadoMarca), 1600);
    return () => clearTimeout(temporizador);
  }, [guardado, guardadoMarca]);

  const visible = guardado === "guardando" || guardado === "error" || (guardado === "guardado" && ocultoEnMarca !== guardadoMarca);

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-1 px-2 text-[13px] transition-opacity duration-(--k-duracion-normal) ${
        visible ? "opacity-100" : "opacity-0"
      } ${guardado === "error" ? "text-danger" : "text-fg-muted"}`}
    >
      {guardado === "guardado" && <Check size={14} strokeWidth={2} aria-hidden />}
      {guardado === "guardando" ? "Guardando…" : guardado === "error" ? "Sin guardar" : guardado === "guardado" ? "Guardado" : ""}
    </span>
  );
}
