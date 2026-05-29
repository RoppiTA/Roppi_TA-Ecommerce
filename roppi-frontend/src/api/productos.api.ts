import { apiClient } from "./apiCliente";
import { Color } from "../types/producto/color.types";
import { Material } from "../types/producto/material.types";
import { Personalizacion } from "../types/producto/personalizacion.types";
import { Tamano } from "../types/producto/tamano.types";
import {CreateDescuentoDTO, Descuento} from "../types/producto/descuento.types";
import { CreateProductGenericoDTO, ProductoGenerico } from "../types/producto/productoGen.types";

export const ProductosAPIService = {
    /*Primero hacemos el retrieval de los datos maestros de los 
    atributos generales dado que estos se necesitan para llenar los 
    formularios de creación y edición. */
    getColores: async (): Promise<Color[]> => {
        //Falta cambiar el endpoint a la URL del backend.
        const response = await apiClient.get('/productos/colores');
        return response.data;
    },

    getMateriales: async (): Promise<Material[]> => {
        //Falta cambiar el endpoint a la URL del backend.
        const response = await apiClient.get('/productos/materiales');
        return response.data;
    },

    getTamano: async (): Promise<Tamano[]> => {
        //Falta cambiar el endpoint a la URL del backend.
        const response = await apiClient.get('/productos/tamanos');
        return response.data;
    },

    getPersonalizaciones: async (): Promise<Personalizacion[]> => {
        //Falta cambiar el endpoint a la URL del backend.
        const response = await apiClient.get('/productos/personalizaciones');
        return response.data;
    },
    
    /*A continuación hacemos el CRUD respecto a los productos genericos
     considerando que trae en este caso todos los producto activo o 
     inactivo*/
    getProductosGenericos: async (): Promise<ProductoGenerico[]> => {
        //Falta cambiar el endpoint a la URL del backend.
        const response = await apiClient.get('/productos/genericos');
        return response.data;
    },
    
    createProductoGenerico: async (productoData: CreateProductGenericoDTO): Promise<ProductoGenerico> => {
        //Falta cambiar el endpoint a la URL del backend.
        const response = await apiClient.post('/productos/genericos', productoData);
        return response.data;
    },

    updateProductoGenerico: async (id: number, productoData: CreateProductGenericoDTO): Promise<ProductoGenerico> => {
        //Falta cambiar el endpoint a la URL del backend.
        const response = await apiClient.put(`/productos/genericos/${id}`, productoData);
        return response.data;
    },

    deleteProductoGenerico: async (id: number): Promise<void> => {
        //Falta cambiar el endpoint a la URL del backend.
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