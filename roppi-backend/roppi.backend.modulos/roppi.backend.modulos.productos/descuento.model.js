class Descuento {
    constructor({ id, nombre, cantidad, porcentaje, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion }) {
        // Datos
        this.id = id;
        this.nombre = nombre;
        this.cantidad = cantidad;
        this.porcentaje = porcentaje;
        // Auditoria
        this.fecha_creacion = fecha_creacion;
        this.usuario_creacion = usuario_creacion;
        this.fecha_modificacion = fecha_modificacion;
        this.usuario_modificacion = usuario_modificacion;
    }
}

module.exports = Descuento;