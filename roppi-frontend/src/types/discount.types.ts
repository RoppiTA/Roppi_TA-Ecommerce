//ESTO ES UN ARCHIVO DUMMY
//Se debe de borrar en cuanto se confirme como
//viene los datos del backend para el descuento
export interface Discount {
  id: string;
  code: string;
  percentage: number;
}

export type CreateDiscountDTO = Omit<Discount, 'id'>;