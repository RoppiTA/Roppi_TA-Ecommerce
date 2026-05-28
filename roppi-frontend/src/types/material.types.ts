export interface Material {
//Considera atributos de la base de datos de 
  //tabla "Materiales" sin los datos de auditoria
  id: string;
  nombre: string;
  descripcion : string;
  costo_extra: number;
}

export type CreateMaterialDTO = Omit<Material, 'id'>;