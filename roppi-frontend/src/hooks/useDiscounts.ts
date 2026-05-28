/*ESTO ES UN ARCHIVO DUMMY PARA PRUEBA DE FLUJOS
 Se esta dejando como modelo para implementación de versión final
 con los atributos finales de descuento*/
import { useState, useEffect } from 'react';
import { DiscountsAPIService } from '../api/discounts.api';
import { Discount, CreateDiscountDTO } from '../types/discount.types';

export const useDiscounts = (discountId?: string) => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [currentDiscount, setCurrentDiscount] = useState<Discount | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const data = await DiscountsAPIService.getDiscounts();
      setDiscounts(data);
    } catch (encodeError) {
      console.error('Error al traer campañas');
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscountById = async (id: string) => {
    setLoading(true);
    try {
      const data = await DiscountsAPIService.getDiscountById(id);
      setCurrentDiscount(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createDiscount = async (data: CreateDiscountDTO) => {
    setLoading(true);
    try {
      await DiscountsAPIService.createDiscount(data);
    } finally {
      setLoading(false);
    }
  };

  const updateDiscount = async (id: string, data: Partial<CreateDiscountDTO>) => {
    setLoading(true);
    try {
      await DiscountsAPIService.updateDiscount(id, data);
    } finally {
      setLoading(false);
    }
  };

  const deleteDiscount = async (id: string) => {
    try {
      await DiscountsAPIService.deleteDiscount(id);
      setDiscounts((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (discountId) {
      fetchDiscountById(discountId);
    } else {
      fetchDiscounts();
    }
  }, [discountId]);

  return {
    discounts,
    currentDiscount,
    loading,
    createDiscount,
    updateDiscount,
    deleteDiscount,
  };
};