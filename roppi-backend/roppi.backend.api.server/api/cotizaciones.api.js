// roppi.backend.api.server/api/cotizaciones.api.js
const express = require('express');
const authMiddleware = require('./middleware/auth');

class CotizacionesAPI {
    constructor() {
        this.router = express.Router();
        this.cotizacionesServerUrl = `http://${process.env.HOST_COTIZACION_SERVER || 'localhost'}:${process.env.PORT_COTIZACION_SERVER || 3003}`;

        this._configurarRutas();
    }

    _configurarRutas() {
        this.router.use(authMiddleware);

        // --- CARRITO ---

        this.router.get('/carrito', async (req, res) => {
            const idUsuario = req.usuario.sub;
            return this.hacerPeticion(req, res, 'GET', `/carrito/${idUsuario}`);
        });

        this.router.post('/carrito/items', async (req, res) => {
            const idUsuario = req.usuario.sub;
            const { idPersonalizado, cantidad } = req.body;
            return this.hacerPeticion(req, res, 'POST', `/carrito/items`, { idUsuario, idProducto: idPersonalizado, cantidad });
        });

        this.router.put('/carrito/items/:idProducto', async (req, res) => {
            const idUsuario = req.usuario.sub;
            const idProducto = req.params.idProducto;
            const { cantidad } = req.body;
            return this.hacerPeticion(req, res, 'PUT', `/carrito/items/${idProducto}`, { idUsuario, cantidad });
        });

        this.router.delete('/carrito/items/:idProducto', async (req, res) => {
            const idUsuario = req.usuario.sub;
            const idProducto = req.params.idProducto;
            // fetch con DELETE y body
            return this.hacerPeticion(req, res, 'DELETE', `/carrito/items/${idProducto}`, { idUsuario });
        });

        this.router.delete('/carrito', async (req, res) => {
            const idUsuario = req.usuario.sub;
            return this.hacerPeticion(req, res, 'POST', `/carrito/vaciar`, { idUsuario });
        });
    }

    async hacerPeticion(req, res, metodo, path, body = null) {
        try {
            const opciones = {
                method: metodo,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            if (body && metodo !== 'GET' && metodo !== 'HEAD') {
                opciones.body = JSON.stringify(body);
            }

            const url = `${this.cotizacionesServerUrl}${path}`;
            const respuesta = await fetch(url, opciones);

            let data;
            try {
                data = await respuesta.json();
            } catch (err) {
                return res.status(respuesta.status).send(await respuesta.text());
            }

            // Mapeamos el código de error devuelto por el microservicio al gateway
            return res.status(respuesta.status).json({
                exito: data.exito,
                data: data.datos,
                mensaje: data.error || data.mensaje || undefined
            });
        } catch (error) {
            console.error(`[CotizacionesAPI Error] Falló comunicación con CotizacionesServer:`, error);
            return res.status(500).json({
                exito: false,
                mensaje: 'Error de comunicación con el servicio de cotizaciones.'
            });
        }
    }
}

module.exports = CotizacionesAPI;
