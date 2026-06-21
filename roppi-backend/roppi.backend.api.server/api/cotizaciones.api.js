const express = require('express');
const authMiddleware = require('./middleware/auth');

class CotizacionesAPI {
    constructor() {
        this.router = express.Router();
        this.cotizacionesServerUrl = `http://${process.env.HOST_COTIZACION_SERVER || 'localhost'}:${process.env.PORT_COTIZACION_SERVER || 3003}`;

        this._configurarRutas();
    }

    _configurarRutas() {
        // Desactivado temporalmente para las pruebas locales
        //this.router.use(authMiddleware);

        // Acá van todas las rutas de las cotizaciones

    }

    async hacerPeticion(req, res, metodo, path, body = null) {
        try {
            const opciones = {
                method: metodo,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            // Si hay body y no es un método GET/HEAD, lo adjuntamos
            if (body && metodo !== 'GET' && metodo !== 'HEAD') {
                opciones.body = JSON.stringify(body);
            }

            const url = `${this.cotizacionesServerUrl}${path}`;
            const respuesta = await fetch(url, opciones);

            // Intentamos parsear el JSON de la respuesta
            let data;
            try {
                data = await respuesta.json();
            } catch (err) {
                // Si la respuesta no es JSON válido (ej. error del servidor)
                return res.status(respuesta.status).send(await respuesta.text());
            }

            return res.status(respuesta.status).json(data);
        } catch (error) {
            console.error(`[CotizacionesAPI Error] Falló comunicación con CotizacionesServer:`, error);
            return res.status(500).json({
                exito: false,
                error: 'Error de comunicación con el servicio de cotizaciones.'
            });
        }
    }
}

module.exports = CotizacionesAPI;
