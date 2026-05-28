/*Este sigue siendo un MOCK pero ya tiene ejemplos de datos reales con los atributos
 finales de la base de datos. Se utilizara para probar mientras no existe el back */
import { Descuento, CreateDescuentoDTO } from '../types/producto/descuento.types'

let mockDiscountsDB: Descuento[] = [
  { id: 1, nombre: 'Campaña Día de la Madre', cantidad: 50, porcentajeDescuento: 15.5,
     idGenericoVinculados: [1] }
];

const delay = () => new Promise(res => setTimeout(res, 300));

export const DiscountsAPIService = {
  getDiscounts: async () => { await delay(); return [...mockDiscountsDB]; },
  
  getDiscountById: async (id: number) => {
    await delay();
    return mockDiscountsDB.find(d => d.id === id) || null;
  },

  createDiscount: async (dto: CreateDescuentoDTO) => {
    await delay();
    const newId = Date.now();
    const newDiscount = { id: newId, ...dto };
    mockDiscountsDB.push(newDiscount);
    return newDiscount;
  },

  updateDiscount: async (id: number, dto: Partial<CreateDescuentoDTO>) => {
    await delay();
    const idx = mockDiscountsDB.findIndex(d => d.id === id);
    if (idx !== -1) mockDiscountsDB[idx] = { ...mockDiscountsDB[idx], ...dto };
  },

  deleteDiscount: async (id: number) => {
    await delay();
    mockDiscountsDB = mockDiscountsDB.filter(d => d.id !== id);
  }
};