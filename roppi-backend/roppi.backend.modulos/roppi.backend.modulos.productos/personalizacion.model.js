// roppi.backend.modulos/roppi.backend.mod.productos/personalizado.model.js
// atributo de auditoria
class Personalizado {
  constructor({ id, id_generico, id_tamano, id_color, id_material, id_personalizacion,
                sku, precio, generico, tamano, color, material, personalizacion,
                fecha_creacion, usuario_creacion,
                fecha_modificacion, usuario_modificacion }) {
    this.id = id;
    this.idGenerico = id_generico;
    this.idTamano = id_tamano;
    this.idColor = id_color;
    this.idMaterial = id_material;
    this.idPersonalizacion = id_personalizacion;
    this.sku = sku;
    this.precio = precio;
    //de la relación?
    this.generico = generico || null;
    this.tamano = tamano || null;
    this.color = color || null;
    this.material = material || null;
    this.personalizacion = personalizacion || null;
    // Auditoría
    this.fechaCreacion = fecha_creacion;
    this.usuarioCreacion = usuario_creacion;
    this.fechaModificacion = fecha_modificacion;
    this.usuarioModificacion = usuario_modificacion;
  }
}

module.exports = Personalizado;

module.exports = Personalizacion;