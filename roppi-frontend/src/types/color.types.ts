export interface Color {
//Considera atributos de la base de datos de 
  //tabla "Colores" sin los datos de auditoria
  id: number;
  nombre: string;
  pantone: string;
}

export type CreateColorDTO = Omit<Color, 'id'>;