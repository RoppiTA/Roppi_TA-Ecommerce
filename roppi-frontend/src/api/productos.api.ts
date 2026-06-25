import { apiClient } from "./apiCliente";
import { Color } from "../types/producto/color.types";
import { Material } from "../types/producto/material.types";
import { Personalizacion } from "../types/producto/personalizacion.types";
import { Tamano } from "../types/producto/tamano.types";
import { GenericoXColor, GenericoXMaterial, GenericoXPersonalizacion, GenericoXTamano } from "../types/producto/genericoAtributos.types";
import { CreateProductGenericoDTO, ProductoGenerico } from "../types/producto/productoGen.types";
import { CreateDescuentoDTO, Descuento } from "../types/producto/descuento.types";

// Función auxiliar privada para transformar la respuesta del backend al formato del frontend
const mapearAProductoFrontend = (prod: any): ProductoGenerico => ({
    id: prod.id,
    nombre: prod.nombre,
    descripcion: prod.descripcion,
    precio_base: Number(prod.precioBase),
    maximo_stock: prod.maximoStock,
    imagen: prod.urlImagen,
    posicionX: prod.posicionX,
    posicionY: prod.posicionY,
    activo: prod.activo,
    colores: (prod.colores || []).map(mapearAGenericoXColor),
    materiales: (prod.materiales || []).map(mapearAGenericoXMaterial),
    tamanos: (prod.tamanos || []).map(mapearAGenericoXTamano),
    personalizaciones: (prod.personalizaciones || []).map(mapearAGenericoXPersonalizacion)
});

const mapearAGenericoXColor = (c: any): GenericoXColor => ({
    id: c.id,
});

const mapearAGenericoXMaterial = (c: any): GenericoXMaterial => ({
    id: c.id,
    costoExtra: c.costoExtra
});

const mapearAGenericoXTamano = (c: any): GenericoXTamano => ({
    id: c.id,
    ancho: c.ancho,
    alto: c.alto
});

const mapearAGenericoXPersonalizacion = (c: any): GenericoXPersonalizacion => ({
    id: c.id,
    costoExtra: c.costoExtra
});

const mapearAColor = (c: any): Color => ({
    id: c.id,
    nombre: c.nombre,
    pantone: c.pantone,
    activo: c.activo
});

const mapearAMaterial = (m: any): Material => ({
    id: m.id,
    nombre: m.nombre,
    descripcion: m.descripcion,
    activo: m.activo
});

const mapearATamano = (t: any): Tamano => ({
    id: t.id,
    nombre: t.nombre,
    descripcion: t.descripcion,
    activo: t.activo
});

const mapearAPersonalizacion = (p: any): Personalizacion => ({
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion,
    activo: p.activo
});

const mapearADescuentoFrontend = (d: any): Descuento => ({
    id: d.id,
    nombre: d.nombre,
    cantidad: d.cantidad,
    porcentajeDescuento: d.porcentaje_descuento || d.porcentaje,  // Maneja ambos formatos del backend
    idGenericoVinculados: d.productos?.map((p: any) => p.id) || d.id_generico_vinculados || []
});

const mapearADescuentoBackend = (d: CreateDescuentoDTO): any => ({
    nombre: d.nombre,
    cantidad: d.cantidad,
    porcentaje: d.porcentajeDescuento,  // El BO espera 'porcentaje', no 'porcentaje_descuento'
    idProductos: d.idGenericoVinculados  // El BO espera 'idProductos', no 'id_generico_vinculados'
});

