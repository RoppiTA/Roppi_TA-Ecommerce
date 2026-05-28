/*ESTO ES UN ARCHIVO DUMMY PARA PRUEBA DE FLUJOS
 Se esta dejando como modelo para implementación de versión final
 con los atributos finales de descuento*/
import { useState, useEffect } from 'react';
import { DiscountsAPIService } from '../api/discounts.api';
import { ProductsAPIService } from '../api/products.api';
import { Descuento, CreateDescuentoDTO } from '../types/producto/descuento.types';
import { ProductoGenerico } from '../types/producto/productoGen.types';

export const useDiscounts = (discountId?: number) => {
  const [discounts, setDiscounts] = useState<Descuento[]>([]);
  const [availableProducts, setAvailableProducts] = useState<ProductoGenerico[]>([]);
  const [currentDiscount, setCurrentDiscount] = useState<Descuento | null>(null);
  const [loading, setLoading] = useState(false);

  const initData = async () => {
    setLoading(true);
    const [listDesc, listProd] = await Promise.all([DiscountsAPIService.getDiscounts(), ProductsAPIService.getProducts()]);
    setDiscounts(listDesc);
    setAvailableProducts(listProd);
    setLoading(false);
  };

  useEffect(() => {
    if (discountId) {
      setLoading(true);
      DiscountsAPIService.getDiscountById(discountId).then(setCurrentDiscount).finally(() => setLoading(false));
    } else {
      initData();
    }
  }, [discountId]);

  return {
    discounts,
    availableProducts, // Para marcar a qué categoría general (Gamarra) va el descuento
    currentDiscount,
    loading,
    createDiscount: (d: CreateDescuentoDTO) => DiscountsAPIService.createDiscount(d).then(initData),
    updateDiscount: (id: number, d: Partial<CreateDescuentoDTO>) => DiscountsAPIService.updateDiscount(id, d).then(initData),
    deleteDiscount: (id: number) => DiscountsAPIService.deleteDiscount(id).then(initData)
  };
};