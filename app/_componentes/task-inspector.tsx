"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { usePanel } from "@/app/_estado/panel-contextual";
import { useKairo } from "@/app/_estado/proveedor-kairo";
import type { Tarea } from "@/lib/tipos/tarea";
import { PanelHeader } from "./panel-header";
import { SaveIndicator } from "./save-indicator";
import { TaskEditor } from "./task-editor";

/** Detalle de una tarea. Conserva la última versión durante la animación de salida. */
export function TaskInspector({ id, modo }: { id: string; modo: "acoplado" | "superpuesto" }) {
  const { tareas } = useKairo();
  const { cerrar } = usePanel();
  const ruta = usePathname();
  const actual = tareas.find((tarea) => tarea.id === id);
  const [ultima, setUltima] = useState<Tarea | undefined>(actual);
  if (actual && actual !== ultima) setUltima(actual);
  const tarea = actual ?? (ultima?.id === id ? ultima : undefined);

  // Un id en la URL que no corresponde a ninguna tarea (enlace viejo) simplemente cierra el panel.
  useEffect(() => {
    if (!tarea) cerrar();
  }, [tarea, cerrar]);

  if (!tarea) return null;

  return (
    <div className="flex h-full flex-col bg-surface">
      <PanelHeader modo={modo} volverA={ruta.startsWith("/agenda") ? "Agenda" : "Tareas"} onCerrar={cerrar}>
        <SaveIndicator />
      </PanelHeader>
      <div key={tarea.id} className="min-h-0 flex-1 animate-aparecer overflow-y-auto overscroll-contain">
        <TaskEditor tarea={tarea} />
      </div>
    </div>
  );
}
