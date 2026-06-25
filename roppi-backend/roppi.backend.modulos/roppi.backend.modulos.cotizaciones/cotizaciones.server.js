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
        this._configurarFuncionesCotizacion();
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
                const { idUsuario, idGenerico, cantidad, idTamano, idColor, idMaterial, idPersonalizacion, urlDiseno } = req.body;
                const resultado = await cotizacionBO.agregarItemCarrito(idUsuario, { idGenerico, cantidad, idTamano, idColor, idMaterial, idPersonalizacion, urlDiseno });
                this.retornarRespuesta(res, 201, resultado);
            } catch (error) {
                this.devolverError(res, 400, error.message);
            }
        });

        this.app.put('/carrito/items/:idGenerico', async (req, res) => {
            try {
                const idGenerico = parseInt(req.params.idGenerico);
                const { idUsuario, cantidad } = req.body;
                const resultado = await cotizacionBO.actualizarCantidadCarrito(idUsuario, idGenerico, cantidad);
                this.retornarRespuesta(res, 200, resultado);
            } catch (error) {
                this.devolverError(res, 400, error.message);
            }
        });

        this.app.delete('/carrito/items/:idGenerico', async (req, res) => {
            try {
                const idGenerico = parseInt(req.params.idGenerico);
                const { idUsuario } = req.body;
                await cotizacionBO.eliminarItemCarrito(idUsuario, idGenerico);
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

    _configurarFuncionesCotizacion() {
        this.app.get('/solicitudes/cliente/:id', async (req, res) => {
            try {
                const idCliente = parseInt(req.params.id);
                const page = parseInt(req.query.page) || 1;
                const items_per_page = Math.min(parseInt(req.query.len), 10) || 10;
                let data = null;
                const active = parseInt(req.query.active) || null;
                if (active === 1) {
                    data = await cotizacionBO.listarCotizacionesActivasPorCliente(idCliente, page, items_per_page);
                }
                else if (active === 0) {
                    data = await cotizacionBO.listarCotizacionesCerradasPorCliente(idCliente, page, items_per_page);
                }
                else {
                    data = await cotizacionBO.listarTodasLasCotizacionesPorCliente(idCliente, page, items_per_page);
                }
                this.retornarRespuesta(res, 200, data);
            }
            catch (error) {
                this.devolverError(res, 500, error.message);
            }

        })

        this.app.get('/solicitudes/comerciante', async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const items_per_page = Math.min(parseInt(req.query.len), 10) || 10;
                let data = null;
                const active = parseInt(req.query.active) || null;
                if (active == 1) {
                    data = await cotizacionBO.listarCotizacionesAbiertas(page, items_per_page);
                }
                else if (active == 0) {
                    data = await cotizacionBO.listarCotizacionesCerradas(page, items_per_page);
                }
                else {
                    data = await cotizacionBO.listarTodasLasCotizaciones(page, items_per_page);
                }
                this.retornarRespuesta(res, 200, data)
            }
            catch (error) {
                this.devolverError(res, 500, error.message);
            }
        })

        this.app.get('/solicitudes/:numero', async (req, res) => {
            try {
                const numero = parseInt(req.params.numero);
                const page = parseInt(req.query.page) || 1;
                const items_per_page = Math.min(parseInt(req.query.len), 10) || 10;
                const resultado = await cotizacionBO.listarVersionesDeCotizacion(numero, page, items_per_page);
                this.retornarRespuesta(res, 200, resultado);
            }
            catch (error) {
                this.devolverError(res, 500, error.message);
            }
        })

        this.app.get('/solicitudes/:numero/:version', async (req, res) => {
            try {
                const numero = parseInt(req.params.numero);
                const version = parseInt(req.params.version);
                const resultado = await cotizacionBO.obtenerDetallesCotizacion(numero, version);
                this.retornarRespuesta(res, 200, resultado);
            }
            catch (error) {
                this.devolverError(res, 500, error.message);
            }
        })

        this.app.put('/solicitudes/update/estado', async (req, res) => {
            try {
                const { numeroCotizacion, numeroVersion, estado } = req.body;
                const resultado = await cotizacionBO.updateEstadoCotizacion(numeroCotizacion, numeroVersion, estado);
                this.retornarRespuesta(res, 200, resultado);
            }
            catch (error) {
                this.devolverError(res, 500, error.message);
            }
        })

        this.app.put('/solicitudes/update/comerciante', async (req, res) => {
            try {
                const { numeroCotizacion, numeroVersion, idComerciante } = req.body;
                const resultado = await cotizacionBO.asignarComerciante(numeroCotizacion, numeroVersion, idComerciante);
                this.retornarRespuesta(res, 200, resultado);
            }
            catch (error) {
                this.devolverError(res, 500, error.message);
            }
        })


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