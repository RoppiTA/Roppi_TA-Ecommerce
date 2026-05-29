import { useState, useEffect, useCallback } from 'react';
import { ProductosAPIService, DescuentosAPIService } from '../api/productos.api';
import { Color } from "../types/producto/color.types";
import { Material } from "../types/producto/material.types";
import { Personalizacion } from "../types/producto/personalizacion.types";
import { Tamano } from "../types/producto/tamano.types";
import { CreateProductGenericoDTO, ProductoGenerico } from "../types/producto/productoGen.types";
import { CreateDescuentoDTO, Descuento } from '../types/producto/descuento.types';  


export const useProductosGenericos = () => {
    // Estados para productos, loading, error y catálogos maestros
    const [productos, setProductos] = useState<ProductoGenerico[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Estados para los catálogos maestros
    const [colores, setColores] = useState<Color[]>([]);
    const [materiales, setMateriales] = useState<Material[]>([]);
    const [tamanos, setTamanos] = useState<Tamano[]>([]);
    const [personalizaciones, setPersonalizaciones] = useState<Personalizacion[]>([]);

    // Función para cargar todos los datos necesarios 
    // (productos + catálogos) al inicio
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // Promise.all hace que las 5 peticiones ocurran al mismo tiempo 
            const [c, m, t, p, prods] = await Promise.all([
                ProductosAPIService.getColores(),
                ProductosAPIService.getMateriales(),
                ProductosAPIService.getTamano(),
                ProductosAPIService.getPersonalizaciones(),
                ProductosAPIService.getProductosGenericos()
            ]);

            setColores(c);
            setMateriales(m);
            setTamanos(t);
            setPersonalizaciones(p);
            setProductos(prods);
        } catch (err) {
            setError('Error al conectar con la base de datos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Se ejecuta una vez al montar el componente para cargar los datos iniciales
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Utiliza un estado local temporal o de retorno directo en la vista de edición.
    const getProductoById = useCallback(async (id: number): Promise<ProductoGenerico> => {
        try {
            setLoading(true);
            setError(null);
            const producto = await ProductosAPIService.getProductoGenericoById(id);
            return producto;
        } catch (err) {
            setError(`Error al obtener el producto con ID ${id}`);
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Funciones para agregar, actualizar y eliminar productos sin recargar 
    // toda la lista, actualizando el estado local de productos directamente.
    const addProducto = async (data: CreateProductGenericoDTO) => {
        try {
            const nuevo = await ProductosAPIService.createProductoGenerico(data);
            setProductos((prev) => [...prev, nuevo]);
            return nuevo; 
        } catch (err) {
            console.error("Error al crear producto:", err);
            throw err; 
        }
    };

    const updateProducto = async (id: number, data: CreateProductGenericoDTO) => {
        try {
            const actualizado = await ProductosAPIService.updateProductoGenerico(id, data);
            setProductos((prev) => prev.map(p => p.id === id ? actualizado : p));
            return actualizado;
        } catch (err) {
            console.error("Error al actualizar producto:", err);
            throw err;
        }
    };

    const deleteProducto = async (id: number) => {
        try {
            await ProductosAPIService.deleteProductoGenerico(id);
            setProductos((prev) => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error("Error al eliminar producto:", err);
            throw err;
        }
    };

    return {
        productos, 
        loading, 
        error, 
        colores, 
        materiales, 
        tamano: tamanos, 
        personalizaciones, 
        getProductoById, 
        addProducto, 
        updateProducto, 
        deleteProducto, 
        refresh: fetchData
    };
};

export const useDescuentos = () => {
    const [descuentos, setDescuentos] = useState<Descuento[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 1. CARGAR TODOS LOS DESCUENTOS
    const fetchDescuentos = useCallback(async () => {
        try {
            setLoading(true);
            const data = await DescuentosAPIService.getDescuentos();
            setDescuentos(data);
            setError(null);
        } catch (err) {
            setError('Error al cargar la lista de descuentos.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. CREAR DESCUENTO
    const addDescuento = async (data: CreateDescuentoDTO) => {
        try {
            const nuevoDescuento = await DescuentosAPIService.createDescuento(data);
            setDescuentos((prev) => [...prev, nuevoDescuento]);
            return nuevoDescuento;
        } catch (err) {
            setError('Error al crear el descuento.');
            throw err;
        }
    };

    // 3. ACTUALIZAR DESCUENTO
    const updateDescuento = async (id: number, data: CreateDescuentoDTO) => {
        try {
            const actualizado = await DescuentosAPIService.updateDescuento(id, data);
            setDescuentos((prev) => 
                prev.map((d) => (d.id === id ? actualizado : d))
            );
            return actualizado;
        } catch (err) {
            setError('Error al actualizar el descuento.');
            throw err;
        }
    };

    // 4. ELIMINAR DESCUENTO
    const deleteDescuento = async (id: number) => {
        try {
            await DescuentosAPIService.deleteDescuento(id);
            setDescuentos((prev) => prev.filter((d) => d.id !== id));
        } catch (err) {
            setError('Error al eliminar el descuento.');
            throw err;
        }
    };

    // Cargar datos al montar el hook
    useEffect(() => {
        fetchDescuentos();
    }, [fetchDescuentos]);

    return {
        descuentos,
        loading,
        error,
        addDescuento,
        updateDescuento,
        deleteDescuento,
        refresh: fetchDescuentos
    };
};