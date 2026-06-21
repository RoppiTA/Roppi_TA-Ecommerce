// roppi.backend.modulos/roppi.backend.modulos.pedidos/pedido.bo.js
const pedidoGateway = require('./pedido.gateway');

class PedidoBO {

  async listarPedidosUsuario(idUsuario) {
    return await pedidoGateway.findByUsuario(idUsuario);
  }

  // TODO: Lógica para confirmar una cotización y convertirla en Pedido
  // TODO: Lógica para registrar un comprobante de pago

}

module.exports = new PedidoBO();