export const ProductosAPIService = {
    /* --- DATOS MAESTROS --- */
    getColores: async (): Promise<Color[]> => {
        const response = await apiClient.get<{ exito: boolean; datos: any[] }>('/productos/colores');
        if (!response.data || !response.data.datos) return [];
        return response.data.datos.map(mapearAColor);
    },

    getMateriales: async (): Promise<Material[]> => {
        const response = await apiClient.get<{ exito: boolean; datos: any[] }>('/productos/materiales');
        if (!response.data || !response.data.datos) return [];
        return response.data.datos.map(mapearAMaterial);
    },

    getTamano: async (): Promise<Tamano[]> => {
        const response = await apiClient.get<{ exito: boolean; datos: any[] }>('/productos/tamanos');
        if (!response.data || !response.data.datos) return [];
        return response.data.datos.map(mapearATamano);
    },

    getPersonalizaciones: async (): Promise<Personalizacion[]> => {
        const response = await apiClient.get<{ exito: boolean; datos: any[] }>('/productos/personalizaciones');
        if (!response.data || !response.data.datos) return [];
        return response.data.datos.map(mapearAPersonalizacion);
    },

    /* --- CRUD DE PRODUCTOS GENÉRICOS --- */

    // 1. OBTENER TODOS LOS PRODUCTOS
    getProductosGenericos: async (): Promise<ProductoGenerico[]> => {
        const response = await apiClient.get<{ exito: boolean; datos: any[] }>('/productos/genericos');
        if (!response.data || !response.data.datos) return [];
        return response.data.datos.map(mapearAProductoFrontend);
    },

    // 2. OBTENER UN SOLO PRODUCTO POR ID (¡Nuevo!)
    getProductoGenericoById: async (id: number): Promise<ProductoGenerico> => {
        const response = await apiClient.get<{ exito: boolean; datos: any }>(`/productos/genericos/${id}`);
        if (!response.data || !response.data.datos) {
            throw new Error(`No se encontraron datos para el producto con ID ${id}`);
        }
        return mapearAProductoFrontend(response.data.datos);
    },

    // 3. CREAR PRODUCTO
    createProductoGenerico: async (productoData: CreateProductGenericoDTO): Promise<ProductoGenerico> => {
        // Transformamos de regreso al enviar al backend si este espera CamelCase
        const dtoBackend = {
            nombre: productoData.nombre,
            descripcion: productoData.descripcion,
            precioBase: productoData.precio_base,
            maximoStock: productoData.maximo_stock,
            activo: productoData.activo,
            urlImagen: productoData.imagen,
            posicionX: productoData.posicionX,
            posicionY: productoData.posicionY,
            tamanos: productoData.tamanos,
            materiales: productoData.materiales,
            colores: productoData.colores,
            personalizaciones: productoData.personalizaciones
        };
        
        const response = await apiClient.post<{ exito: boolean; datos: any }>('/productos/genericos', dtoBackend);
        return mapearAProductoFrontend(response.data.datos);
    },

    // 4. MODIFICAR PRODUCTO
    updateProductoGenerico: async (id: number, productoData: CreateProductGenericoDTO): Promise<ProductoGenerico> => {
        const dtoBackend = {
            nombre: productoData.nombre,
            descripcion: productoData.descripcion,
            precioBase: productoData.precio_base,
            maximoStock: productoData.maximo_stock,
            activo: productoData.activo,
            urlImagen: productoData.imagen,
            posicionX: productoData.posicionX,
            posicionY: productoData.posicionY,
            tamanos: productoData.tamanos,
            materiales: productoData.materiales,
            colores: productoData.colores,
            personalizaciones: productoData.personalizaciones
        };

        const response = await apiClient.post<{ exito: boolean; datos: any }>(`/productos/genericos/${id}`, dtoBackend);
        return mapearAProductoFrontend(response.data.datos);
    },

    // 5. ELIMINAR (DESACTIVAR) PRODUCTO
    deleteProductoGenerico: async (id: number): Promise<void> => {
        // Apunta al endpoint de desactivación del backend
        await apiClient.delete(`/productos/genericos/${id}/desactivar`);
    }
};

// [fix] Verbos HTTP corregidos — todos usaban GET incorrectamente (2025-06)
export const DescuentosAPIService = {
    getDescuentos: async (): Promise<Descuento[]> => {
        const response = await apiClient.get<{ exito: boolean; datos: any[] }>('/productos/descuentos');
        if (!response.data || !response.data.datos) return [];
        return response.data.datos.map(mapearADescuentoFrontend);
    },

    getDescuentoById: async (id: number): Promise<Descuento> => {
        const response = await apiClient.get<{ exito: boolean; datos: any }>(`/productos/descuentos/${id}`);
        if (!response.data || !response.data.datos) throw new Error(`No se encontraron datos para el descuento con ID ${id}`);
        return mapearADescuentoFrontend(response.data.datos);
    },

    createDescuento: async (dto: CreateDescuentoDTO): Promise<Descuento> => {
        const dataBackend = mapearADescuentoBackend(dto);
        const response = await apiClient.post<{ exito: boolean; datos: any }>('/productos/descuentos', dataBackend);
        if (!response.data || !response.data.datos) throw new Error('Error al crear el descuento');
        return mapearADescuentoFrontend(response.data.datos);
    },

    updateDescuento: async (id: number, dto: Partial<CreateDescuentoDTO>): Promise<Descuento> => {
        const dataBackend = mapearADescuentoBackend(dto as CreateDescuentoDTO);
        const response = await apiClient.put<{ exito: boolean; datos: any }>(`/productos/descuentos/${id}`, dataBackend);
        if (!response.data || !response.data.datos) throw new Error('Error al actualizar el descuento');
        return mapearADescuentoFrontend(response.data.datos);
    },

    deleteDescuento: async (id: number): Promise<void> => {
        await apiClient.delete(`/productos/descuentos/${id}/desactivar`);
    },

    getDescuentosPorIdProducto: async (idProducto: number): Promise<Descuento[]> => {
        const response = await apiClient.get<{ exito: boolean; datos: any[] }>(`/productos/descuentos/${idProducto}`);
        console.log(`Descuentos obtenidos para producto ID ${idProducto}:`, response.data.datos);
        if (!response.data || !response.data.datos) return [];
        return response.data.datos.map(mapearADescuentoFrontend);
    }
};