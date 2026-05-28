/*ESTO ES UN ARCHIVO DUMMY PARA PRUEBA DE FLUJOS
 Se esta dejando como modelo para implementación de versión final
 con los atributos finales de productos*/
import { useState, useEffect } from 'react';
import { ProductsAPIService } from '../api/products.api';
import { Product, CreateProductDTO } from '../types/product.types';

export const useProducts = (productId?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await ProductsAPIService.getProducts();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductById = async (id: string) => {
    setLoading(true);
    try {
      const data = await ProductsAPIService.getProductById(id);
      setCurrentProduct(data);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: CreateProductDTO) => {
    setLoading(true);
    await ProductsAPIService.createProduct(productData);
    setLoading(false);
  };

  const updateProduct = async (id: string, productData: Partial<CreateProductDTO>) => {
    setLoading(true);
    await ProductsAPIService.updateProduct(id, productData);
    setLoading(false);
  };

  const deleteProduct = async (id: string) => {
    await ProductsAPIService.deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  useEffect(() => {
    if (productId) {
      fetchProductById(productId);
    } else {
      fetchProducts();
    }
  }, [productId]);

  return { products, currentProduct, loading, createProduct, updateProduct, deleteProduct };
};