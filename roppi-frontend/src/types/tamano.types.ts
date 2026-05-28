export interface Tamano {
//Considera atributos de la base de datos de 
  //tabla "Tamanos" sin los datos de auditoria
  id: number;
  nombre: string;
  descripcion: string;
}

export type CreateTamanoDTO = Omit<Tamano, 'id'>;