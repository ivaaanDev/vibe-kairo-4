"use client";

import { useRouter } from "next/navigation";
import { createContext, use, useCallback, useMemo, useRef, useState } from "react";
import { crearClienteKairo, type ErrorCliente } from "@/lib/cliente/api-kairo";
import { generarId } from "@/lib/cliente/generar-id";
import { crearEtiqueta as crearEtiquetaDominio, esColorEtiqueta, validarNombreEtiqueta } from "@/lib/dominio/etiquetas";
import { aplicarCambios, crearTarea as crearTareaDominio } from "@/lib/dominio/validacion-tarea";
import { reductorKairo, type AccionKairo, type EstadoKairo } from "@/lib/estado/reductor-kairo";
import type { CambiosEtiqueta, Etiqueta } from "@/lib/tipos/etiqueta";
import { exito, fallo, type Resultado } from "@/lib/tipos/resultado";
import type { CambiosTarea, Tarea } from "@/lib/tipos/tarea";
import type { Usuario } from "@/lib/tipos/usuario";

/*
 * Estado de la aplicación en el cliente. Todas las mutaciones son optimistas:
 * se validan con el mismo dominio que usa el servidor, se reflejan al instante
 * y se envían en una cola por entidad para que el orden de las peticiones se respete.
 * Si una petición falla, el cambio se revierte y se ofrece reintentar.
 */

export type EstadoGuardado = "inactivo" | "guardando" | "guardado" | "error";

export interface Aviso {
  id: number;
  mensaje: string;
  reintentar?: () => void;
}

interface ValorKairo {
  usuario: Usuario;
  tareas: Tarea[];
  etiquetas: Etiqueta[];
  etiquetasPorId: ReadonlyMap<string, Etiqueta>;
  filtro: string[];
  establecerFiltro: (ids: string[]) => void;
  crearTarea: (titulo: string) => Resultado<Tarea>;
  actualizarTarea: (id: string, cambios: CambiosTarea) => Resultado<Tarea>;
  eliminarTarea: (id: string) => void;
  crearEtiqueta: (nombre: string) => Resultado<Etiqueta>;
  actualizarEtiqueta: (id: string, cambios: CambiosEtiqueta) => Resultado<Etiqueta>;
  eliminarEtiqueta: (id: string) => void;
  guardado: EstadoGuardado;
  /** Aumenta con cada guardado completado; permite reanimar el indicador. */
  guardadoMarca: number;
  aviso: Aviso | null;
  descartarAviso: () => void;
}

const ContextoKairo = createContext<ValorKairo | null>(null);
const cliente = crearClienteKairo();

