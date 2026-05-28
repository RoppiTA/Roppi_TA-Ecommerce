export interface Categoria {
  //Considera atributos de la base de datos de 
  //tabla "Producto Generico" sin los datos de auditoria
  id: number;
  nombre: string;
  descripcion: string;
  precioBase: number;
  activo: number;
  maxStock: number;
}

export type CreateCategoriaDTO = Omit<Categoria, 'id'>;