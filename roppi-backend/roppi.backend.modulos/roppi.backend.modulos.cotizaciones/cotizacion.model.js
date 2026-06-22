// roppi.backend.modulos/roppi.backend.modulos.cotizaciones/cotizacion.model.js

class Cotizacion {
    constructor({ numero_cotizacion, version_cotizacion, id_usuario, estado, total, fecha_limite, comentarios_cliente, comentarios_comerciante, fecha_creacion, detalles = [] }) {
        this.numeroCotizacion = numero_cotizacion;
        this.versionCotizacion = version_cotizacion;
        this.idUsuario = id_usuario;
        this.estado = estado; // 'CARRITO', 'SOLICITADA', 'OBSERVADA', 'CANCELADA', 'ACEPTADA'
        this.total = total;
        this.fechaLimite = fecha_limite;
        this.comentariosCliente = comentarios_cliente;
        this.comentariosComerciante = comentarios_comerciante;
        this.fechaCreacion = fecha_creacion;
        this.detalles = detalles; // Array de DetalleCotizacion
    }
}

module.exports = Cotizacion;