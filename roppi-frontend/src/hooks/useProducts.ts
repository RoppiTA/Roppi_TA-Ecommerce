/*ESTO ES UN ARCHIVO DUMMY PARA PRUEBA DE FLUJOS
 Se esta dejando como modelo para implementación de versión final
 con los atributos finales de productos*/
import { useState, useEffect } from 'react';
import { ProductsAPIService, mockColores, mockMateriales, mockTamanos, mockPersonalizaciones } from '../api/products.api';
import { ProductoGenerico, CreateProductGenericoDTO } from '../types/producto/productoGen.types';

export const useProducts = (productId?: number) => {
  const [products, setProducts] = useState<ProductoGenerico[]>([]);
  const [currentProduct, setCurrentProduct] = useState<ProductoGenerico | null>(null);
  const [loading, setLoading] = useState(false);

  const reloadList = async () => {
    setLoading(true);
    const data = await ProductsAPIService.getProducts();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    if (productId) {
      setLoading(true);
      ProductsAPIService.getProductById(productId).then(setCurrentProduct).finally(() => setLoading(false));
    } else {
      reloadList();
    }
  }, [productId]);

  return {
    products,
    currentProduct,
    loading,
    catalogs: { mockColores, mockMateriales, mockTamanos, mockPersonalizaciones }, // Opciones para el Figma
    createProduct: (d: CreateProductGenericoDTO) => ProductsAPIService.createProduct(d).then(reloadList),
    updateProduct: (id: number, d: Partial<CreateProductGenericoDTO>) => ProductsAPIService.updateProduct(id, d).then(reloadList),
    deleteProduct: (id: number) => ProductsAPIService.deleteProduct(id).then(reloadList),
  };
};