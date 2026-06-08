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
    contraseña,
    numero_documento,
    tipo_documento,
    activo = 1,
    fecha_creacion,
    usuario_creacion,
    fecha_modificacion,
    usuario_modificacion,
  }) {
    this.id = id;
    this.nombre = nombre; // Nombre completo del usuario
    this.correo = correo; // Correo electrónico
    this.contraseña = contraseña; // Hash bcrypt de la contraseña
    this.numero_documento = numero_documento; // Documento de identidad (string para RUC)
    this.tipo_documento = tipo_documento; // ENUM: 'DNI', 'CE', 'RUC'
    this.activo = activo; // 1 = activo, 0 = inactivo
    this.fecha_creacion = fecha_creacion || new Date();
    this.usuario_creacion = usuario_creacion; // ID del usuario que creó el registro
    this.fecha_modificacion = fecha_modificacion;
    this.usuario_modificacion = usuario_modificacion; // ID del usuario que modificó
  }
}

module.exports = Usuario;
