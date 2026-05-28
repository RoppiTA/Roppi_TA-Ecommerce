//ESTO ES SOLO UN MOCK
//Sirve para hacer prueba inicial de código entregado
//por consulta de IA, para asegurar el flujo

import { Product, CreateProductDTO } from '../types/product.types';

// Array de datos falsos utilizando el formato clásico
let mockProducts: Product[] = [
  { id: 'prod-1', name: 'Polos Estampados Anime', price: 25.00, stock: 150, category: 'Polos Estampados' },
  { id: 'prod-2', name: 'Polera Con Capucha Negra', price: 55.00, stock: 90, category: 'Poleras' }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const ProductsAPIService = {
  getProducts: async (): Promise<Product[]> => {
    await delay(400);
    return [...mockProducts];
  },

  getProductById: async (id: string): Promise<Product> => {
    await delay(400);
    const product = mockProducts.find(p => p.id === id);
    if (!product) throw new Error('Producto no encontrado');
    return { ...product };
  },

  createProduct: async (productData: CreateProductDTO): Promise<Product> => {
    await delay(400);
    const newProduct: Product = {
      id: `prod-${Date.now()}`, // Genera un ID string autoincremental por tiempo
      ...productData
    };
    mockProducts.push(newProduct);
    return newProduct;
  },

  updateProduct: async (id: string, productData: Partial<CreateProductDTO>): Promise<Product> => {
    await delay(400);
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Producto no encontrado');
    
    mockProducts[index] = { ...mockProducts[index], ...productData };
    return mockProducts[index];
  },

  deleteProduct: async (id: string): Promise<void> => {
    await delay(400);
    mockProducts = mockProducts.filter(p => p.id !== id);
  },
};