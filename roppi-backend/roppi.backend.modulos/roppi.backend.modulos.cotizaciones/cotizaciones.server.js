const express = require('express');


class CotizacionesServer {
    constructor() {
        this.app = express();
        this.socket = null;
        this.address = process.env.HOST_COTIZACION_SERVER || 'localhost';
        this.port = process.env.PORT_COTIZACION_SERVER || 3003;

        // Necesario para procesar JSON en el cuerpo de las peticiones
        this.app.use(express.json());

        this._configurarFunciones();
    }

    _configurarFunciones() {
        // Acá van todas las llamadas que recibe desde la API

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