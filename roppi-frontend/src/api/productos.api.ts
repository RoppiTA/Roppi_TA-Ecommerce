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
    activo: prod.activo,
    colores: (prod.colores || []).map(mapearAGenericoXColor),
    materiales: (prod.materiales || []).map(mapearAGenericoXMaterial),
    tamanos: (prod.tamanos || []).map(mapearAGenericoXTamano),
    personalizaciones: (prod.personalizaciones || []).map(mapearAGenericoXPersonalizacion)
});

const mapearAGenericoXColor = (c: any): GenericoXColor => ({
    id_color: c.id,
});

const mapearAGenericoXMaterial = (c: any): GenericoXMaterial => ({
    id_material: c.id,
    costo_extra: c.costoExtra
});

const mapearAGenericoXTamano = (c: any): GenericoXTamano => ({
    id_tamano: c.id,
    ancho: c.ancho,
    alto: c.alto
});

const mapearAGenericoXPersonalizacion = (c: any): GenericoXPersonalizacion => ({
    id_personalizacion: c.id,
    costo_extra: c.costoExtra
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
            maximoStock: productoData.maximo_stock
            /*activo: productoData.activo,
            tamanos: [],//productoData.tamanos,
            materiales: [],//productoData.materiales,
            colores: [],//productoData.colores,
            personalizaciones: []//productoData.personalizaciones*/
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
            maximoStock: productoData.maximo_stock
            /*activo: productoData.activo,
            tamanos: [],//productoData.tamanos,
            materiales: [],//productoData.materiales,
            colores: [],//productoData.colores,
            personalizaciones: []//productoData.personalizaciones*/
        };

        console.log("3. Ver que tiene backend:", dtoBackend);

        const response = await apiClient.put<{ exito: boolean; datos: any }>(`/productos/genericos/${id}`, dtoBackend);
        return mapearAProductoFrontend(response.data.datos);
    },

    // 5. ELIMINAR (DESACTIVAR) PRODUCTO
    deleteProductoGenerico: async (id: number): Promise<void> => {
        // Apunta al endpoint de desactivación del backend
        await apiClient.delete(`/productos/genericos/${id}/desactivar`);
    }
};

export const DescuentosAPIService = {
  getDescuentos: async (): Promise<Descuento[]> => {
    const response = await apiClient.get<Descuento[]>('/api/descuentos');
    return response.data;
  },

  getDescuentoById: async (id: number): Promise<Descuento> => {
    const response = await apiClient.get<Descuento>(`/api/descuentos/${id}`);
    return response.data;
  },

  createDescuento: async (dto: CreateDescuentoDTO): Promise<Descuento> => {
    const response = await apiClient.post<Descuento>('/api/descuentos', dto);
    return response.data;
  },

  updateDescuento: async (id: number, dto: Partial<CreateDescuentoDTO>): Promise<Descuento> => {
    const response = await apiClient.put<Descuento>(`/api/descuentos/${id}`, dto);
    return response.data;
  },

  deleteDescuento: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/descuentos/${id}`);
  }
};