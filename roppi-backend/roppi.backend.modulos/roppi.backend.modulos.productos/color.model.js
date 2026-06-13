// roppi.backend.modulos/roppi.backend.mod.productos/color.model.js

//autibuto de auditoria
class Color {
  constructor({ id, nombre, pantone, activo,
                fecha_creacion, usuario_creacion,
                fecha_modificacion, usuario_modificacion }) {
    this.id = id;
    this.nombre = nombre;
    this.pantone = pantone;
    this.activo = activo;
    // Auditoría
    this.fechaCreacion = fecha_creacion;
    this.usuarioCreacion = usuario_creacion;
    this.fechaModificacion = fecha_modificacion;
    this.usuarioModificacion = usuario_modificacion;
  }
}

module.exports = Color;