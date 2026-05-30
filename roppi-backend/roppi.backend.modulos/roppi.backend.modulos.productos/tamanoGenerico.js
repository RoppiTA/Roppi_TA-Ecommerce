// roppi.backend.modulos/roppi.backend.mod.productos/genericoTamano.model.js
class GenericoTamano {
  constructor({ id, nombre, descripcion, activo,
                alto, ancho,
                fecha_creacion, usuario_creacion,
                fecha_modificacion, usuario_modificacion }) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.activo = activo;
    // Atributos propios de la relación
    this.alto = alto;
    this.ancho = ancho;
    // Auditoría
    this.fechaCreacion = fecha_creacion;
    this.usuarioCreacion = usuario_creacion;
    this.fechaModificacion = fecha_modificacion;
    this.usuarioModificacion = usuario_modificacion;
  }
}

module.exports = GenericoTamano;