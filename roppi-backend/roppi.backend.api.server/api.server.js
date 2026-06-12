const express = require('express');
const cors = require('cors');

// Faltan los demás ServiciosAPI
const ProductosAPI = require('./api/productos.api.js');
const UsuariosAPI = require('./api/usuarios.api.js');

class APIServer {
  constructor() {
    this.app = express();
    this.address = process.env.HOST_API_SERVER || 'localhost';
    this.port = process.env.PORT_API_SERVER || 3000;

    this._configurarMiddlewares();
    this._distribuirRecursos();
    this.app.use(cors({
      origin: 'http://localhost:5173',
      credentials: true
    }));
  }

  _configurarMiddlewares() {
    this.app.use(cors());
    this.app.use(express.json());
    // Se omitió AuthenticatorMiddleware por petición del usuario para pruebas
  }

  _distribuirRecursos() {
    // Instanciamos nuestras APIs
    const productosAPI = new ProductosAPI();
    const usuariosAPI = new UsuariosAPI();
    //TODO: Acá faltan las demás APIs (pedidos, etc.)

    // Distribuimos las peticiones HTTP a la clase correspondiente
    this.app.use('/api/productos', productosAPI.router);
    this.app.use('/api/usuarios', usuariosAPI.router);

    // Podemos preparar la distribución de otras rutas para el futuro
    // this.app.use('/api/pedidos', pedidosAPI.router);
  }

  startServer() {
    return new Promise((resolve, reject) => {
      try {
        this.app.listen(this.port, this.address, () => {
          console.log(`🚀 [APIServer] Servidor escuchando en http://${this.address}:${this.port}`);
          console.log(`   - Rutas disponibles: /api/productos/genericos, /api/productos/colores, etc.`);
          resolve();
        });
      } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        reject(error);
      }
    });
  }
}

module.exports = APIServer;
