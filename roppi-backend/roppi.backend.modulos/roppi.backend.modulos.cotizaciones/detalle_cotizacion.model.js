class DetalleCotizacion {
    constructor({
        id_producto, numero_cotizacion, version_cotizacion, cantidad, precio, url_diseno, ubicacion_personalizacion,
        fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion
    }) {
        // Datos
        this.id_producto = id_producto;
        this.numero_cotizacion = numero_cotizacion;
        this.version_cotizacion = version_cotizacion;
        this.cantidad = cantidad;
        this.precio = precio;
        this.url_diseno = url_diseno;
        this.ubicacion_personalizacion = ubicacion_personalizacion;
        this.fecha_creacion = fecha_creacion;
        this.usuario_creacion = usuario_creacion;
        this.fecha_modificacion = fecha_modificacion;
        this.usuario_modificacion = usuario_modificacion;
    }
}

module.exports = DetalleCotizacion;