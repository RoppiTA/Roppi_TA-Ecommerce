//ESTO ES SOLO UN MOCK
//Sirve para hacer prueba inicial de código entregado
//por consulta de IA, para asegurar el flujo
import { Discount, CreateDiscountDTO } from '../types/discount.types';

let mockDiscounts: Discount[] = [
  { id: 'desc-1', code: 'GAMARRA20', percentage: 20 }
];
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const DiscountsAPIService = {
  getDiscounts: async (): Promise<Discount[]> => {
    await delay(500);
    return [...mockDiscounts];
  },
  getDiscountById: async (id: string): Promise<Discount> => {
    await delay(500);
    const discount = mockDiscounts.find(d => d.id === id);
    if (!discount) throw new Error('No encontrado');
    return { ...discount };
  },
  createDiscount: async (data: CreateDiscountDTO): Promise<Discount> => {
    await delay(500);
    const newDiscount = { id: `desc-${Date.now()}`, ...data };
    mockDiscounts.push(newDiscount);
    return newDiscount;
  },
  updateDiscount: async (id: string, data: Partial<CreateDiscountDTO>): Promise<Discount> => {
    await delay(500);
    const index = mockDiscounts.findIndex(d => d.id === id);
    mockDiscounts[index] = { ...mockDiscounts[index], ...data };
    return mockDiscounts[index];
  },
  deleteDiscount: async (id: string): Promise<void> => {
    await delay(500);
    mockDiscounts = mockDiscounts.filter(d => d.id !== id);
  },
};