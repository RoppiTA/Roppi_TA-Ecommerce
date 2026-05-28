//ESTO ES UN ARCHIVO DUMMY
//Se debe de borrar en cuanto se confirme como
//viene los datos del backend para los productos del listado
export interface Product {
  id: string;          // ID original en formato de texto ('prod-1')
  name: string;        // Nombre comercial
  price: number;       // Precio
  stock: number;       // Cantidad disponible
  category: string;    // Categoría del producto
}

export type CreateProductDTO = Omit<Product, 'id'>;