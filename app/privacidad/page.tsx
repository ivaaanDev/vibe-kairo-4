import type { Metadata } from "next";
import Link from "next/link";
import { KairoMark } from "@/app/_componentes/kairo-mark";
import { CORREO_CONTACTO } from "@/lib/plataforma/contacto";

export const metadata: Metadata = { title: "Aviso de privacidad" };

const ACTUALIZACION = "7 de noviembre de 2026";

function Correo() {
  return (
    <a href={`mailto:${CORREO_CONTACTO}`} className="font-medium text-accent underline-offset-2 hover:underline">
      {CORREO_CONTACTO}
    </a>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-[17px] leading-6 font-semibold">{titulo}</h2>
      <div className="mt-2 space-y-2 text-[15px] leading-6 text-fg-muted">{children}</div>
    </section>
  );
}

/** Aviso de privacidad (RF-11, exigido por la restricción R-06). Público: se abre sin sesión. */
export default function PaginaPrivacidad() {
  return (
    <main className="mx-auto w-full max-w-[640px] px-4 py-12">
      <KairoMark tamano={28} className="text-fg" />
      <h1 className="mt-6 text-[24px] leading-8 font-semibold">Aviso de privacidad</h1>
      <p className="mt-1 text-[14px] text-fg-muted">Última actualización: {ACTUALIZACION}</p>

      <Seccion titulo="Responsable">
        <p>
          Kairo es un proyecto académico de la Universidad Autónoma del Estado de Hidalgo, desarrollado por Braulio Ivan
          Rojo Chávez, quien es responsable del tratamiento de tus datos conforme a la Ley Federal de Protección de Datos
          Personales en Posesión de los Particulares. Para cualquier asunto de privacidad escribe a <Correo />.
        </p>
      </Seccion>

      <Seccion titulo="Qué datos tratamos">
        <ul className="list-disc space-y-1 pl-5">
          <li>Tu correo electrónico y tu contraseña. La contraseña la guarda Supabase Auth cifrada; nadie puede leerla.</li>
          <li>Lo que escribes en Kairo: tareas, notas, fechas, horas y etiquetas.</li>
          <li>Una cookie de sesión, necesaria para mantenerte dentro. No usamos cookies de publicidad ni de analítica.</li>
        </ul>
      </Seccion>

      <Seccion titulo="Para qué los usamos">
        <p>
          Solo para crear y mantener tu cuenta y para guardar y mostrarte tus tareas. No vendemos ni compartimos tus datos,
          y no los usamos para publicidad ni para hacer perfiles.
        </p>
      </Seccion>

      <Seccion titulo="Quién más los procesa">
        <p>
          Dos proveedores, únicamente para que Kairo funcione: Supabase, que aloja la base de datos y la autenticación, y
          Vercel, que aloja el sitio. Sus servidores pueden estar fuera de México.
        </p>
      </Seccion>

      <Seccion titulo="Cuánto tiempo los conservamos">
        <p>
          Mientras tu cuenta exista. Si pides eliminarla, se borran tu cuenta y todas tus tareas y etiquetas. Las copias de
          respaldo se conservan como máximo cuatro semanas y después se destruyen.
        </p>
      </Seccion>

      <Seccion titulo="Tus derechos ARCO">
        <p>
          Puedes acceder a tus datos descargándolos desde Más → Exportar JSON o CSV, y rectificarlos editándolos en la
          aplicación. Para cancelarlos u oponerte a su tratamiento, escribe a <Correo /> desde el correo de tu cuenta.
          Respondemos en un plazo máximo de 20 días hábiles.
        </p>
      </Seccion>

      <Seccion titulo="Cambios a este aviso">
        <p>Si este aviso cambia, publicaremos la nueva versión en esta página con su fecha de actualización.</p>
      </Seccion>

      <Link href="/" className="mt-10 inline-flex h-11 items-center text-[15px] font-medium text-accent">
        Ir a Kairo
      </Link>
    </main>
  );
}
