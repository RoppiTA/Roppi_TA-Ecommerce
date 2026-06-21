class Cotizacion {
    constructor({
        id, version, id_usuario, estado, total, fecha_limite, comentarios_cliente, comentarios_comerciante,
        fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion
    }) {
        // Datos
        this.id = id;
        this.version = version;
        this.id_usuario = id_usuario;
        this.estado = estado;
        this.total = total;
        this.fecha_limite = fecha_limite;
        this.comentarios_cliente = comentarios_cliente;
        this.comentarios_comerciante = comentarios_comerciante;
        this.fecha_creacion = fecha_creacion;
        this.usuario_creacion = usuario_creacion;
        this.fecha_modificacion = fecha_modificacion;
        this.usuario_modificacion = usuario_modificacion;
    }
}

module.exports = Cotizacion;