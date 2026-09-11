import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { hojaDeTokens } from "@/lib/diseno/css-tokens";
import { paletaClara, paletaOscura } from "@/lib/diseno/tokens";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-kairo", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Kairo", template: "%s · Kairo" },
  description: "Un gestor de tareas pequeño y preciso.",
  applicationName: "Kairo",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // El teclado virtual redimensiona el contenido en lugar de taparlo.
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: paletaClara.background },
    { media: "(prefers-color-scheme: dark)", color: paletaOscura.background },
  ],
};

export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <head>
        <style id="kairo-tokens" dangerouslySetInnerHTML={{ __html: hojaDeTokens() }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
