import { useState, useEffect, useCallback } from "react";
import { Cotizacion, CotizacionResumen, EstadoCotizacion } from "../types/cotizacion/cotizacion.types";
import { Carrito } from "../types/carrito/carrito.types";
import { CotizacionesAPIService } from '../api/cotizaciones.api';
import { useAuth } from '../context/AuthContext';

export function useCotizaciones() {
  const { user } = useAuth();
  const resolvedUserId = user?.id;
  const resolvedUserType = (user?.role.includes('COMERCIANTE') ? 'COMERCIANTE' : 'CLIENTE');

  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [carritoLoading, setCarritoLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const cot = await CotizacionesAPIService.getCotizaciones(resolvedUserId, resolvedUserType, 1, 100, null);
      setCotizaciones(cot);
    } catch (err) {
      setError('Error al conectar con la base de datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [resolvedUserId, resolvedUserType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchCarrito = useCallback(async () => {
    if (resolvedUserType !== 'CLIENTE') return;
    try {
      setCarritoLoading(true);
      const data = await CotizacionesAPIService.getCarrito();
      setCarrito(data);
    } catch (err) {
      console.error('fetchCarrito error:', err);
    } finally {
      setCarritoLoading(false);
    }
  }, [resolvedUserType]);

  useEffect(() => {
    fetchCarrito();
  }, [fetchCarrito]);

  // Helper para calcular subtotal
  const calcularSubtotal = (productos: Cotizacion['productos']) => {
    return productos.reduce((sum, p) => sum + p.precioUnitario * p.cantidad, 0);
  };

  // 1. Obtener listado ligero de cotizaciones para listado simple
  const getCotizacionesResumen = (): CotizacionResumen[] => {
    return cotizaciones.map(cot => {
      // El listado del backend retorna "total" directamente; solo calcular si hay productos cargados
      const total = cot.total ?? calcularSubtotal(cot.productos);
      return {
        id: cot.id,
        comerciante: cot.comerciante,
        cliente: cot.cliente,
        fechaSolicitud: cot.fechaSolicitud,
        fechaVencimiento: cot.fechaVencimiento,
        estado: cot.estado,
        total: total,
        version: cot.version,
        cantidadProductos: cot.productos.length
      };
    });
  };

  // 2. Obtener detalle de cotización desde estado local
  const getCotizacionDetalle = (id: number, version: number): Cotizacion | undefined => {
    return cotizaciones.find(cot => cot.id === id && cot.version === version);
  };

  // 2b. Obtener detalle completo de cotización desde la API (siempre incluye productos/detalles)
  const fetchCotizacionDetalle = useCallback(async (id: number, version: number): Promise<Cotizacion | null> => {
    try {
      const cot = await CotizacionesAPIService.getCotizacionByNumeroVersion(id, version);
      setCotizaciones(prev => {
        const idx = prev.findIndex(c => c.id === id && c.version === version);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = cot;
          return copy;
        }
        return [cot, ...prev];
      });
      return cot;
    } catch (err) {
      console.error('fetchCotizacionDetalle error:', err);
      // fallback al estado local si la petición falla
      return cotizaciones.find(c => c.id === id && c.version === version) ?? null;
    }
  }, [cotizaciones]);

  // 3. Listar versiones de una cotización
  const getVersionesCotizacion = useCallback(async (numero: number, page = 1, len = 10): Promise<Cotizacion[]> => {
    try {
      return await CotizacionesAPIService.getVersionesCotizacion(numero, page, len);
    } catch (err) {
      console.error('getVersionesCotizacion error:', err);
      return [];
    }
  }, []);

  // 4. Resolver cotización (observar o cancelar) — llama a la API y actualiza estado local
  const resolverCotizacion = async (
    original: Cotizacion,
    nuevoEstado: EstadoCotizacion,
    productosEditados: Cotizacion['productos'],
    comentarios: string
  ): Promise<number | false> => {
    let nuevaVersionNum: number;

    if (nuevoEstado === 'OBSERVADA') {
      // Crear versión nueva en BD con precios actualizados por el comerciante
      let resp: { versionCotizacion: number };
      try {
        resp = await CotizacionesAPIService.crearNuevaVersionCotizacion(
          original.id,
          original.observacionesCliente ?? null,
          comentarios,
          calcularSubtotal(productosEditados),
          'OBSERVADA',
          productosEditados.map(p => ({
            idGenerico: p.idGenerico ?? p.numeroLinea,
            cantidad: p.cantidad,
            precio: p.precioUnitario,
            idTamano: p.idTamano ?? null,
            idColor: p.idColor ?? null,
            idMaterial: p.idMaterial ?? null,
            idPersonalizacion: p.idPersonalizacion ?? null,
          }))
        );
      } catch (err) {
        console.error('resolverCotizacion: error al crear nueva versión', err);
        return false;
      }
      nuevaVersionNum = resp.versionCotizacion;

      if (resolvedUserId) {
        try {
          await CotizacionesAPIService.asignarComerciante(original.id, nuevaVersionNum, resolvedUserId);
        } catch (err) {
          console.error('resolverCotizacion: error al asignar comerciante', err);
        }
      }
    } else {
      // CANCELADA — actualizar estado en la versión actual sin crear nueva versión
      try {
        await CotizacionesAPIService.CotizacionEstado({
          ...original,
          estado: nuevoEstado,
          comentariosComerciante: comentarios || original.comentariosComerciante,
        });
      } catch (err) {
        console.error('resolverCotizacion: error al actualizar estado en API', err);
        return false;
      }
      nuevaVersionNum = original.version;
    }

    const nuevaCotizacion: Cotizacion = {
      ...original,
      version: nuevaVersionNum,
      estado: nuevoEstado,
      comentariosComerciante: nuevoEstado === 'OBSERVADA' ? comentarios : original.comentariosComerciante,
      productos: productosEditados.map(p => ({ ...p, versionCotizacion: nuevaVersionNum }))
    };

    setCotizaciones(prev => [nuevaCotizacion, ...prev]);
    return nuevaVersionNum;
  };

  // 5. Asignar comerciante a cotización
  const asignarComerciante = useCallback(async (
    numeroCotizacion: number,
    numeroVersion: number,
    idComerciante: number
  ): Promise<boolean> => {
    try {
      await CotizacionesAPIService.asignarComerciante(numeroCotizacion, numeroVersion, idComerciante);
      return true;
    } catch (err) {
      console.error('asignarComerciante error:', err);
      return false;
    }
  }, []);

  // 6. Helper de días restantes
  const calcularDiasRestantes = (fechaVencimiento: string): number => {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diferenciaMs = vencimiento.getTime() - hoy.getTime();
    return Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
  };

  /* --- CARRITO --- */

  // 7. Agregar item al carrito
  const addItemCarrito = useCallback(async (
    idGenerico: number,
    cantidad: number,
    idTamano: number,
    idColor: number,
    idMaterial: number,
    idPersonalizacion: number,
    urlDiseno?: string
  ): Promise<boolean> => {
    try {
      await CotizacionesAPIService.addItemCarrito(idGenerico, cantidad, idTamano, idColor, idMaterial, idPersonalizacion, urlDiseno);
      await fetchCarrito();
      return true;
    } catch (err) {
      console.error('addItemCarrito error:', err);
      return false;
    }
  }, [fetchCarrito]);

  // 8. Actualizar cantidad de un item del carrito
  const updateItemCarrito = useCallback(async (idGenerico: number, cantidad: number): Promise<boolean> => {
    try {
      await CotizacionesAPIService.updateItemCarrito(idGenerico, cantidad);
      await fetchCarrito();
      return true;
    } catch (err) {
      console.error('updateItemCarrito error:', err);
      return false;
    }
  }, [fetchCarrito]);

  // 9. Eliminar un item del carrito
  const removeItemCarrito = useCallback(async (idGenerico: number): Promise<boolean> => {
    try {
      await CotizacionesAPIService.removeItemCarrito(idGenerico);
      setCarrito(prev => prev ? { ...prev, items: prev.items.filter(i => i.productoId !== idGenerico) } : null);
      return true;
    } catch (err) {
      console.error('removeItemCarrito error:', err);
      return false;
    }
  }, []);

  // 10. Vaciar el carrito
  const clearCarrito = useCallback(async (): Promise<boolean> => {
    try {
      await CotizacionesAPIService.clearCarrito();
      setCarrito(prev => prev ? { ...prev, items: [] } : null);
      return true;
    } catch (err) {
      console.error('clearCarrito error:', err);
      return false;
    }
  }, []);

  return {
    cotizaciones,
    loading,
    error,
    getCotizacionesResumen,
    getCotizacionDetalle,
    fetchCotizacionDetalle,
    calcularSubtotal,
    calcularDiasRestantes,
    resolverCotizacion,
    getVersionesCotizacion,
    asignarComerciante,
    carrito,
    carritoLoading,
    addItemCarrito,
    updateItemCarrito,
    removeItemCarrito,
    clearCarrito
  };
}
