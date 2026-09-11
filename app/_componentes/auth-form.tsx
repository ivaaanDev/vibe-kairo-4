"use client";

import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { crearClienteKairo } from "@/lib/cliente/api-kairo";
import { KairoMark, KairoWordmark } from "./kairo-mark";

const cliente = crearClienteKairo();

type Modo = "acceso" | "registro";

const TEXTOS: Record<Modo, { titulo: string; boton: string; alternativa: string; enlace: string; destino: string }> = {
  acceso: { titulo: "Inicia sesión", boton: "Entrar", alternativa: "¿No tienes cuenta?", enlace: "Crear cuenta", destino: "/registro" },
  registro: { titulo: "Crea tu cuenta", boton: "Crear cuenta", alternativa: "¿Ya tienes cuenta?", enlace: "Inicia sesión", destino: "/acceso" },
};

const CLASE_CAMPO =
  "campo h-11 w-full rounded-control border border-line bg-surface px-3 text-[16px] text-fg transition-colors focus-visible:border-accent focus-visible:outline-1 focus-visible:outline-focus aria-[invalid=true]:border-danger sm:text-[15px]";

export function AuthForm({
  modo,
  cuentaDemo,
  aviso,
}: {
  modo: Modo;
  cuentaDemo: { correo: string; contrasena: string } | null;
  aviso?: string | null;
}) {
  const textos = TEXTOS[modo];
  const id = useId();
  const router = useRouter();
  // Entrar recarga el layout de la app en el servidor con la cookie de sesión nueva.
  const entrar = () => {
    router.replace("/");
    router.refresh();
  };
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [verContrasena, setVerContrasena] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<{ mensaje: string; campo?: string } | null>(null);
  const [confirmacionEnviada, setConfirmacionEnviada] = useState<string | null>(null);

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setEnviando(true);
    setError(null);
    const credenciales = { correo, contrasena };
    if (modo === "acceso") {
      const resultado = await cliente.iniciarSesion(credenciales);
      if (resultado.ok) {
        entrar();
        return;
      }
      setError({ mensaje: resultado.error.mensaje, campo: resultado.error.campo });
    } else {
      const resultado = await cliente.registrar(credenciales);
      if (resultado.ok) {
        if (resultado.valor.requiereConfirmacion) setConfirmacionEnviada(resultado.valor.usuario.correo);
        else {
          entrar();
          return;
        }
      } else setError({ mensaje: resultado.error.mensaje, campo: resultado.error.campo });
    }
    setEnviando(false);
  };

  if (confirmacionEnviada) {
    return (
      <div className="w-full max-w-[360px] animate-aparecer">
        <Marca />
        <h1 className="mt-8 text-[22px] leading-7 font-semibold tracking-[-0.01em]">Revisa tu correo</h1>
        <p className="mt-2 text-[15px] text-fg-muted">
          Enviamos un enlace a <span className="font-medium text-fg">{confirmacionEnviada}</span>. Ábrelo para activar tu cuenta.
        </p>
        <Link href="/acceso" className="mt-6 inline-flex h-11 items-center text-[15px] font-medium text-accent">
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  const errorEn = (campo: string) => error?.campo === campo;

  return (
    <div className="w-full max-w-[360px] animate-aparecer">
      <Marca />
      <h1 className="mt-8 text-[22px] leading-7 font-semibold tracking-[-0.01em]">{textos.titulo}</h1>

      {aviso && (
        <p role="alert" className="mt-4 rounded-control border border-line bg-surface px-3 py-2.5 text-[14px] text-fg">
          {aviso}
        </p>
      )}

      <form onSubmit={enviar} noValidate className="mt-6 flex flex-col gap-4">
        <div>
          <label htmlFor={`${id}-correo`} className="mb-1.5 block text-[14px] font-medium">
            Correo
          </label>
          <input
            id={`${id}-correo`}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            value={correo}
            onChange={(evento) => setCorreo(evento.target.value)}
            aria-invalid={errorEn("correo") || undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className={CLASE_CAMPO}
          />
        </div>
        <div>
          <label htmlFor={`${id}-contrasena`} className="mb-1.5 block text-[14px] font-medium">
            Contraseña
          </label>
          <div className="relative">
            <input
              id={`${id}-contrasena`}
              type={verContrasena ? "text" : "password"}
              autoComplete={modo === "acceso" ? "current-password" : "new-password"}
              required
              minLength={modo === "registro" ? 8 : undefined}
              value={contrasena}
              onChange={(evento) => setContrasena(evento.target.value)}
              aria-invalid={errorEn("contrasena") || undefined}
              aria-describedby={[modo === "registro" ? `${id}-pista` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined}
              className={`${CLASE_CAMPO} pr-12`}
            />
            <button
              type="button"
              onClick={() => setVerContrasena((visible) => !visible)}
              aria-label={verContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={verContrasena}
              className="absolute top-0 right-0 grid size-11 place-items-center rounded-control text-fg-muted hover:text-fg"
            >
              {verContrasena ? <EyeOff size={18} strokeWidth={1.75} aria-hidden /> : <Eye size={18} strokeWidth={1.75} aria-hidden />}
            </button>
          </div>
          {modo === "registro" && (
            <p id={`${id}-pista`} className="mt-1.5 text-[13px] text-fg-muted">
              Al menos 8 caracteres.
            </p>
          )}
        </div>

        {error && (
          <p id={`${id}-error`} role="alert" className="text-[14px] text-danger">
            {error.mensaje}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-control bg-accent text-[15px] font-semibold text-accent-fg transition-[transform,opacity] active:scale-[0.99] disabled:opacity-70"
        >
          {enviando && <LoaderCircle size={16} strokeWidth={2} aria-hidden className="animate-spin motion-reduce:animate-none" />}
          {textos.boton}
        </button>
      </form>

      <p className="mt-6 text-[14px] text-fg-muted">
        {textos.alternativa}{" "}
        <Link href={textos.destino} className="font-medium text-accent underline-offset-2 hover:underline">
          {textos.enlace}
        </Link>
      </p>

      {cuentaDemo && modo === "acceso" && (
        <div className="mt-8 rounded-control border border-dashed border-line-strong px-3 py-2.5 text-[13px] text-fg-muted">
          <p className="font-medium text-fg">Modo local de desarrollo</p>
          <p className="mt-0.5">
            Cuenta de demostración: <span className="font-medium text-fg">{cuentaDemo.correo}</span> ·{" "}
            <span className="font-medium text-fg">{cuentaDemo.contrasena}</span>
          </p>
          <button
            type="button"
            onClick={() => {
              setCorreo(cuentaDemo.correo);
              setContrasena(cuentaDemo.contrasena);
            }}
            className="-mx-1 mt-1 h-9 rounded-control px-1 font-medium text-accent"
          >
            Usar cuenta de demostración
          </button>
        </div>
      )}
    </div>
  );
}

function Marca() {
  return (
    <div className="flex items-center gap-2.5 text-fg">
      <KairoMark tamano={30} animada />
      <KairoWordmark className="text-[20px]" />
    </div>
  );
}
