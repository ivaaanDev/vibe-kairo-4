import Link from "next/link";
import { KairoMark } from "./_componentes/kairo-mark";

export default function NoEncontrada() {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-[360px]">
        <KairoMark tamano={28} className="text-fg" />
        <h1 className="mt-6 text-[20px] leading-7 font-semibold">Esta página no existe.</h1>
        <Link href="/" className="mt-4 inline-flex h-11 items-center text-[15px] font-medium text-accent">
          Ir a tus tareas
        </Link>
      </div>
    </main>
  );
}
