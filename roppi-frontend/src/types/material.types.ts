export interface Material {
//Considera atributos de la base de datos de 
  //tabla "Materiales" sin los datos de auditoria
  id: string;
  nombre: string;
  cantidad: number;
  percentage: number;
}

export type CreateMaterialDTO = Omit<Material, 'id'>;