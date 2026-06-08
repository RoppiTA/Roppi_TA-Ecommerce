const express = require('express');
const usuariosBO = require('../../roppi.backend.modulos/roppi.backend.modulos.usuarios/usuario.bo.js');

class UsuariosAPI {
  constructor() {
    this.router = express.Router();
    this._configurarRutas();
  }

  _configurarRutas() {
    // Caso de uso: Creación de un usuario
    this.router.post('/registro', async (req, res) => {
      try {
        const resultado = await usuariosBO.crearUsuario(req.body);
        res.status(201).json({ exito: true, data: resultado });
      } catch (error) {
        res.status(400).json({ exito: false, mensaje: error.message });
      }
    });

    // Login y otras rutas
    this.router.post('/login', async (req, res) => {
      try {
        const { correo, contraseña } = req.body;
        const resultado = await usuariosBO.verificarCredenciales(correo, contraseña);
        res.status(200).json({ exito: true, data: resultado });
      } catch (error) {
        res.status(401).json({ exito: false, mensaje: error.message });
      }
    });
  }
}

module.exports = UsuariosAPI;
