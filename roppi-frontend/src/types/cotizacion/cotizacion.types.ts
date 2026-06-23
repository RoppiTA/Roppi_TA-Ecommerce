export type EstadoCotizacion = "Solicitado" | "Observado" | "Aceptado" | "Cancelado";

export interface LineaProducto {
  numeroLinea: number;
  idCotizacion: number;
  versionCotizacion: number;
  nombre: string;
  atributos: {
    talla: string;
    material: string;
    personalizacion: string;
    color: string;
  };
  precioUnitario: number;
  cantidad: number;
}

export interface Cotizacion {
  id: number;
  comerciante: string;
  cliente: string;
  fechaSolicitud: string;
  fechaVencimiento: string;
  version: number;
  estado: EstadoCotizacion;
  productos: LineaProducto[];
  observacionesCliente?: string;
  comentariosComerciante?: string;
  motivoCancelacion?: string;
  precioAnterior?: number; // Agregado para el caso de estado "Observado"
}

export interface CotizacionResumen {
  id: number;
  comerciante: string;
  cliente: string;
  fechaSolicitud: string;
  fechaVencimiento: string;
  estado: EstadoCotizacion;
  total: number;
  version: number;
  cantidadProductos: number;
}
