const express = require('express');

const genericosBO = require('./genericos.bo.js');
const coloresBO = require('./colores.bo.js');
const materialesBO = require('./materiales.bo.js');
const tamanosBO = require('./tamanos.bo.js');
const personalizacionesBO = require('./personalizaciones.bo.js');
// const personalizadosBO = require('./personalizados.bo.js');

class ProductoServer {
    constructor() {
        this.app = express();
        this.socket = null;
        this.address = process.env.HOST_PRODUCT_SERVER || 'localhost';
        this.port = process.env.PORT_PRODUCT_SERVER || 3001;

        // Necesario para procesar JSON en el cuerpo de las peticiones
        this.app.use(express.json());

        this._configurarFunciones();
    }

    _configurarFunciones() {
        // Genericos
        this.app.get('/genericos', async (req, res) => this.procesarConsultaGenericos(req, res, 'listarTodos'));
        this.app.get('/genericos/:id', async (req, res) => this.procesarConsultaGenericos(req, res, 'obtenerPorId'));
        this.app.post('/genericos', async (req, res) => this.procesarConsultaGenericos(req, res, 'crear'));
        this.app.post('/genericos/:id', async (req, res) => this.procesarConsultaGenericos(req, res, 'actualizar'));
        this.app.delete('/genericos/:id/desactivar', async (req, res) => this.procesarConsultaGenericos(req, res, 'desactivar'));

        // Colores
        this.app.get('/colores', async (req, res) => this.procesarConsultaColores(req, res, 'listarTodos'));
        this.app.get('/colores/:id', async (req, res) => this.procesarConsultaColores(req, res, 'obtenerPorId'));

        // Materiales
        this.app.get('/materiales', async (req, res) => this.procesarConsultaMateriales(req, res, 'listarTodos'));
        this.app.get('/materiales/:id', async (req, res) => this.procesarConsultaMateriales(req, res, 'obtenerPorId'));

        // Tamaños
        this.app.get('/tamanos', async (req, res) => this.procesarConsultaTamanos(req, res, 'listarTodos'));
        this.app.get('/tamanos/:id', async (req, res) => this.procesarConsultaTamanos(req, res, 'obtenerPorId'));

        // Personalizaciones
        this.app.get('/personalizaciones', async (req, res) => this.procesarConsultaPersonalizaciones(req, res, 'listarTodos'));
        this.app.get('/personalizaciones/:id', async (req, res) => this.procesarConsultaPersonalizaciones(req, res, 'obtenerPorId'));

        // Personalizados
        // this.app.get('/personalizados', async (req, res) => this.procesarConsultaPersonalizados(req, res, 'listarTodos'));
        // this.app.get('/personalizados/:id', async (req, res) => this.procesarConsultaPersonalizados(req, res, 'obtenerPorId'));
    }

    async procesarConsultaGenericos(req, res, accion) {
        try {
            let resultado = null;
            let statusCode = 200;

            switch (accion) {
                case 'listarTodos':
                    resultado = await genericosBO.listarTodos();
                    break;
                case 'obtenerPorId':
                    resultado = await genericosBO.obtenerPorId(req.params.id);
                    break;
                case 'crear':
                    resultado = await genericosBO.crear(req.body);
                    statusCode = 201;
                    break;
                case 'actualizar':
                    resultado = await genericosBO.actualizar(req.params.id, req.body);
                    break;
                case 'desactivar':
                    resultado = await genericosBO.desactivar(req.params.id, req.body.usuarioId);
                    break;
                default:
                    return this.devolverError(res, 400, 'Acción no válida en Genéricos');
            }
            return this.retornarRespuesta(res, statusCode, resultado);
        } catch (error) {
            console.error(`[ProductoServer Error] Genericos - ${accion}:`, error);
            return this.devolverError(res, 500, 'Error interno procesando Genéricos.');
        }
    }

    async procesarConsultaColores(req, res, accion) {
        try {
            let resultado = null;
            switch (accion) {
                case 'listarTodos':
                    resultado = await coloresBO.listarTodos();
                    break;
                case 'obtenerPorId':
                    resultado = await coloresBO.obtenerPorId(req.params.id);
                    break;
                default:
                    return this.devolverError(res, 400, 'Acción no válida en Colores');
            }
            return this.retornarRespuesta(res, 200, resultado);
        } catch (error) {
            console.error(`[ProductoServer Error] Colores - ${accion}:`, error);
            return this.devolverError(res, 500, 'Error interno procesando Colores.');
        }
    }

    async procesarConsultaMateriales(req, res, accion) {
        try {
            let resultado = null;
            switch (accion) {
                case 'listarTodos':
                    resultado = await materialesBO.listarTodos();
                    break;
                case 'obtenerPorId':
                    resultado = await materialesBO.obtenerPorId(req.params.id);
                    break;
                default:
                    return this.devolverError(res, 400, 'Acción no válida en Materiales');
            }
            return this.retornarRespuesta(res, 200, resultado);
        } catch (error) {
            console.error(`[ProductoServer Error] Materiales - ${accion}:`, error);
            return this.devolverError(res, 500, 'Error interno procesando Materiales.');
        }
    }

    async procesarConsultaTamanos(req, res, accion) {
        try {
            let resultado = null;
            switch (accion) {
                case 'listarTodos':
                    resultado = await tamanosBO.listarTodos();
                    break;
                case 'obtenerPorId':
                    resultado = await tamanosBO.obtenerPorId(req.params.id);
                    break;
                default:
                    return this.devolverError(res, 400, 'Acción no válida en Tamaños');
            }
            return this.retornarRespuesta(res, 200, resultado);
        } catch (error) {
            console.error(`[ProductoServer Error] Tamaños - ${accion}:`, error);
            return this.devolverError(res, 500, 'Error interno procesando Tamaños.');
        }
    }

    async procesarConsultaPersonalizaciones(req, res, accion) {
        try {
            let resultado = null;
            switch (accion) {
                case 'listarTodos':
                    resultado = await personalizacionesBO.listarTodos();
                    break;
                case 'obtenerPorId':
                    resultado = await personalizacionesBO.obtenerPorId(req.params.id);
                    break;
                default:
                    return this.devolverError(res, 400, 'Acción no válida en Personalizaciones');
            }
            return this.retornarRespuesta(res, 200, resultado);
        } catch (error) {
            console.error(`[ProductoServer Error] Personalizaciones - ${accion}:`, error);
            return this.devolverError(res, 500, 'Error interno procesando Personalizaciones.');
        }
    }

    /*
    async procesarConsultaPersonalizados(req, res, accion) {
        try {
            let resultado = null;
            switch (accion) {
                case 'listarTodos':
                    resultado = await personalizadosBO.listarTodos();
                    break;
                case 'obtenerPorId':
                    resultado = await personalizadosBO.obtenerPorId(req.params.id);
                    break;
                default:
                    return this.devolverError(res, 400, 'Acción no válida en Personalizados');
            }
            return this.retornarRespuesta(res, 200, resultado);
        } catch (error) {
            console.error(`[ProductoServer Error] Personalizados - ${accion}:`, error);
            return this.devolverError(res, 500, 'Error interno procesando Personalizados.');
        }
    }
    */

    // --- MÉTODOS DE RESPUESTA ---

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
                    console.log(`🚀 [ProductoServer] Servicio escuchando en http://${this.address}:${this.port}`);
                    resolve();
                });
            } catch (error) {
                console.error('❌ Error al iniciar el servicio de productos:', error);
                reject(error);
            }
        });
    }
}

module.exports = ProductoServer;