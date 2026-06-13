const express = require('express');
const usuariosBO = require('../../roppi.backend.modulos/roppi.backend.modulos.usuarios/usuario.bo.js');
const emailService = require('../../roppi.backend.modulos/roppi.backend.modulos.usuarios/email.service.js');
const authMiddleware = require('./middleware/auth');

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

        // Enviar correo de activación asíncronamente
        emailService.enviarCorreoActivacion(
          resultado.usuario.correo,
          resultado.tokenActivacion,
          resultado.usuario.nombre
        ).catch(err => console.error("Error asíncrono enviando correo:", err));

        res.status(201).json({ exito: true, data: resultado });
      } catch (error) {
        res.status(400).json({ exito: false, mensaje: error.message });
      }
    });

    // Verificación y Activación de Cuenta (Verificador de Rutas)
    this.router.get('/activar/:token', async (req, res) => {
      try {
        const { token } = req.params;

        // 1. Verificar JWT
        const decoded = usuariosBO.verificarJWT(token);
        const usuarioId = decoded.sub;

        // 2. Activar usuario en la Base de Datos
        await usuariosBO.activarUsuario(usuarioId);

        // 3. Redirigir al frontend
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/activated`);
      } catch (error) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/activated?error=${encodeURIComponent(error.message)}`);
      }
    });


    // Login y otras rutas
    this.router.post('/login', async (req, res) => {
      try {
        const { correo, contrasena } = req.body;
        const resultado = await usuariosBO.verificarCredenciales(correo, contrasena);
        res.status(200).json({ exito: true, data: resultado });
      } catch (error) {
        res.status(401).json({ exito: false, mensaje: error.message });
      }
    });

    //correito para recuperar la contra
    this.router.post('/recuperar', async (req, res) => {
      try {
        const { correo } = req.body;
        const resultado = await usuariosBO.solicitarRecuperacionContrasena(correo);

        emailService.enviarCorreoRecuperacion(correo, resultado.tokenRecuperacion, resultado.nombre
        ).catch(err => console.error("Error asíncrono enviando correo:", err));
        res.status(201).json({ exito: true, data: resultado });
      }catch (error){
        res.status(401).json({ exito: false, mensaje: error.message});
      }
    });

    // Cambiar / Resetear contrasena
    this.router.put('/contrasena', async (req, res) => {
      try {
        const { usuarioId, nuevaContrasena } = req.body;
        const resultado = await usuariosBO.resetearContrasena(usuarioId, nuevaContrasena);
        res.status(200).json({ exito: true, data: resultado });
      } catch (error) {
        res.status(400).json({ exito: false, mensaje: error.message });
      }
    });

    // Asignar rol a un usuario (Protegido por Middleware)
    // Esto es para la autenticacion de token para guardar lo de usuario creación en la bd con el token
    this.router.post('/roles', authMiddleware, async (req, res) => {
      try {
        const { usuarioId, rol } = req.body;

        const usuarioModificacion = req.usuario.sub;

        const resultado = await usuariosBO.asignarRol(usuarioId, rol, usuarioModificacion);
        res.status(200).json({ exito: true, data: resultado });
      } catch (error) {
        res.status(400).json({ exito: false, mensaje: error.message });
      }
    });

    // Quitar rol a un usuario (Protegido por Middleware) 
    // Esto es para la autenticacion de token para guardar lo de usuario creación en la bd con el token
    this.router.delete('/roles', authMiddleware, async (req, res) => {
      try {
        const { usuarioId, rol } = req.body;

        const resultado = await usuariosBO.quitarRol(usuarioId, rol);
        res.status(200).json({ exito: true, data: resultado });
      } catch (error) {
        res.status(400).json({ exito: false, mensaje: error.message });
      }
    });
  }
}

module.exports = UsuariosAPI;
