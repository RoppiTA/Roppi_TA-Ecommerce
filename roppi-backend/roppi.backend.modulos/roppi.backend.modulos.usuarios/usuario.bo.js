// roppi.backend.modulos/roppi.backend.modulos.usuarios/usuario.bo.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuariosGateway = require('./usuario.gateway.js');
const Usuario = require('./usuario.model.js');

const JWT_SECRET = process.env.JWT_SECRET || 'roppita123456';
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
   * Validar fortaleza de contrasena
   * Mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número
   */
  validarContrasena(contrasena) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return regex.test(contrasena);
  }

  /**
   * Hash de contrasena con bcrypt
   */
  async hashContrasena(contrasena) {
    try {
      return await bcrypt.hash(contrasena, SALT_ROUNDS);
    } catch (error) {
      throw new Error('Error al encriptar contrasena: ' + error.message);
    }
  }

  /**
   * Comparar contrasena plana con hash
   */
  async compararContrasena(contrasena, hash) {
    try {
      return await bcrypt.compare(contrasena, hash);
    } catch (error) {
      throw new Error('Error al comparar contrasena: ' + error.message);
    }
  }

  /**
   * Generar JWT token
   */
  generarJWT(usuarioId, nombre, roles = ['CLIENTE']) {
    try {
      const token = jwt.sign(
        {
          sub: usuarioId,           // ID del usuario
          nombre: nombre,           // Nombre del usuario
          roles: roles,             // Roles del usuario
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
  async crearUsuario({ nombre, correo, contrasena, numeroDocumento, tipoDocumento }) {
    try {
      // Validaciones
      if (!nombre || nombre.trim() === '') {
        throw new Error('El nombre es requerido');
      }

      if (!this.validarEmail(correo)) {
        throw new Error('El correo electrónico no es válido');
      }

      if (!this.validarContrasena(contrasena)) {
        throw new Error('La contrasena debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula y 1 número');
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

      // Hash de contrasena
      const contrasenaHash = await this.hashContrasena(contrasena);

      // Crear usuario en BD
      const usuarioBD = await usuariosGateway.create({
        nombre: nombre,
        correo: correo,
        contrasena: contrasenaHash,
        numeroDocumento: numeroDocumento,
        tipoDocumento: tipoDocumento
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
  async verificarCredenciales(correo, contrasena) {
    try {
      if (!correo || !contrasena) {
        throw new Error('Correo y contrasena son requeridos');
      }

      // Buscar usuario por correo
      const usuarioBD = await usuariosGateway.findByCorreo(correo);
      if (!usuarioBD) {
        throw new Error('Correo o contrasena incorrectos');
      }

      // Verificar que esté activo
      if (usuarioBD.activo !== 1) {
        throw new Error('La cuenta no está activa. Verifica tu correo');
      }
      
      // Comparar contrasena
      const contrasenaValida = await this.compararContrasena(contrasena, usuarioBD.contrasena);
      if (!contrasenaValida) {
        throw new Error('Correo o contrasena incorrectos');
      }

      // Generar JWT
      const token = this.generarJWT(usuarioBD.id, usuarioBD.nombre, usuarioBD.roles);
      const usuario = new Usuario(usuarioBD);

      // NO devolver la contrasena
      delete usuario.contrasena;

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
   * Solicitar recuperación de contrasena
   */
  async solicitarRecuperacionContrasena(correo) {
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
        nombre: usuarioBD.nombre,
        tokenRecuperacion,
        mensaje: 'Token de recuperación generado'
      };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Resetear contrasena
   */
  async resetearContrasena(usuarioId, contrasenaNueva) {
    try {
      if (!contrasenaNueva) {
        throw new Error('La nueva contrasena es requerida');
      }

      if (!this.validarContrasena(contrasenaNueva)) {
        throw new Error('La contrasena debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula y 1 número');
      }

      const usuarioBD = await usuariosGateway.findById(usuarioId);
      if (!usuarioBD) {
        throw new Error('Usuario no encontrado');
      }

      const contrasenaHash = await this.hashContrasena(contrasenaNueva);

      const usuarioActualizado = await usuariosGateway.actualizarContrasena(usuarioId, contrasenaHash);
      const usuario = new Usuario(usuarioActualizado);

      return {
        usuario,
        mensaje: 'Contrasena actualizada exitosamente'
      };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Asignar nuevo rol a un usuario, por si acaso hay que asignar más de un rol
   */
  async asignarRol(idUsuario, rol, usuarioModificacion = 1) {
    try {
      if (!idUsuario || !rol) {
        throw new Error('El ID del usuario y el rol son requeridos');
      }

      // Validar que el rol sea uno de los permitidos
      const rolesPermitidos = ['CLIENTE', 'COMERCIANTE', 'ADMINISTRADOR'];
      if (!rolesPermitidos.includes(rol)) {
        throw new Error(`Rol inválido. Debe ser uno de: ${rolesPermitidos.join(', ')}`);
      }

      const usuarioBD = await usuariosGateway.asignarRol(idUsuario, rol, usuarioModificacion);
      if (!usuarioBD) {
        throw new Error('Usuario no encontrado');
      }

      const usuario = new Usuario(usuarioBD);
      delete usuario.contrasena;

      return {
        usuario,
        mensaje: 'Rol asignado exitosamente'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
 * Quitar rol a un usuario
 */

  async quitarRol(idUsuario, rol) {
    try {
      if (!idUsuario || !rol) {
        throw new Error('El ID del usuario y el rol son requeridos');
      }

      const rolesPermitidos = ['CLIENTE', 'COMERCIANTE', 'ADMINISTRADOR'];
      if (!rolesPermitidos.includes(rol)) {
        throw new Error(`Rol inválido. Debe ser uno de: ${rolesPermitidos.join(', ')}`);
      }

      const usuarioBD = await usuariosGateway.quitarRol(idUsuario, rol);
      if (!usuarioBD) {
        throw new Error('Usuario no encontrado');
      }

      const usuario = new Usuario(usuarioBD);
      delete usuario.contrasena;

      return {
        usuario,
        mensaje: 'Rol eliminado exitosamente'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener información de usuario (sin mostrar contrasena)
   */
  async obtenerUsuario(usuarioId) {
    try {
      const usuarioBD = await usuariosGateway.findById(usuarioId);
      if (!usuarioBD) {
        throw new Error('Usuario no encontrado');
      }

      const usuario = new Usuario(usuarioBD);
      delete usuario.contrasena; // Nunca devolver contrasena

      return usuario;

    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UsuariosBO();
