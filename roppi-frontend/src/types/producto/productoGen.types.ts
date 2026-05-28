import { GenericoXColor, GenericoXMaterial, GenericoXTamano, GenericoXPersonalizacion } from './genericoAtributos.types';

export interface ProductoGenerico {
  id: number;
  nombre: string;
  descripcion: string;
  precio_base: number;
  activo: number;
  maximo_stock: number;
  // Agregados relacionales que el frontend leerá/escribirá
  colores: GenericoXColor[];
  materiales: GenericoXMaterial[];
  tamanos: GenericoXTamano[];
  personalizaciones: GenericoXPersonalizacion[];
}

export type CreateProductGenericoDTO = Omit<ProductoGenerico, 'id'>;