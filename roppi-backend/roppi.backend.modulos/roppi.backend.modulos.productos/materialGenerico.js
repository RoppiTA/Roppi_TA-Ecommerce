// roppi.backend.modulos/roppi.backend.mod.productos/genericoMaterial.model.js
class GenericoMaterial {
  constructor({ id, nombre, descripcion, activo,
                costo_extra,
                fecha_creacion, usuario_creacion,
                fecha_modificacion, usuario_modificacion }) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.activo = activo;
    // Atributo propio de la relación
    this.costoExtra = costo_extra;
    // Auditoría
    this.fechaCreacion = fecha_creacion;
    this.usuarioCreacion = usuario_creacion;
    this.fechaModificacion = fecha_modificacion;
    this.usuarioModificacion = usuario_modificacion;
  }
}

module.exports = GenericoMaterial;