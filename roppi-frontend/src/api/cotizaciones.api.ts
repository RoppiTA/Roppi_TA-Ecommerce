import { apiClient } from "./apiCliente";
import { LineaProducto, Cotizacion, CreateCotizacionDTO, EstadoCotizacion } from "../types/cotizacion/cotizacion.types";
import { Carrito, LineaCarrito } from "../types/carrito/carrito.types";

const mapearACotizacionFrontend = (c: any): Cotizacion => ({
    id: c.numero_cotizacion ?? c.id,
    version: c.version_cotizacion ?? c.version,
    estado: c.estado,
    comerciante: c.comerciante,
    // listado comerciante retorna "nombre" (u.NOMBRE); detalle retorna "cliente_nombre"
    cliente: c.cliente_nombre ?? c.nombre ?? c.cliente,
    fechaSolicitud: c.fecha_creacion ?? c.fechaSolicitud,
    fechaVencimiento: c.fecha_limite ?? c.fechaVencimiento,
    // el endpoint de detalle retorna "detalles", el de listado no retorna productos
    productos: (c.detalles ?? c.productos ?? []).map(mapearALineaProducto),
    observacionesCliente: c.comentarios_cliente ?? c.observacionesCliente,
    comentariosComerciante: c.comentarios_comerciante ?? c.comentariosComerciante,
    motivoCancelacion: c.motivo_cancelacion ?? c.motivoCancelacion,
    precioAnterior: c.precio_anterior ?? c.precioAnterior,
    total: c.total != null ? Number(c.total) : undefined
});

const mapearALineaProducto = (lp: any): LineaProducto => ({
    // detalles_cotizacion no tiene numero_linea; se usa id_generico como identificador
    numeroLinea: lp.numero_linea ?? lp.id_generico ?? lp.numeroLinea,
    idCotizacion: lp.numero_cotizacion ?? lp.id_cotizacion ?? lp.idCotizacion,
    versionCotizacion: lp.version_cotizacion ?? lp.versionCotizacion,
    nombre: lp.generico_nombre ?? lp.nombre,
    atributos: {
        talla: lp.atributos?.talla ?? lp.tamano_nombre ?? '',
        material: lp.atributos?.material ?? lp.material_nombre ?? '',
        personalizacion: lp.atributos?.personalizacion ?? lp.personalizacion_nombre ?? '',
        color: lp.atributos?.color ?? lp.color_nombre ?? ''
    },
    // columna DB es "precio", no "precio_unitario"; pg devuelve números como string
    precioUnitario: Number(lp.precio ?? lp.precio_unitario ?? lp.precioUnitario ?? 0),
    cantidad: lp.cantidad
});


const mapearACarritoFrontend = (c: any): Carrito => ({
    id: c.carrito?.numero_cotizacion ?? c.id ?? c.numeroCotizacion,
    clienteId: c.carrito?.id_usuario ?? c.idUsuario ?? c.clienteId,
    fechaCreacion: c.carrito?.fecha_creacion ?? c.fechaCreacion,
    items: (c.detalles ?? c.items ?? []).map(mapearALineaCarrito)
});

const mapearALineaCarrito = (item: any): LineaCarrito => ({
    numeroLinea: item.numero_linea ?? item.numeroLinea ?? item.id_generico ?? item.id,
    productoId: item.id_generico ?? item.idGenerico ?? item.productoId,
    nombre: item.generico_nombre ?? item.nombre ?? '',
    imagenKey: item.generico_imagen ?? item.imagenKey ?? item.urlImagen ?? '',
    atributos: {
        talla: item.tamano_nombre ?? item.atributos?.talla ?? item.tamano ?? '',
        material: item.material_nombre ?? item.atributos?.material ?? item.material ?? '',
        personalizacion: item.personalizacion_nombre ?? item.atributos?.personalizacion ?? item.personalizacion ?? '',
        color: item.color_nombre ?? item.atributos?.color ?? item.color ?? '',
        colorHex: item.color_pantone ?? item.atributos?.colorHex ?? item.colorHex ?? ''
    },
    precioUnitario: Number(item.precio ?? item.precio_unitario ?? item.precioUnitario ?? 0),
    cantidad: item.cantidad,
    maximoStock: item.maximo_stock ?? item.maximoStock ?? 999
});


