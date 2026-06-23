// roppi.backend.modulos/roppi.backend.modulos.cotizaciones/detalle_cotizacion.model.js

class DetalleCotizacion {
    constructor({ id_producto, numero_cotizacion, version_cotizacion, cantidad, precio, url_diseno, ubicacion_personalizacion, fecha_creacion,
        // Datos joins (opcional, para visualización en frontend)
        producto_nombre, producto_sku, tamano_nombre, color_nombre, material_nombre, personalizacion_nombre, maximo_stock
    }) {
        this.idProducto = id_producto;
        this.numeroCotizacion = numero_cotizacion;
        this.versionCotizacion = version_cotizacion;
        this.cantidad = cantidad;
        this.precio = precio;
        this.urlDiseno = url_diseno;
        this.ubicacionPersonalizacion = ubicacion_personalizacion;
        this.fechaCreacion = fecha_creacion;

        if (producto_nombre) this.productoNombre = producto_nombre;
        if (producto_sku) this.productoSku = producto_sku;
        if (tamano_nombre) this.tamanoNombre = tamano_nombre;
        if (color_nombre) this.colorNombre = color_nombre;
        if (material_nombre) this.materialNombre = material_nombre;
        if (personalizacion_nombre) this.personalizacionNombre = personalizacion_nombre;
        if (maximo_stock) this.maximoStock = maximo_stock;
    }
}

module.exports = DetalleCotizacion;