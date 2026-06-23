import { useState, useEffect, useCallback } from "react";
import { Cotizacion, CotizacionResumen, EstadoCotizacion } from "../types/cotizacion/cotizacion.types";
import { CotizacionesAPIService } from '../api/cotizaciones.api';

// Mock Data (Fechas actualizadas para coincidir con pruebas recientes)
const MOCK_COTIZACIONES: Cotizacion[] = [
  {
    id: 101, // ID numérico autogenerado
    comerciante: "Carlos Mendoza",
    cliente: "Empresa Textil S.A.",
    fechaSolicitud: "2026-06-15",
    fechaVencimiento: "2026-06-25",
    version: 3,
    estado: "Observado",
    precioAnterior: 1800.0, // Caso solicitado: precio previo al cambio
    productos: [
      {
        idCotizacion: 101,
        versionCotizacion: 3,
        numeroLinea: 1,
        nombre: "Polo Clásico Premium",
        atributos: { talla: "M", material: "Algodón 100%", personalizacion: "Serigrafía", color: "Blanco Hueso" },
        precioUnitario: 48.0, 
        cantidad: 20,
      },
      {
        idCotizacion: 101,
        versionCotizacion: 3,
        numeroLinea: 2,
        nombre: "Camiseta Oversize Urbana",
        atributos: { talla: "L", material: "Algodón/Poliéster", personalizacion: "Sublimación", color: "Negro" },
        precioUnitario: 52.5,
        cantidad: 15,
      },
    ],
    observacionesCliente: "Necesito que los colores sean exactos.",
    comentariosComerciante: "El color 'Blanco Hueso' tiene un recargo de S/ 3.00 por prenda. Espero tu confirmación para proceder con el pedido.",
  },
  {
    id: 102,
    comerciante: "Ana Torres",
    cliente: "Corporación Textil S.A.",
    fechaSolicitud: "2026-06-10",
    fechaVencimiento: "2026-06-20",
    version: 1,
    estado: "Aceptado",
    productos: [
      {
        idCotizacion: 102,
        versionCotizacion: 1,
        numeroLinea: 1,
        nombre: "Polo Deportivo Dri-Fit",
        atributos: { talla: "S", material: "Poliéster 100%", personalizacion: "Sublimación", color: "Rojo" },
        precioUnitario: 55.0,
        cantidad: 30,
      },
    ],
    comentariosComerciante: "Diseño y presupuesto aprobados, iniciamos producción programada.",
  },
  {
    id: 103,
    comerciante: "Carlos Mendoza",
    cliente: "Corporación Textil S.A.",
    fechaSolicitud: "2026-06-01",
    fechaVencimiento: "2026-06-05",
    version: 2,
    estado: "Cancelado",
    productos: [
      {
        idCotizacion: 103,
        versionCotizacion: 2,
        numeroLinea: 1,
        nombre: "Gorra Trucker Personalizada",
        atributos: { talla: "Estándar", material: "Malla/Poliéster", personalizacion: "Bordado", color: "Azul Marino" },
        precioUnitario: 25.0,
        cantidad: 50,
      },
    ],
    motivoCancelacion: "El cliente solicitó un descuento adicional del 15% que no era viable por los costos de los materiales actuales.",
  },
  {
    id: 104,
    comerciante: "Carlos Mendoza",
    cliente: "Corporación Textil S.A.",
    fechaSolicitud: "2026-06-22",
    fechaVencimiento: "2026-06-29",
    version: 1,
    estado: "Solicitado",
    productos: [
      { 
        idCotizacion: 104, 
        versionCotizacion: 1, 
        numeroLinea: 1, 
        nombre: "Polo Corporativo Algodón", 
        atributos: { talla: "L", material: "Pima 50/50", personalizacion: "Bordado Pecho", color: "Azul" }, 
        precioUnitario: 10.0, 
        cantidad: 100 },
      { idCotizacion: 104, 
        versionCotizacion: 1, 
        numeroLinea: 2, 
        nombre: "Gorra Publicitaria", 
        atributos: { talla: "Estándar", material: "Dril", personalizacion: "Estampado", color: "Blanco" }, 
        precioUnitario: 11.0, 
        cantidad: 150 }
    ],
    observacionesCliente: "Por favor cotizar con el hilo de la mejor calidad posible."
  }
];

export function useCotizaciones(userId: number, userType: "CLIENTE" | "COMERCIANTE") {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>(MOCK_COTIZACIONES);
  //const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  //Función para cargar todos los datos necesarios
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const cot = await CotizacionesAPIService.getCotizaciones(userId, userType);
      setCotizaciones(cot);
    } catch (err) {
      setError('Error al conectar con la base de datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Se ejecuta una vez al montar el componente para cargar los datos iniciales
  //useEffect(() => {
  //  fetchData();
  //}, [fetchData]);
  

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