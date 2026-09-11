/** Se vuelve a montar al cambiar de vista: un fundido corto en lugar de un salto. */
export default function PlantillaVista({ children }: { children: React.ReactNode }) {
  return <div className="animate-aparecer">{children}</div>;
}
