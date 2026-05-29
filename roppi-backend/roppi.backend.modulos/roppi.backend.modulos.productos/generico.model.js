// roppi.backend.modulos/roppi.backend.mod.productos/generico.model.js

//atributo de auditoria
class Generico {
  constructor({ id, nombre, descripcion, precio_base, maximo_stock, activo,
                fecha_creacion, usuario_creacion,
                fecha_modificacion, usuario_modificacion }) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.precioBase = precio_base;
    this.maximoStock = maximo_stock;
    this.activo = activo;
    // Relaciones opcionales
    this.tamanos = [];
    this.materiales = [];
    this.colores = [];
    this.personalizaciones = [];
    //this.personalizados = [];
    // Auditoría
    this.fechaCreacion = fecha_creacion;
    this.usuarioCreacion = usuario_creacion;
    this.fechaModificacion = fecha_modificacion;
    this.usuarioModificacion = usuario_modificacion;
  }
}

module.exports = Generico;