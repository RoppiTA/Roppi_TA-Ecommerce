// roppi.backend.modulos/roppi.backend.mod.productos/personalizacion.model.js
class Personalizacion {
  constructor({ id, nombre, descripcion, activa,
                fecha_creacion, usuario_creacion,
                fecha_modificacion, usuario_modificacion }) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.activa = activa;
    this.fechaCreacion = fecha_creacion;
    this.usuarioCreacion = usuario_creacion;
    this.fechaModificacion = fecha_modificacion;
    this.usuarioModificacion = usuario_modificacion;
  }
}

module.exports = Personalizacion;