// Entidad: LineaCarrito — una línea de la cotización de tipo "carrito"
// Extiende el concepto de LineaProducto con información de descuento y stock máximo
export interface LineaCarrito {
  numeroLinea: number;
  productoId: number;
  nombre: string;
  imagenKey: string;        // clave para lookup en assets.js
  atributos: {
    talla: string;
    material: string;
    personalizacion: string;
    color: string;
    colorHex: string;
  };
  precioUnitario: number;
  cantidad: number;
  maximoStock: number;
  // Descuento aplicado si el producto califica (cantidad >= Descuento.cantidad)
  descuentoAplicado?: {
    id: number;
    nombre: string;
    porcentajeDescuento: number;
    montoDescontado: number;  // precioUnitario * cantidad * porcentajeDescuento / 100
  };
}

// Entidad: Carrito — cotización de tipo "carrito" (local, antes de formalizarse como solicitud)
export interface Carrito {
  id?: number;           // undefined hasta que se persista en BD
  clienteId: number;
  fechaCreacion: string;
  items: LineaCarrito[];
}
