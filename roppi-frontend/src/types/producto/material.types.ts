export interface Material {
//Considera atributos de la base de datos de 
  //tabla "Materiales" sin los datos de auditoria
  id: number;
  nombre: string;
  descripcion : string;
  activo: number;
}

export type CreateMaterialDTO = Omit<Material, 'id'>;