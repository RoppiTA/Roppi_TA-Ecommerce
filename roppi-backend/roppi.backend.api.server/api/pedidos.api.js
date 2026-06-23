// roppi.backend.api.server/api/pedidos.api.js
const express = require('express');
const pedidoBO = require('../../roppi.backend.modulos/roppi.backend.modulos.pedidos/pedido.bo');
const authMiddleware = require('./middleware/auth');

class PedidosAPI {
    constructor() {
        this.router = express.Router();
        this._configurarRutas();
    }

    _configurarRutas() {
        this.router.use(authMiddleware);

        // GET /api/pedidos - Listar todos los pedidos (confirmados) del cliente
        this.router.get('/', async (req, res) => {
            try {
                const idCliente = req.usuario.sub;
                const data = await pedidoBO.listarPedidosUsuario(idCliente);
                res.status(200).json({ exito: true, data });
            } catch (error) {
                res.status(500).json({ exito: false, mensaje: error.message });
            }
        });

        // TODO: Endpoints para Checkout, seguimiento y pago
    }
}

module.exports = PedidosAPI;