export const CotizacionesAPIService = {
    /* --- CRUD DE COTIZACIONES --- */

    // 1. OBTENER TODAS LAS COTIZACIONES SEGÚN TIPO DE USUARIO Y REGISTROS ACTIVOS/INACTIVOS
    getCotizaciones: async (id: number, tipo: "CLIENTE" | "COMERCIANTE", page: number, items_per_page: number, active: any): Promise<Cotizacion[]> => {
        const endpoint = '/cotizaciones/solicitudes/' + (tipo === "CLIENTE" ? `cliente/${id}` : `comerciante/`);
        const params = `page=${page}&len=${items_per_page}` + (active != null ? `&active=${active}` : '');
        const response = await apiClient.get<{ exito: boolean; data: any[] }>(`${endpoint}?${params}`);
        if (!response.data || !response.data.data) return [];
        console.log('[getCotizaciones] respuesta backend:', response.data);
        return response.data.data.map(mapearACotizacionFrontend);
    },

    // 2. OBTENER UNA SOLA COTIZACION POR NÚMERO Y VERSIÓN
    getCotizacionByNumeroVersion: async (numero: number, version: number): Promise<Cotizacion> => {
        const response = await apiClient.get<{ exito: boolean; data: any }>(`/cotizaciones/solicitudes/${numero}/${version}`);
        if (!response.data || !response.data.data) {
            throw new Error(`No se encontraron datos para la cotización N°${numero} v${version}`);
        }
        return mapearACotizacionFrontend(response.data.data);
    },

    // Alias por compatibilidad con llamadas existentes
    getCotizacionById: async (id: number, version: number): Promise<Cotizacion> => {
        return CotizacionesAPIService.getCotizacionByNumeroVersion(id, version);
    },

    // 3. LISTAR VERSIONES DE UNA COTIZACION
    getVersionesCotizacion: async (numero: number, page: number, len: number): Promise<Cotizacion[]> => {
        const response = await apiClient.get<{ exito: boolean; data: any[] }>(`/cotizaciones/solicitudes/${numero}?page=${page}&len=${len}`);
        if (!response.data || !response.data.data) return [];
        return response.data.data.map(mapearACotizacionFrontend);
    },

    // 4. ACTUALIZAR ESTADO DE COTIZACION
    updateCotizacionEstado: async (cotizacion: Cotizacion): Promise<Cotizacion> => {
        const response = await apiClient.put<{ exito: boolean; data: any }>(
            `/cotizaciones/solicitudes/update/estado`,
            { numeroCotizacion: cotizacion.id, numeroVersion: cotizacion.version, estado: cotizacion.estado }
        );
        if (!response.data || !response.data.exito) {
            throw new Error(`Error al actualizar el estado de la cotización con ID ${cotizacion.id} y versión ${cotizacion.version}`);
        }
        return cotizacion;
    },

    // 5. ASIGNAR COMERCIANTE A COTIZACION
    asignarComerciante: async (numeroCotizacion: number, numeroVersion: number, idComerciante: number): Promise<void> => {
        const response = await apiClient.put<{ exito: boolean; data: any }>(
            `/cotizaciones/solicitudes/update/comerciante`,
            { numeroCotizacion, numeroVersion, idComerciante }
        );
        if (!response.data?.exito) {
            throw new Error(`Error al asignar comerciante a la cotización N°${numeroCotizacion}`);
        }
    },

    // 6. CREAR NUEVA COTIZACIÓN
    // TODO: El backend no tiene endpoint para crear cotizaciones todavía.
    // El flujo previsto: el cliente convierte su carrito en solicitud formal desde el microservicio.
    createCotizacion: async (_cotizacion: CreateCotizacionDTO): Promise<Cotizacion> => {
        throw new Error('createCotizacion: endpoint no disponible en el backend todavía.');
    },

    /* --- CARRITO --- */

    // 7. OBTENER CARRITO ACTIVO DEL USUARIO AUTENTICADO
    getCarrito: async (): Promise<Carrito | null> => {
        const response = await apiClient.get<{ exito: boolean; data: any }>(`/cotizaciones/carrito`);
        if (!response.data?.data) return null;
        return mapearACarritoFrontend(response.data.data);
    },

    // 8. AGREGAR ITEM AL CARRITO
    addItemCarrito: async (
        idGenerico: number,
        cantidad: number,
        idTamano: number,
        idColor: number,
        idMaterial: number,
        idPersonalizacion: number,
        urlDiseno?: string
    ): Promise<void> => {
        const response = await apiClient.post<{ exito: boolean; data: any }>(
            `/cotizaciones/carrito/items`,
            { idGenerico, cantidad, idTamano, idColor, idMaterial, idPersonalizacion, urlDiseno }
        );
        // DEBUG — verificar respuesta del backend al agregar ítem
        console.log('[addItemCarrito] respuesta backend:', response.data);
        if (!response.data?.exito) {
            throw new Error(`addItemCarrito: backend devolvió exito=false para idGenerico=${idGenerico}`);
        }
    },

    // 9. ACTUALIZAR CANTIDAD DE UN ITEM DEL CARRITO
    updateItemCarrito: async (idGenerico: number, cantidad: number): Promise<void> => {
        await apiClient.put<{ exito: boolean; data: any }>(
            `/cotizaciones/carrito/items/${idGenerico}`,
            { cantidad }
        );
    },

    // 10. ELIMINAR UN ITEM DEL CARRITO
    removeItemCarrito: async (idGenerico: number): Promise<void> => {
        await apiClient.delete(`/cotizaciones/carrito/items/${idGenerico}`);
    },

    // 11. VACIAR EL CARRITO
    clearCarrito: async (): Promise<void> => {
        await apiClient.delete(`/cotizaciones/carrito`);
    },

    // 12. CONVERTIR CARRITO EN SOLICITUD FORMAL (estado → "Solicitado")
    solicitarCotizacion: async (numeroCotizacion: number, observacionesCliente: string): Promise<void> => {
        const response = await apiClient.put<{ exito: boolean; data: any }>(
            `/cotizaciones/solicitudes/update/estado`,
            { numeroCotizacion, numeroVersion: 1, estado: 'SOLICITADA' }
        );
        if (!response.data?.exito) {
            throw new Error(`Error al enviar la solicitud de cotización N°${numeroCotizacion}`);
        }
    }
};
