/*Este sigue siendo un MOCK pero ya tiene ejemplos de datos reales con los atributos
 finales de la base de datos. Se utilizara para probar mientras no existe el back */
import { Color } from '../types/producto/color.types'
import { Material } from '../types/producto/material.types'
import { Personalizacion } from '../types/producto/personalizacion.types'
import { Tamano } from '../types/producto/tamano.types'
import { CreateProductGenericoDTO, ProductoGenerico } from '../types/producto/productoGen.types'

// --- CATÁLOGOS MÁSTER DE PRUEBA (Para llenar tus formularios) ---
export const mockColores: Color[] = [
  { id: 1, nombre: 'Rojo Granate', pantone: '#1A0000', activo: 1 },
  { id: 2, nombre: 'Azul Marino', pantone: '#000080', activo: 1 }
];

export const mockMateriales: Material[] = [
  { id: 1, nombre: 'Algodón Reactivo 30/1', descripcion: 'No encoge', activo: 1 },
  { id: 2, nombre: 'Franela Perchada', descripcion: 'Ideal para invierno', activo: 1 }
];

export const mockTamanos: Tamano[] = [
  { id: 1, nombre: 'S', descripcion: 'Standard Small', activo: 1 },
  { id: 2, nombre: 'M', descripcion: 'Standard Medium', activo: 1 }
];

export const mockPersonalizaciones: Personalizacion[] = [
  { id: 1, nombre: 'Estampado Plastisol', descripcion: 'Alta durabilidad', activo: 1 },
  { id: 2, nombre: 'Sublimado Full Color', descripcion: 'Telas poliéster', activo: 1 }
];

// --- TABLA "GENERICOS" EN MEMORIA ---
let mockProductsDB: ProductoGenerico[] = [
  {
    id: 1,
    nombre: 'Polo Oversize Comercial',
    descripcion: 'Polo suelto tendencia Gamarra',
    precio_base: 22.50,
    activo: 1,
    maximo_stock: 1000,
    colores: [{ id_color: 1 }],
    materiales: [{ id_material: 1, costo_extra: 0.00 }],
    tamanos: [{ id_tamano: 1, alto: 70, ancho: 52 }, { id_tamano: 2, alto: 72, ancho: 54 }],
    personalizaciones: [{ id_tipo_personalizacion: 1, costo_extra: 3.50 }]
  }
];

const delay = () => new Promise(res => setTimeout(res, 300));

export const ProductsAPIService = {
  getProducts: async () => { await delay(); return [...mockProductsDB]; },

  getProductById: async (id: number) => {
    await delay();
    const prod = mockProductsDB.find(p => p.id === id);
    if (!prod) throw new Error('No existe el genérico');
    return { ...prod };
  },

  createProduct: async (dto: CreateProductGenericoDTO) => {
    await delay();
    const newId = mockProductsDB.length > 0 ? Math.max(...mockProductsDB.map(p => p.id)) + 1 : 1;
    const newProduct: ProductoGenerico = { id: newId, ...dto };
    mockProductsDB.push(newProduct);
    return newProduct;
  },

  updateProduct: async (id: number, dto: Partial<CreateProductGenericoDTO>) => {
    await delay();
    const index = mockProductsDB.findIndex(p => p.id === id);
    if (index === -1) throw new Error('No encontrado');
    
    // Al sobreescribir el objeto, permitimos que si el array viene con menos elementos, 
    // se simule la eliminación física de las filas de cruce en la BD.
    mockProductsDB[index] = { ...mockProductsDB[index], ...dto };
    return mockProductsDB[index];
  },

  deleteProduct: async (id: number) => {
    await delay();
    // Simula la eliminación en cascada: limpia el registro y por ende todos sus cruces anidados
    mockProductsDB = mockProductsDB.filter(p => p.id !== id);
  }
};