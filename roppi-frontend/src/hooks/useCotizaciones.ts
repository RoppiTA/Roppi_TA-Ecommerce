import { useState, useEffect, useCallback } from "react";
import { Cotizacion, CotizacionResumen, EstadoCotizacion } from "../types/cotizacion/cotizacion.types";
import { CotizacionesAPIService } from '../api/cotizaciones.api';
import { useAuth } from '../context/AuthContext';

export function useCotizaciones(userId?: number, userType?: "CLIENTE" | "COMERCIANTE") {
  const { user } = useAuth();
  const resolvedUserId = userId ?? user.id;
  const resolvedUserType = userType ?? (user.role.includes('COMERCIANTE') ? 'COMERCIANTE' : 'CLIENTE');

  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const cot = await CotizacionesAPIService.getCotizaciones(resolvedUserId, resolvedUserType);
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
  

  // Helper para calcular subtotal
  const calcularSubtotal = (productos: Cotizacion['productos']) => {
    return productos.reduce((sum, p) => sum + p.precioUnitario * p.cantidad, 0);
  };

  // 1. Obtener listado ligero de cotizaciones para listado simple
  const getCotizacionesResumen = (): CotizacionResumen[] => {
    return cotizaciones.map(cot => {
      const subtotal = calcularSubtotal(cot.productos);
      const total = subtotal * 1.18; // Cálculo con IGV incluido
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

  // 2. Obtener detalle completo de un cotización específica por ID y versión
  const getCotizacionDetalle = (id: number, version: number): Cotizacion | undefined => {
    return cotizaciones.find(cot => cot.id === id && cot.version === version);
  };

  // 3. Resolver cotización (aceptar, observar, cancelar)
  const resolverCotizacion = (
    id: number, 
    versionActual: number, 
    nuevoEstado: EstadoCotizacion, 
    productosEditados: Cotizacion['productos'], 
    comentarios: string
  ) => {
    const original = cotizaciones.find(c => c.id === id && c.version === versionActual);
    if (!original) return false;

    const nuevaCotizacion: Cotizacion = {
      ...original,
      version: versionActual + 1,
      estado: nuevoEstado,
      comentariosComerciante: comentarios,
      precioAnterior: calcularSubtotal(original.productos) * 1.18,
      productos: productosEditados.map(p => ({ ...p, versionCotizacion: versionActual + 1 }))
    };

    setCotizaciones(prev => [nuevaCotizacion, ...prev]);
    return nuevaCotizacion.version;
  };

  // 4. Helper de Días Restantes
  const calcularDiasRestantes = (fechaVencimiento: string): number => {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diferenciaMs = vencimiento.getTime() - hoy.getTime();
    return Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
  };

  return {
    getCotizacionesResumen,
    getCotizacionDetalle,
    calcularSubtotal,
    calcularDiasRestantes,
    resolverCotizacion
  };
}