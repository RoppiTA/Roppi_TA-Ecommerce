// roppi.backend.modulos/roppi.backend.modulos.cotizaciones/cotizaciones.server.js
const express = require('express');
const cotizacionBO = require('./cotizacion.bo');

class CotizacionesServer {
    constructor() {
        this.app = express();
        this.socket = null;
        this.address = process.env.HOST_COTIZACION_SERVER || 'localhost';
        this.port = process.env.PORT_COTIZACION_SERVER || 3003;

        this.app.use(express.json());
        this._configurarFunciones();
    }

    _configurarFunciones() {
        // --- CARRITO ---

        this.app.get('/carrito/:idUsuario', async (req, res) => {
            try {
                const idUsuario = parseInt(req.params.idUsuario);
                const data = await cotizacionBO.obtenerCarritoActivo(idUsuario);
                this.retornarRespuesta(res, 200, data);
            } catch (error) {
                this.devolverError(res, 500, error.message);
            }
        });

        this.app.post('/carrito/items', async (req, res) => {
            try {
                const { idUsuario, idProducto, cantidad } = req.body;
                const resultado = await cotizacionBO.agregarItemCarrito(idUsuario, { idProducto, cantidad });
                this.retornarRespuesta(res, 201, resultado);
            } catch (error) {
                this.devolverError(res, 400, error.message);
            }
        });

        this.app.put('/carrito/items/:idProducto', async (req, res) => {
            try {
                const idProducto = parseInt(req.params.idProducto);
                const { idUsuario, cantidad } = req.body;
                const resultado = await cotizacionBO.actualizarCantidadCarrito(idUsuario, idProducto, cantidad);
                this.retornarRespuesta(res, 200, resultado);
            } catch (error) {
                this.devolverError(res, 400, error.message);
            }
        });

        this.app.delete('/carrito/items/:idProducto', async (req, res) => {
            try {
                const idProducto = parseInt(req.params.idProducto);
                const { idUsuario } = req.body;
                await cotizacionBO.eliminarItemCarrito(idUsuario, idProducto);
                this.retornarRespuesta(res, 200, { mensaje: "Eliminado" });
            } catch (error) {
                this.devolverError(res, 400, error.message);
            }
        });

        this.app.post('/carrito/vaciar', async (req, res) => {
            try {
                const { idUsuario } = req.body;
                await cotizacionBO.vaciarCarrito(idUsuario);
                this.retornarRespuesta(res, 200, { mensaje: "Vaciado" });
            } catch (error) {
                this.devolverError(res, 400, error.message);
            }
        });
    }

    devolverError(response, status, mensaje) {
        return response.status(status).json({
            exito: false,
            error: mensaje
        });
    }

    retornarRespuesta(response, status, data) {
        return response.status(status).json({
            exito: true,
            datos: data
        });
    }

    startServer() {
        return new Promise((resolve, reject) => {
            try {
                this.app.listen(this.port, this.address, () => {
                    console.log(`🚀 [CotizacionesServer] Servicio escuchando en http://${this.address}:${this.port}`);
                    resolve();
                });
            } catch (error) {
                console.error('❌ Error al iniciar el servicio de cotizaciones:', error);
                reject(error);
            }
        });
    }
}

// Permitir correr el servidor independientemente (microservicio)
if (require.main === module) {
    const server = new CotizacionesServer();
    server.startServer();
}

module.exports = CotizacionesServer;