import { apiClient } from "./apiCliente";
import { LineaProducto, Cotizacion, CreateCotizacionDTO } from "../types/cotizacion/cotizacion.types";

const mapearACotizacionFrontend = (c: any): Cotizacion => ({
    id: c.id,
    comerciante: c.comerciante,
    cliente: c.cliente,
    fechaSolicitud: c.fechaSolicitud,
    fechaVencimiento: c.fechaVencimiento,
    version: c.version,
    estado: c.estado,
    productos: c.productos.map(mapearALineaProducto),
    observacionesCliente: c.observacionesCliente,
    comentariosComerciante: c.comentariosComerciante,
    motivoCancelacion: c.motivoCancelacion,
    precioAnterior: c.precioAnterior
});

const mapearALineaProducto = (lp: any): LineaProducto => ({
    numeroLinea: lp.numeroLinea,
    idCotizacion: lp.idCotizacion,
    versionCotizacion: lp.versionCotizacion,
    nombre: lp.nombre,
    atributos: {
        talla: lp.atributos.talla,
        material: lp.atributos.material,
        personalizacion: lp.atributos.personalizacion,  
        color: lp.atributos.color
    },
    precioUnitario: lp.precioUnitario,
    cantidad: lp.cantidad
});

const mapearACotizacionBackend = (cotizacion: CreateCotizacionDTO): any => ({
    comerciante: cotizacion.comerciante,
    cliente: cotizacion.cliente,
    fechaSolicitud: cotizacion.fechaSolicitud,
    fechaVencimiento: cotizacion.fechaVencimiento,
    version: cotizacion.version,
    estado: cotizacion.estado,
    productos: cotizacion.productos.map(mapearALineaProducto),
    observacionesCliente: cotizacion.observacionesCliente,
    comentariosComerciante: cotizacion.comentariosComerciante,
    motivoCancelacion: cotizacion.motivoCancelacion,
    precioAnterior: cotizacion.precioAnterior
});


export const CotizacionesAPIService = {
    /* --- CRUD DE COTIZACIONES --- */

    // 1. OBTENER TODAS LAS COTIZACIONES
    getCotizaciones: async (id: number, tipo: "CLIENTE" | "COMERCIANTE"): Promise<Cotizacion[]> => {
        const response = await apiClient.get<{ exito: boolean; datos: any[] }>(`/cotizaciones?id=${id}&tipo=${tipo}`);
        if (!response.data || !response.data.datos) return [];
        return response.data.datos.map(mapearACotizacionFrontend);
    },

    // 2. OBTENER UNA SOLA COTIZACION POR ID
    getCotizacionById: async (id: number): Promise<Cotizacion> => {
        const response = await apiClient.get<{ exito: boolean; datos: any }>(`/cotizaciones/${id}`);
        if (!response.data || !response.data.datos) {
            throw new Error(`No se encontraron datos para la cotización con ID ${id}`);
        }
        return mapearACotizacionFrontend(response.data.datos);
    }
};