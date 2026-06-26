import { apiClient } from "./apiCliente";
import { LineaProducto, Cotizacion, CreateCotizacionDTO, EstadoCotizacion } from "../types/cotizacion/cotizacion.types";

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

    // 1. OBTENER TODAS LAS COTIZACIONES SEGÚN TIPO DE USUARIO Y REGISTROS ACTIVOS/INACTIVOS
    getCotizaciones: async (id: number, tipo: "CLIENTE" | "COMERCIANTE",page: number,items_per_page:number, active: any): Promise<Cotizacion[]> => {
        const endpoint = '/cotizaciones/solicitudes/' + (tipo === "CLIENTE" ? `cliente/${id}` : `comerciante/`) ;
        const params = `page=${page}&len=${items_per_page}` + (active != null ? `&active=${active}` : '');
        const response = await apiClient.get<{ exito: boolean; datos: any[] }>(`${endpoint}?${params}`);
        if (!response.data || !response.data.datos) return [];
        return response.data.datos.map(mapearACotizacionFrontend);
    },

    // 2. OBTENER UNA SOLA COTIZACION POR ID Y VERSIÓN
    getCotizacionById: async (id: number, version: number,page: number,items_per_page:number): Promise<Cotizacion> => {
        const endpoint = `/cotizaciones/solicitudes/${id}` + (version != null ? `/${version}` : '');
        const params = `page=${page}&len=${items_per_page}`;
        const response = await apiClient.get<{ exito: boolean; datos: any }>(`${endpoint}?${params}`);
        if (!response.data || !response.data.datos) {
            throw new Error(`No se encontraron datos para la cotización con ID ${id}`);
        }
        return mapearACotizacionFrontend(response.data.datos);
    },

    // 3. CREAR NUEVA VERSION DE COTIZACIÓN
    createCotizacion: async (cotizacion: CreateCotizacionDTO): Promise<Cotizacion> => {
        const response = await apiClient.put<{ exito: boolean; datos: any }>('/cotizaciones/solicitudes/crear', mapearACotizacionBackend(cotizacion));
        if (!response.data || !response.data.datos) {
            throw new Error(`Error al crear la cotización`);
        }
        return mapearACotizacionFrontend(response.data.datos);
    },

    // 4. ACTUALIZAR ESTADO DE COTIZACION
    updateCotizacionEstado: async (cotizacion: Cotizacion): Promise<Cotizacion> => {
        const { id, version, estado } = cotizacion;
        const response = await apiClient.post<{ exito: boolean; datos: any }>(`/solicitudes/update/estado`, { id, version, estado });
        if (!response.data || !response.data.datos) {
            throw new Error(`Error al actualizar el estado de la cotización con ID ${cotizacion.id} y versión ${cotizacion.version}`);
        }
        cotizacion.estado = response.data.datos.estado;
        return cotizacion;
    }
};