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
            const { idGenerico, cantidad, idTamano, idColor, idMaterial, idPersonalizacion, urlDiseno } = req.body;
            return this.hacerPeticion(req, res, 'POST', `/carrito/items`, { idUsuario, idGenerico, cantidad, idTamano, idColor, idMaterial, idPersonalizacion, urlDiseno });
        });

        this.router.put('/carrito/items/:idGenerico', async (req, res) => {
            const idUsuario = req.usuario.sub;
            const idGenerico = req.params.idGenerico;
            const { cantidad } = req.body;
            return this.hacerPeticion(req, res, 'PUT', `/carrito/items/${idGenerico}`, { idUsuario, cantidad });
        });

        this.router.delete('/carrito/items/:idGenerico', async (req, res) => {
            const idUsuario = req.usuario.sub;
            const idGenerico = req.params.idGenerico;
            // fetch con DELETE y body
            return this.hacerPeticion(req, res, 'DELETE', `/carrito/items/${idGenerico}`, { idUsuario });
        });

        this.router.delete('/carrito', async (req, res) => {
            const idUsuario = req.usuario.sub;
            return this.hacerPeticion(req, res, 'POST', `/carrito/vaciar`, { idUsuario });
        });

        // --- COTIZACIONES ---

        // POV del cliente
        // Listar las cotizaciones abiertas de un cliente, tanto activas como inactivas según
        // el parámetro 'active'.   
        // Ejemplo: localhost:3000/api/cotizaciones/solicitudes/cliente/:id?page=2&len=10&active=1
        this.router.get('/solicitudes/cliente/:id', async (req, res) => {
            const id = req.params.id;
            const page = req.query.page;
            const items_per_page = req.query.len;
            const active = req.query.active;
            if (active == null) {
                return this.hacerPeticion(req, res, 'GET', `/solicitudes/cliente/${id}?page=${page}&len=${items_per_page}`);
            }
            return this.hacerPeticion(req, res, 'GET', `/solicitudes/cliente/${id}?page=${page}&len=${items_per_page}&active=${active}`);
        });

        // POV del vendedor
        // Listar todas las cotizaciones abiertas o inactivas según el parámtero 'active'
        // Ejemplo: localhost:3000/api/cotizaciones/solicitudes/comerciante?page=2&len=10&active=1
        this.router.get('/solicitudes/comerciante', async (req, res) => {
            const page = req.query.page;
            const items_per_page = req.query.len;
            const active = req.query.active;
            if (active == null) {
                return this.hacerPeticion(req, res, 'GET', `/solicitudes/comerciante?page=${page}&len=${items_per_page}`);
            }
            return this.hacerPeticion(req, res, 'GET', `/solicitudes/comerciante?page=${page}&len=${items_per_page}&active=${active}`);
        });

        this.router.get('/solicitudes/:numero/:version', async (req, res) => {
            const numero = req.params.numero;
            const version = req.params.version;
            return this.hacerPeticion(req, res, 'GET', `/solicitudes/${numero}/${version}`);
        })

        this.router.get('/solicitudes/:numero', async (req, res) => {
            const numero = req.params.numero;
            const page = req.query.page;
            const items_per_page = req.query.len;
            if (page && items_per_page) {
                return this.hacerPeticion(req, res, 'GET', `/solicitudes/${numero}?page=${page}&len=${items_per_page}`);
            }
            return this.hacerPeticion(req, res, 'GET', `/solicitudes/${numero}`);
        })

        // Actualizar estado de la cotización
        this.router.put('/solicitudes/update/estado', async (req, res) => {
            const { numeroCotizacion, numeroVersion, estado } = req.body;
            return this.hacerPeticion(req, res, 'PUT', `/solicitudes/update/estado`, { numeroCotizacion, numeroVersion, estado });
        });

        // Asignar comerciante a la cotización
        this.router.put('/solicitudes/update/comerciante', async (req, res) => {
            const { numeroCotizacion, numeroVersion, idComerciante } = req.body;
            return this.hacerPeticion(req, res, 'PUT', `/solicitudes/update/comerciante`, { numeroCotizacion, numeroVersion, idComerciante });
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
