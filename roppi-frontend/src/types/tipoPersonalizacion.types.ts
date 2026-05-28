export interface tipoPersonalizacion {
//Considera atributos de la base de datos de 
  //tabla "tipoPersonalizacion" sin los datos de auditoria
  id: string;
  nombre: string;
  descripcion: string;
}

export type CreatetipoPersonalizacionDTO = Omit<tipoPersonalizacion, 'id'>;