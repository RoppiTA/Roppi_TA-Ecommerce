const express = require('express');

// Importamos los gateways existentes para consumirlos (Aunque no deberíamos hacerlo acá)
/**
 * De hecho, toda esta implementación, debería estar en la clase ProductosServer. Acá, se hace momentaneamente la
 * implementación para evitar más confusiones y para no tener que modificar tanto código de golpe. En una refactorización futura, se debería mover toda
 * esta lógica a ProductosServer, y dejar esta clase solo como un router que delega a ProductosServer.
 */
const genericosBO = require('../../roppi.backend.modulos/roppi.backend.modulos.productos/genericos.bo.js');
const coloresBO = require('../../roppi.backend.modulos/roppi.backend.modulos.productos/colores.bo.js');
const materialesBO = require('../../roppi.backend.modulos/roppi.backend.modulos.productos/materiales.bo.js');
const tamanosBO = require('../../roppi.backend.modulos/roppi.backend.modulos.productos/tamanos.bo.js');
const personalizacionesBO = require('../../roppi.backend.modulos/roppi.backend.modulos.productos/personalizaciones.bo.js');
//const personalizadosBO = require('../../roppi.backend.modulos/roppi.backend.modulos.productos/personalizados.bo.js');

class ProductosAPI {
  constructor() {
    this.router = express.Router();
    this.port = null;
    this.ipAddress = null;

    this._configurarRutas();
  }

  // Método interno para mapear rutas hacia el procesarConsulta
  _configurarRutas() {
    // Genericos
    this.router.get('/genericos', async (req, res) => this.procesarConsultaGenericos(req, res, 'listarTodos'));
    this.router.get('/genericos/:id', async (req, res) => this.procesarConsultaGenericos(req, res, 'obtenerPorId'));

    this.router.post('/genericos', async (req, res) => this.procesarConsultaGenericos(req, res, 'crear'));
    this.router.post('/genericos/:id', async (req, res) => this.procesarConsultaGenericos(req, res, 'actualizar'));
    
    this.router.delete('/genericos/:id/desactivar', async (req, res) => this.procesarConsultaGenericos(req, res, 'desactivar'));

    // Colores
    this.router.get('/colores', async (req, res) => this.procesarConsultaColores(req, res, 'listarTodos'));
    this.router.get('/colores/:id', async (req, res) => this.procesarConsultaColores(req, res, 'obtenerPorId'));

    // Materiales
    this.router.get('/materiales', async (req, res) => this.procesarConsultaMateriales(req, res, 'listarTodos'));
    this.router.get('/materiales/:id', async (req, res) => this.procesarConsultaMateriales(req, res, 'obtenerPorId'));

    // Tamaños
    this.router.get('/tamanos', async (req, res) => this.procesarConsultaTamanos(req, res, 'listarTodos'));
    this.router.get('/tamanos/:id', async (req, res) => this.procesarConsultaTamanos(req, res, 'obtenerPorId'));

    // Personalizaciones
    this.router.get('/personalizaciones', async (req, res) => this.procesarConsultaPersonalizaciones(req, res, 'listarTodos'));
    this.router.get('/personalizaciones/:id', async (req, res) => this.procesarConsultaPersonalizaciones(req, res, 'obtenerPorId'));

    // Personalizados
    //this.router.get('/personalizados', async (req, res) => this.procesarConsultaPersonalizados(req, res, 'listarTodos'));
    //this.router.get('/personalizados/:id', async (req, res) => this.procesarConsultaPersonalizados(req, res, 'obtenerPorId'));
  }

  // Esto lo podemos factorizar en procesarConultaGenerico, procesarConsultaColores, etc.
  async procesarConsultaGenericos(req, res, accion) {
    try {
      let resultado = null;
      let statusCode = 200;

      switch (accion) {
        case 'listarTodos':
          resultado = await genericosBO.listarTodos();
          break;
        case 'obtenerPorId':
          resultado = await genericosBO.obtenerPorId(req.params.id); // Asumiendo que tu gateway tiene obtenerPorId
          break;
        case 'crear':
          resultado = await genericosBO.crear(req.body); // Le pasamos el JSON entero que viene de la petición
          statusCode = 201; // 201 significa "Creado"
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
      console.error(`[ProductosAPI Error] Genericos - ${accion}:`, error);
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
      console.error(`[ProductosAPI Error] Colores - ${accion}:`, error);
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
      console.error(`[ProductosAPI Error] Materiales - ${accion}:`, error);
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
      console.error(`[ProductosAPI Error] Tamaños - ${accion}:`, error);
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
      console.error(`[ProductosAPI Error] Personalizaciones - ${accion}:`, error);
      return this.devolverError(res, 500, 'Error interno procesando Personalizaciones.');
    }
  }

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
      console.error(`[ProductosAPI Error] Personalizados - ${accion}:`, error);
      return this.devolverError(res, 500, 'Error interno procesando Personalizados.');
    }
  }

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
}

module.exports = ProductosAPI;