export function ProveedorKairo({
  usuario,
  inicial,
  children,
}: {
  usuario: Usuario;
  inicial: EstadoKairo;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [estado, setEstado] = useState(inicial);
  const estadoRef = useRef(inicial);
  const [filtro, setFiltro] = useState<string[]>([]);
  const filtroRef = useRef<string[]>([]);
  const [guardado, setGuardado] = useState<EstadoGuardado>("inactivo");
  const [guardadoMarca, setGuardadoMarca] = useState(0);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  const colas = useRef(new Map<string, Promise<void>>());
  const pendientesPorClave = useRef(new Map<string, number>());
  const enVuelo = useRef(0);

  /** El ref se actualiza de forma síncrona: acciones seguidas ven siempre el último estado. */
  const despachar = useCallback((accion: AccionKairo) => {
    estadoRef.current = reductorKairo(estadoRef.current, accion);
    setEstado(estadoRef.current);
  }, []);

  const notificarFallo = useCallback(
    (error: ErrorCliente, contexto: string, reintentar?: () => void) => {
      if (error.estado === 401) {
        router.replace("/acceso");
        return;
      }
      const mensaje = error.estado === null || error.codigo === "error-servidor" ? `${contexto} ${error.mensaje}` : error.mensaje;
      setAviso({ id: Date.now(), mensaje, reintentar });
    },
    [router],
  );

  /**
   * Encola trabajo remoto para una entidad. `trabajo` recibe si es la última operación
   * pendiente: solo entonces la respuesta del servidor sustituye al estado optimista.
   */
  const encolar = useCallback(
    (clave: string, trabajo: (esUltima: () => boolean) => Promise<boolean>, dependencias: readonly string[] = []) => {
    pendientesPorClave.current.set(clave, (pendientesPorClave.current.get(clave) ?? 0) + 1);
    enVuelo.current += 1;
    setGuardado("guardando");

    // Espera también a las entidades de las que depende (p. ej. una etiqueta aún no creada en el servidor).
    const previas = [clave, ...dependencias].map((id) => colas.current.get(id) ?? Promise.resolve());
    const siguiente = Promise.all(previas).then(async () => {
      let exitosa = false;
      try {
        exitosa = await trabajo(() => pendientesPorClave.current.get(clave) === 1);
      } finally {
        const restantes = (pendientesPorClave.current.get(clave) ?? 1) - 1;
        if (restantes === 0) pendientesPorClave.current.delete(clave);
        else pendientesPorClave.current.set(clave, restantes);
        enVuelo.current -= 1;
        if (!exitosa) setGuardado("error");
        else if (enVuelo.current === 0) {
          setGuardado("guardado");
          setGuardadoMarca((marca) => marca + 1);
        }
      }
    });
    colas.current.set(clave, siguiente);
    void siguiente.finally(() => {
      if (colas.current.get(clave) === siguiente) colas.current.delete(clave);
    });
    },
    [],
  );

  // ─── Tareas ───────────────────────────────────────────────────────────────

  const persistirCreacion = useCallback(
    function persistir(tarea: Tarea) {
      encolar(tarea.id, async (esUltima) => {
        const creada = await cliente.crearTarea({ id: tarea.id, titulo: tarea.titulo });
        if (!creada.ok) {
          despachar({ tipo: "tarea-eliminada", id: tarea.id });
          notificarFallo(creada.error, `No se pudo crear «${tarea.titulo}».`, () => {
            despachar({ tipo: "tarea-agregada", tarea });
            persistir(tarea);
          });
          return false;
        }
        let final = creada.valor;
        if (tarea.etiquetaIds.length > 0) {
          const conEtiquetas = await cliente.actualizarTarea(tarea.id, { etiquetaIds: tarea.etiquetaIds });
          if (conEtiquetas.ok) final = conEtiquetas.valor;
        }
        if (esUltima()) despachar({ tipo: "tarea-reemplazada", tarea: final });
        return true;
      }, tarea.etiquetaIds);
    },
    [despachar, encolar, notificarFallo],
  );

  const crearTarea = useCallback(
    (titulo: string): Resultado<Tarea> => {
      const creada = crearTareaDominio({ id: generarId(), titulo }, new Date().toISOString());
      if (!creada.ok) return creada;
      // Con un filtro activo, la tarea nueva hereda sus etiquetas: así sigue visible donde se creó.
      const existentes = new Set(estadoRef.current.etiquetas.map((etiqueta) => etiqueta.id));
      const tarea: Tarea = { ...creada.valor, etiquetaIds: filtroRef.current.filter((id) => existentes.has(id)) };
      despachar({ tipo: "tarea-agregada", tarea });
      persistirCreacion(tarea);
      return exito(tarea);
    },
    [despachar, persistirCreacion],
  );

  const actualizarTarea = useCallback(
    (id: string, cambios: CambiosTarea): Resultado<Tarea> => {
      const anterior = estadoRef.current.tareas.find((tarea) => tarea.id === id);
      if (!anterior) return fallo({ codigo: "no-encontrado", mensaje: "La tarea ya no existe." });
      const siguiente = aplicarCambios(anterior, cambios, {
        etiquetasExistentes: new Set(estadoRef.current.etiquetas.map((etiqueta) => etiqueta.id)),
        instante: new Date().toISOString(),
      });
      if (!siguiente.ok) return siguiente;
      despachar({ tipo: "tarea-reemplazada", tarea: siguiente.valor });

      const enviar = () =>
        encolar(id, async (esUltima) => {
          const respuesta = await cliente.actualizarTarea(id, cambios);
          if (!respuesta.ok) {
            despachar({ tipo: "tarea-reemplazada", tarea: anterior });
            notificarFallo(respuesta.error, "No se guardó el cambio.", () => {
              const reaplicada = aplicarCambios(anterior, cambios, {
                etiquetasExistentes: new Set(estadoRef.current.etiquetas.map((etiqueta) => etiqueta.id)),
                instante: new Date().toISOString(),
              });
              if (reaplicada.ok) despachar({ tipo: "tarea-reemplazada", tarea: reaplicada.valor });
              enviar();
            });
            return false;
          }
          if (esUltima()) despachar({ tipo: "tarea-reemplazada", tarea: respuesta.valor });
          return true;
        }, cambios.etiquetaIds ?? []);
      enviar();
      return siguiente;
    },
    [despachar, encolar, notificarFallo],
  );

  const eliminarTarea = useCallback(
    (id: string) => {
      const tarea = estadoRef.current.tareas.find((candidata) => candidata.id === id);
      if (!tarea) return;
      despachar({ tipo: "tarea-eliminada", id });
      const enviar = () =>
        encolar(id, async () => {
          const respuesta = await cliente.eliminarTarea(id);
          if (!respuesta.ok && respuesta.error.estado !== 404) {
            despachar({ tipo: "tarea-agregada", tarea });
            notificarFallo(respuesta.error, `No se pudo eliminar «${tarea.titulo}».`, () => {
              despachar({ tipo: "tarea-eliminada", id });
              enviar();
            });
            return false;
          }
          return true;
        });
      enviar();
    },
    [despachar, encolar, notificarFallo],
  );

  // ─── Etiquetas ────────────────────────────────────────────────────────────

  const crearEtiqueta = useCallback(
    (nombre: string): Resultado<Etiqueta> => {
      const creada = crearEtiquetaDominio({ id: generarId(), nombre }, estadoRef.current.etiquetas, new Date().toISOString());
      if (!creada.ok) return creada;
      const etiqueta = creada.valor;
      despachar({ tipo: "etiqueta-agregada", etiqueta });
      const enviar = () =>
        encolar(etiqueta.id, async (esUltima) => {
          const respuesta = await cliente.crearEtiqueta({ id: etiqueta.id, nombre: etiqueta.nombre, color: etiqueta.color });
          if (!respuesta.ok) {
            despachar({ tipo: "etiqueta-eliminada", id: etiqueta.id });
            notificarFallo(respuesta.error, `No se pudo crear la etiqueta «${etiqueta.nombre}».`, () => {
              despachar({ tipo: "etiqueta-agregada", etiqueta });
              enviar();
            });
            return false;
          }
          if (esUltima()) despachar({ tipo: "etiqueta-reemplazada", etiqueta: respuesta.valor });
          return true;
        });
      enviar();
      return exito(etiqueta);
    },
    [despachar, encolar, notificarFallo],
  );

  const actualizarEtiqueta = useCallback(
    (id: string, cambios: CambiosEtiqueta): Resultado<Etiqueta> => {
      const anterior = estadoRef.current.etiquetas.find((etiqueta) => etiqueta.id === id);
      if (!anterior) return fallo({ codigo: "no-encontrado", mensaje: "La etiqueta ya no existe." });
      const siguiente: Etiqueta = { ...anterior };
      if (cambios.nombre !== undefined) {
        const nombre = validarNombreEtiqueta(cambios.nombre, estadoRef.current.etiquetas, id);
        if (!nombre.ok) return nombre;
        siguiente.nombre = nombre.valor;
      }
      if (cambios.color !== undefined) {
        if (!esColorEtiqueta(cambios.color)) return fallo({ codigo: "color-invalido", mensaje: "El color elegido no está disponible." });
        siguiente.color = cambios.color;
      }
      despachar({ tipo: "etiqueta-reemplazada", etiqueta: siguiente });
      const enviar = () =>
        encolar(id, async (esUltima) => {
          const respuesta = await cliente.actualizarEtiqueta(id, cambios);
          if (!respuesta.ok) {
            despachar({ tipo: "etiqueta-reemplazada", etiqueta: anterior });
            notificarFallo(respuesta.error, "No se guardó el cambio de la etiqueta.", () => {
              despachar({ tipo: "etiqueta-reemplazada", etiqueta: siguiente });
              enviar();
            });
            return false;
          }
          if (esUltima()) despachar({ tipo: "etiqueta-reemplazada", etiqueta: respuesta.valor });
          return true;
        });
      enviar();
      return exito(siguiente);
    },
    [despachar, encolar, notificarFallo],
  );

  const eliminarEtiqueta = useCallback(
    (id: string) => {
      const etiqueta = estadoRef.current.etiquetas.find((candidata) => candidata.id === id);
      if (!etiqueta) return;
      const vinculadas = estadoRef.current.tareas.filter((tarea) => tarea.etiquetaIds.includes(id)).map((tarea) => tarea.id);
      despachar({ tipo: "etiqueta-eliminada", id });
      filtroRef.current = filtroRef.current.filter((filtrada) => filtrada !== id);
      setFiltro(filtroRef.current);

      const restaurar = () => {
        despachar({ tipo: "etiqueta-agregada", etiqueta });
        for (const tareaId of vinculadas) {
          const tarea = estadoRef.current.tareas.find((candidata) => candidata.id === tareaId);
          if (tarea && !tarea.etiquetaIds.includes(id)) {
            despachar({ tipo: "tarea-reemplazada", tarea: { ...tarea, etiquetaIds: [...tarea.etiquetaIds, id] } });
          }
        }
      };
      const enviar = () =>
        encolar(id, async () => {
          const respuesta = await cliente.eliminarEtiqueta(id);
          if (!respuesta.ok && respuesta.error.estado !== 404) {
            restaurar();
            notificarFallo(respuesta.error, `No se pudo eliminar la etiqueta «${etiqueta.nombre}».`, () => {
              despachar({ tipo: "etiqueta-eliminada", id });
              enviar();
            });
            return false;
          }
          return true;
        });
      enviar();
    },
    [despachar, encolar, notificarFallo],
  );

  const establecerFiltro = useCallback((ids: string[]) => {
    filtroRef.current = ids;
    setFiltro(ids);
  }, []);

  const descartarAviso = useCallback(() => setAviso(null), []);

  const etiquetasPorId = useMemo(() => new Map(estado.etiquetas.map((etiqueta) => [etiqueta.id, etiqueta])), [estado.etiquetas]);

  const valor = useMemo<ValorKairo>(
    () => ({
      usuario,
      tareas: estado.tareas,
      etiquetas: estado.etiquetas,
      etiquetasPorId,
      filtro,
      establecerFiltro,
      crearTarea,
      actualizarTarea,
      eliminarTarea,
      crearEtiqueta,
      actualizarEtiqueta,
      eliminarEtiqueta,
      guardado,
      guardadoMarca,
      aviso,
      descartarAviso,
    }),
    [
      usuario,
      estado,
      etiquetasPorId,
      filtro,
      establecerFiltro,
      crearTarea,
      actualizarTarea,
      eliminarTarea,
      crearEtiqueta,
      actualizarEtiqueta,
      eliminarEtiqueta,
      guardado,
      guardadoMarca,
      aviso,
      descartarAviso,
    ],
  );

  return <ContextoKairo value={valor}>{children}</ContextoKairo>;
}

export function useKairo(): ValorKairo {
  const valor = use(ContextoKairo);
  if (!valor) throw new Error("useKairo debe usarse dentro de ProveedorKairo");
  return valor;
}

export { cliente as clienteKairo };
