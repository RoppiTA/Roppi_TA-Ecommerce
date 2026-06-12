// roppi.backend.modulos/roppi.backend.modulos.usuarios/usuario.model.js

/**
 * Modelo de Usuario
 * Mapea la estructura de la tabla 'usuario' de la base de datos
 */
class Usuario {
  constructor({
    id,
    nombre,
    correo,
    contrasena,
    numero_documento,
    tipo_documento,
    activo = 1,
    fecha_creacion,
    usuario_creacion,
    fecha_modificacion,
    usuario_modificacion,
    roles = []
  }) {
    this.id = id;
    this.nombre = nombre; // Nombre completo del usuario
    this.correo = correo; // Correo electrónico
    this.contrasena = contrasena; // Hash bcrypt de la contraseña
    this.numero_documento = numero_documento; // Documento de identidad
    this.tipo_documento = tipo_documento; // ENUM: 'DNI', 'CE', 'RUC'
    this.activo = activo; // 1 = activo, 0 = inactivo
    this.fecha_creacion = fecha_creacion || new Date();
    this.usuario_creacion = usuario_creacion;
    this.fecha_modificacion = fecha_modificacion;
    this.usuario_modificacion = usuario_modificacion; // ID del usuario que modificó
    this.roles = roles; // Roles del usuario
  }
}

module.exports = Usuario;
