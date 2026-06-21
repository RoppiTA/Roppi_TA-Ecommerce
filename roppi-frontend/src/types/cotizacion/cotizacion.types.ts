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
  fechaSolicitud: string;
  fechaVencimiento: string;
  version: number;
  estado: EstadoCotizacion;
  productos: LineaProducto[];
  //ES IMPORTANTE AJUSTAR ESTO, se debe adaptar a lo
  //que se va utilizar en el backend, pero se deja asi por ahora 
  //para poder avanzar con el desarrollo del frontend
  observacionesCliente?: string;
  comentariosComerciante?: string;
  motivoCancelacion?: string;
  precioAnterior?: number; // Agregado para el caso de estado "Observado"
}

export interface CotizacionResumen {
  id: number;
  comerciante: string;
  fechaSolicitud: string;
  fechaVencimiento: string;
  estado: EstadoCotizacion;
  total: number;
  version: number;
  cantidadProductos: number;
}