// roppi.backend.modulos/roppi.backend.modulos.usuarios/usuario.bo.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuariosGateway = require('./usuario.gateway.js');
const Usuario = require('./usuario.model.js');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_aqui';
const SALT_ROUNDS = 10;

class UsuariosBO {

  /**
   * Validar formato de email
   */
  validarEmail(correo) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
  }

  /**
   * Validar fortaleza de contraseña
   * Mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número
   */
  validarContraseña(contraseña) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return regex.test(contraseña);
  }

  /**
   * Hash de contraseña con bcrypt
   */
  async hashContraseña(contraseña) {
    try {
      return await bcrypt.hash(contraseña, SALT_ROUNDS);
    } catch (error) {
      throw new Error('Error al encriptar contraseña: ' + error.message);
    }
  }

  /**
   * Comparar contraseña plana con hash
   */
  async compararContraseña(contraseña, hash) {
    try {
      return await bcrypt.compare(contraseña, hash);
    } catch (error) {
      throw new Error('Error al comparar contraseña: ' + error.message);
    }
  }

  /**
   * Generar JWT token
   */
  generarJWT(usuarioId, rol = 'cliente') {
    try {
      const token = jwt.sign(
        {
          sub: usuarioId,           // ID del usuario
          rol: rol,                 // Rol del usuario
          iat: Math.floor(Date.now() / 1000),
        },
        JWT_SECRET,
        {
          expiresIn: '24h',         // Expira en 24 horas
          algorithm: 'HS256'
        }
      );
      return token;
    } catch (error) {
      throw new Error('Error al generar JWT: ' + error.message);
    }
  }

  /**
   * Generar token de activación/recuperación (short-lived, 1 hora)
   */
  generarTokenTemporal(usuarioId) {
    try {
      const token = jwt.sign(
        { sub: usuarioId },
        JWT_SECRET,
        {
          expiresIn: '1h',
          algorithm: 'HS256'
        }
      );
      return token;
    } catch (error) {
      throw new Error('Error al generar token temporal: ' + error.message);
    }
  }

  /**
   * Verificar JWT token
   */
  verificarJWT(token) {
    try {
      return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    } catch (error) {
      throw new Error('Token inválido o expirado: ' + error.message);
    }
  }

  /**
   * Crear nuevo usuario
   */
  async crearUsuario({ nombre, correo, contraseña, numeroDocumento, tipoDocumento }) {
    try {
      // Validaciones
      if (!nombre || nombre.trim() === '') {
        throw new Error('El nombre es requerido');
      }

      if (!this.validarEmail(correo)) {
        throw new Error('El correo electrónico no es válido');
      }

      if (!this.validarContraseña(contraseña)) {
        throw new Error('La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula y 1 número');
      }

      if (!numeroDocumento || numeroDocumento.trim() === '') {
        throw new Error('El número de documento es requerido');
      }

      if (!['DNI', 'CE', 'RUC'].includes(tipoDocumento)) {
        throw new Error('Tipo de documento inválido. Debe ser DNI, CE o RUC');
      }

      // Verificar duplicados
      const correoExiste = await usuariosGateway.existeCorreo(correo);
      if (correoExiste) {
        throw new Error('El correo electrónico ya está registrado');
      }

      const documentoExiste = await usuariosGateway.existeNumeroDocumento(numeroDocumento);
      if (documentoExiste) {
        throw new Error('El número de documento ya está registrado');
      }

      // Hash de contraseña
      const contraseñaHash = await this.hashContraseña(contraseña);

      // Crear usuario en BD
      const usuarioBD = await usuariosGateway.create({
        nombre,
        correo,
        contraseña: contraseñaHash,
        numeroDocumento,
        tipoDocumento
      });

      // Generar token de activación
      const tokenActivacion = this.generarTokenTemporal(usuarioBD.id);

      // Mapear a modelo
      const usuario = new Usuario(usuarioBD);

      return {
        usuario,
        tokenActivacion,
        mensaje: 'Cuenta creada exitosamente. Verifica tu correo para activarla.'
      };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Activar cuenta de usuario
   */
  async activarUsuario(usuarioId) {
    try {
      const usuarioBD = await usuariosGateway.activar(usuarioId);
      if (!usuarioBD) {
        throw new Error('Usuario no encontrado');
      }
      const usuario = new Usuario(usuarioBD);
      return {
        usuario,
        mensaje: 'Cuenta activada exitosamente'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar credenciales (Login)
   */
  async verificarCredenciales(correo, contraseña) {
    try {
      if (!correo || !contraseña) {
        throw new Error('Correo y contraseña son requeridos');
      }

      // Buscar usuario por correo
      const usuarioBD = await usuariosGateway.findByCorreo(correo);
      if (!usuarioBD) {
        throw new Error('Correo o contraseña incorrectos');
      }

      // Verificar que esté activo
      if (usuarioBD.activo !== 1) {
        throw new Error('La cuenta no está activa. Verifica tu correo');
      }

      // Comparar contraseña
      const contraseñaValida = await this.compararContraseña(contraseña, usuarioBD.contraseña);
      if (!contraseñaValida) {
        throw new Error('Correo o contraseña incorrectos');
      }

      // Generar JWT
      const token = this.generarJWT(usuarioBD.id);
      const usuario = new Usuario(usuarioBD);

      // NO devolver la contraseña
      delete usuario.contraseña;

      return {
        token,
        usuario,
        mensaje: 'Inicio de sesión exitoso'
      };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Solicitar recuperación de contraseña
   */
  async solicitarRecuperacionContraseña(correo) {
    try {
      if (!correo) {
        throw new Error('Correo requerido');
      }

      const usuarioBD = await usuariosGateway.findByCorreo(correo);
      if (!usuarioBD) {
        // No revelar si existe o no por seguridad
        return {
          mensaje: 'Si el correo existe, se ha enviado un enlace de recuperación'
        };
      }

      // Generar token temporal
      const tokenRecuperacion = this.generarTokenTemporal(usuarioBD.id);

      return {
        usuarioId: usuarioBD.id,
        tokenRecuperacion,
        mensaje: 'Token de recuperación generado'
      };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Resetear contraseña
   */
  async resetearContraseña(usuarioId, contraseñaNueva) {
    try {
      if (!contraseñaNueva) {
        throw new Error('La nueva contraseña es requerida');
      }

      if (!this.validarContraseña(contraseñaNueva)) {
        throw new Error('La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula y 1 número');
      }

      // Verificar que el usuario existe
      const usuarioBD = await usuariosGateway.findById(usuarioId);
      if (!usuarioBD) {
        throw new Error('Usuario no encontrado');
      }

      // Hash nueva contraseña
      const contraseñaHash = await this.hashContraseña(contraseñaNueva);

      // Actualizar en BD
      const usuarioActualizado = await usuariosGateway.actualizarContraseña(usuarioId, contraseñaHash);
      const usuario = new Usuario(usuarioActualizado);

      return {
        usuario,
        mensaje: 'Contraseña actualizada exitosamente'
      };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener información de usuario (sin mostrar contraseña)
   */
  async obtenerUsuario(usuarioId) {
    try {
      const usuarioBD = await usuariosGateway.findById(usuarioId);
      if (!usuarioBD) {
        throw new Error('Usuario no encontrado');
      }

      const usuario = new Usuario(usuarioBD);
      delete usuario.contraseña; // Nunca devolver contraseña

      return usuario;

    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UsuariosBO();
