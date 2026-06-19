import { useState, useMemo } from "react";
import { Cotizacion, CotizacionResumen } from "../types/cotizacion/cotizacion.types";

// Mock Data (Fechas actualizadas para coincidir con pruebas recientes)
const MOCK_COTIZACIONES: Cotizacion[] = [
  {
    id: 101, // ID numérico autogenerado
    comerciante: "Carlos Mendoza",
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
    comerciante: "Estudio Creativo SAC",
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
  }
];

export function useCotizaciones() {
  const [cotizaciones] = useState<Cotizacion[]>(MOCK_COTIZACIONES);

  // Helper para calcular subtotal
  const calcularSubtotal = (productos: Cotizacion['productos']) => {
    return productos.reduce((sum, p) => sum + p.precioUnitario * p.cantidad, 0);
  };

  // 1. Obtener listado ligero
  const getCotizacionesResumen = (): CotizacionResumen[] => {
    return cotizaciones.map(cot => {
      const subtotal = calcularSubtotal(cot.productos);
      const total = subtotal * 1.18; // Cálculo con IGV incluido
      return {
        id: cot.id,
        comerciante: cot.comerciante,
        fechaSolicitud: cot.fechaSolicitud,
        fechaVencimiento: cot.fechaVencimiento,
        estado: cot.estado,
        total,
        version: cot.version,
        cantidadProductos: cot.productos.length
      };
    });
  };

  // 2. Obtener detalle completo
  const getCotizacionDetalle = (id: number, version: number): Cotizacion | undefined => {
    return cotizaciones.find(cot => cot.id === id && cot.version === version);
  };

  // 3. Helper de Días Restantes
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
    calcularDiasRestantes
  };
}