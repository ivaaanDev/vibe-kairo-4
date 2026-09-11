"use client";

import { CornerDownLeft, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { useKairo } from "@/app/_estado/proveedor-kairo";
import { longitud } from "@/lib/dominio/texto";
import { LIMITES_TAREA } from "@/lib/dominio/validacion-tarea";
import { IconButton } from "./primitivas/icon-button";

/*
 * El flujo más importante de Kairo: tocar, escribir, Enter.
 * Sin modal, sin campos extra. El campo conserva el foco para la siguiente tarea.
 */
export function QuickTaskInput() {
  const { crearTarea, filtro } = useKairo();
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const campo = useRef<HTMLInputElement>(null);
  const restantes = LIMITES_TAREA.tituloMaximo - longitud(texto);

  const enviar = (evento: React.FormEvent) => {
    evento.preventDefault();
    if (texto.trim().length === 0) return;
    const resultado = crearTarea(texto);
    if (!resultado.ok) {
      setError(resultado.error.mensaje);
      return;
    }
    setTexto("");
    setError(null);
    campo.current?.focus();
  };

  return (
    <form onSubmit={enviar} aria-label="Nueva tarea">
      <div className="flex h-12 items-center rounded-panel border border-line bg-surface transition-[border-color,box-shadow] duration-(--k-duracion-inmediata) has-[input:focus-visible]:border-accent has-[input:focus-visible]:shadow-[0_0_0_1px_var(--k-focus)]">
        <span aria-hidden className="grid size-11 shrink-0 place-items-center text-fg-muted">
          <Plus size={18} strokeWidth={1.75} />
        </span>
        <label htmlFor="alta-rapida" className="sr-only">
          Nueva tarea
        </label>
        <input
          ref={campo}
          id="alta-rapida"
          type="text"
          value={texto}
          onChange={(evento) => {
            setTexto(evento.target.value);
            if (error) setError(null);
          }}
          placeholder="Escribe una tarea y presiona Enter"
          maxLength={LIMITES_TAREA.tituloMaximo}
          autoComplete="off"
          enterKeyHint="enter"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "alta-rapida-error" : filtro.length > 0 ? "alta-rapida-filtro" : undefined}
          className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-fg focus-visible:outline-none sm:text-[15px]"
        />
        {restantes <= 20 && (
          <span aria-live="polite" className={`px-1 text-[12px] numeros-tabulares ${restantes <= 0 ? "text-danger" : "text-fg-muted"}`}>
            {restantes}
            <span className="sr-only"> caracteres restantes</span>
          </span>
        )}
        {texto.trim().length > 0 && (
          <IconButton type="submit" icono={CornerDownLeft} etiqueta="Añadir tarea" tooltip="Añadir · Enter" tamanoIcono={16} />
        )}
      </div>
      {filtro.length > 0 && (
        <p id="alta-rapida-filtro" className="sr-only">
          La tarea nueva recibirá las etiquetas del filtro activo.
        </p>
      )}
      {error && (
        <p id="alta-rapida-error" role="alert" className="mt-1.5 px-1 text-[13px] text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
