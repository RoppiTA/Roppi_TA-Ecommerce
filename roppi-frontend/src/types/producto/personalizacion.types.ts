export interface Personalizacion {
//Considera atributos de la base de datos de 
  //tabla "tipoPersonalizacion" sin los datos de auditoria
  id: number;
  nombre: string;
  descripcion: string;
  activo: number;
}

export type CreatePersonalizacionDTO = Omit<Personalizacion, 'id'>;