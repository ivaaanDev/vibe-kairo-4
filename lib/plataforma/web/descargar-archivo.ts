/**
 * Entrega un archivo al usuario en el navegador. En React Native su equivalente
 * escribiría el archivo con expo-file-system y abriría la hoja de compartir.
 */
export function descargarArchivo(contenido: Blob, nombre: string): void {
  const url = URL.createObjectURL(contenido);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  enlace.rel = "noopener";
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  // Safari necesita que la URL siga viva un instante tras el clic.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
