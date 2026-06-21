// roppi.backend.modulos/roppi.backend.modulos.pedidos/pedido.model.js

class Pedido {
  constructor({ id, id_usuario, id_direccion, numero_cotizacion, version_cotizacion, estado_entrega, estado_pago, monto_total, monto_pagado, identificador_tracking, fecha_creacion }) {
    this.id = id;
    this.idUsuario = id_usuario;
    this.idDireccion = id_direccion;
    this.numeroCotizacion = numero_cotizacion;
    this.versionCotizacion = version_cotizacion;
    this.estadoEntrega = estado_entrega; // 'CONFIRMADO', 'EN_PROCESO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'
    this.estadoPago = estado_pago; // 'PAGADO', 'NO_PAGADO', 'PARCIALMENTE_PAGADO'
    this.montoTotal = monto_total;
    this.montoPagado = monto_pagado;
    this.identificadorTracking = identificador_tracking;
    this.fechaCreacion = fecha_creacion;
  }
}

module.exports = Pedido;
