export interface Descuento {
//Considera atributos de la base de datos de 
  //tabla "Descuento" sin los datos de auditoria
  id: number;
  nombre: string;
  cantidad: number;
  porcentajeDescuento: number;
  idGenericoVinculados: number[];
}

export type CreateDescuentoDTO = Omit<Descuento, 'id'>;