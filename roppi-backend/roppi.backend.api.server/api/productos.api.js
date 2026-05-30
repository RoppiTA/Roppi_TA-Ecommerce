const express = require('express');

class ProductosAPI {
  constructor() {
    this.router = express.Router();
    this.productServerUrl = `http://${process.env.HOST_PRODUCT_SERVER || 'localhost'}:${process.env.PORT_PRODUCT_SERVER || 3001}`;

    this._configurarRutas();
  }

  _configurarRutas() {
    // Genericos
    this.router.get('/genericos', async (req, res) => this.hacerPeticion(req, res, 'GET', '/genericos'));
    this.router.get('/genericos/:id', async (req, res) => this.hacerPeticion(req, res, 'GET', `/genericos/${req.params.id}`));
    this.router.post('/genericos', async (req, res) => this.hacerPeticion(req, res, 'POST', '/genericos', req.body));
    this.router.post('/genericos/:id', async (req, res) => this.hacerPeticion(req, res, 'POST', `/genericos/${req.params.id}`, req.body));
    this.router.delete('/genericos/:id/desactivar', async (req, res) => this.hacerPeticion(req, res, 'DELETE', `/genericos/${req.params.id}/desactivar`, req.body));

    // Colores
    this.router.get('/colores', async (req, res) => this.hacerPeticion(req, res, 'GET', '/colores'));
    this.router.get('/colores/:id', async (req, res) => this.hacerPeticion(req, res, 'GET', `/colores/${req.params.id}`));

    // Materiales
    this.router.get('/materiales', async (req, res) => this.hacerPeticion(req, res, 'GET', '/materiales'));
    this.router.get('/materiales/:id', async (req, res) => this.hacerPeticion(req, res, 'GET', `/materiales/${req.params.id}`));

    // Tamaños
    this.router.get('/tamanos', async (req, res) => this.hacerPeticion(req, res, 'GET', '/tamanos'));
    this.router.get('/tamanos/:id', async (req, res) => this.hacerPeticion(req, res, 'GET', `/tamanos/${req.params.id}`));

    // Personalizaciones
    this.router.get('/personalizaciones', async (req, res) => this.hacerPeticion(req, res, 'GET', '/personalizaciones'));
    this.router.get('/personalizaciones/:id', async (req, res) => this.hacerPeticion(req, res, 'GET', `/personalizaciones/${req.params.id}`));

    // Personalizados
    // this.router.get('/personalizados', async (req, res) => this.hacerPeticion(req, res, 'GET', '/personalizados'));
    // this.router.get('/personalizados/:id', async (req, res) => this.hacerPeticion(req, res, 'GET', `/personalizados/${req.params.id}`));
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

      const url = `${this.productServerUrl}${path}`;
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
      console.error(`[ProductosAPI Error] Falló comunicación con ProductoServer:`, error);
      return res.status(500).json({
        exito: false,
        error: 'Error de comunicación con el servicio de productos.'
      });
    }
  }
}

module.exports = ProductosAPI;