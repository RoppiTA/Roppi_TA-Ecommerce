// roppi.backend.modulos/roppi.backend.mod.productos/genericos.gateway.js
const db = require('../../roppi.backend.config/database');

class GenericosGateway {

  // ─── PRODUCTOS GENERICOS ───────────────────────────────────────────

  async findAll() {
    const result = await db.query(`
      SELECT * FROM "RoppiTA".GENERICOS
      WHERE ACTIVO = 1
    `);
    return result.rows;
  }

  async findById(id) {
    const result = await db.query(`
      SELECT * FROM "RoppiTA".GENERICOS
      WHERE ID = $1
    `, [id]);
    return result.rows[0];
  }

  async create({ nombre, descripcion, precioBase, maximoStock, usuarioId }) {
    const result = await db.query(`
      INSERT INTO "RoppiTA".GENERICOS
        (NOMBRE, DESCRIPCION, PRECIO_BASE, MAXIMO_STOCK, USUARIO_CREACION, USUARIO_MODIFICACION)
      VALUES ($1, $2, $3, $4, $5, $5)
      RETURNING *
    `, [nombre, descripcion, precioBase, maximoStock, usuarioId]);
    return result.rows[0];
  }

  async update(id, { nombre, descripcion, precioBase, maximoStock, usuarioId }) {
    const result = await db.query(`
      UPDATE "RoppiTA".GENERICOS
      SET NOMBRE = $1,
          DESCRIPCION = $2,
          PRECIO_BASE = $3,
          MAXIMO_STOCK = $4,
          USUARIO_MODIFICACION = $5,
          FECHA_MODIFICACION = CURRENT_TIMESTAMP
      WHERE ID = $6
      RETURNING *
    `, [nombre, descripcion, precioBase, maximoStock, usuarioId, id]);
    return result.rows[0];
  }

  async deactivate(id, usuarioId) {
    const result = await db.query(`
      UPDATE "RoppiTA".GENERICOS
      SET ACTIVO = 0,
          USUARIO_MODIFICACION = $1,
          FECHA_MODIFICACION = CURRENT_TIMESTAMP
      WHERE ID = $2
      RETURNING *
    `, [usuarioId, id]);
    return result.rows[0];
  }

  // ─── GENERICOSXTAMANOS (tamaños asociados al producto genérico)───────────────────────────────────

  async findTamanosByGenerico(idGenerico) {
    const result = await db.query(`
      SELECT t.*, gt.ALTO, gt.ANCHO
      FROM "RoppiTA".GENERICOSXTAMANOS gt
      JOIN "RoppiTA".TAMANOS t ON gt.ID_TAMANO = t.ID
      WHERE gt.ID_GENERICO = $1
    `, [idGenerico]);
    return result.rows;
  }

  async addTamano({ idGenerico, idTamano, alto, ancho, usuarioId }) {
    const result = await db.query(`
      INSERT INTO "RoppiTA".GENERICOSXTAMANOS
        (ID_GENERICO, ID_TAMANO, ALTO, ANCHO, USUARIO_CREACION, USUARIO_MODIFICACION)
      VALUES ($1, $2, $3, $4, $5, $5)
      RETURNING *
    `, [idGenerico, idTamano, alto, ancho, usuarioId]);
    return result.rows[0];
  }

  async removeTamano(idGenerico, idTamano) {
    const result = await db.query(`
      DELETE FROM "RoppiTA".GENERICOSXTAMANOS
      WHERE ID_GENERICO = $1 AND ID_TAMANO = $2
      RETURNING *
    `, [idGenerico, idTamano]);
    return result.rows[0];
  }

  // ─── GENERICOSXMATERIALES (materiales asociados al producto genérico)────────────────────────────────

  async findMaterialesByGenerico(idGenerico) {
    const result = await db.query(`
      SELECT m.*, gm.COSTO_EXTRA
      FROM "RoppiTA".GENERICOSXMATERIALES gm
      JOIN "RoppiTA".MATERIALES m ON gm.ID_MATERIAL = m.ID
      WHERE gm.ID_GENERICO = $1
    `, [idGenerico]);
    return result.rows;
  }

  async addMaterial({ idGenerico, idMaterial, costoExtra, usuarioId }) {
    const result = await db.query(`
      INSERT INTO "RoppiTA".GENERICOSXMATERIALES
        (ID_GENERICO, ID_MATERIAL, COSTO_EXTRA, USUARIO_CREACION, USUARIO_MODIFICACION)
      VALUES ($1, $2, $3, $4, $4)
      RETURNING *
    `, [idGenerico, idMaterial, costoExtra, usuarioId]);
    return result.rows[0];
  }

  async removeMaterial(idGenerico, idMaterial) {
    const result = await db.query(`
      DELETE FROM "RoppiTA".GENERICOSXMATERIALES
      WHERE ID_GENERICO = $1 AND ID_MATERIAL = $2
      RETURNING *
    `, [idGenerico, idMaterial]);
    return result.rows[0];
  }

  // ─── GENERICOSXCOLORES (colores asociados al producto genérico)───────────────────────────────────

  async findColoresByGenerico(idGenerico) {
    const result = await db.query(`
      SELECT c.*
      FROM "RoppiTA".GENERICOSXCOLORES gc
      JOIN "RoppiTA".COLORES c ON gc.ID_COLOR = c.ID
      WHERE gc.ID_GENERICO = $1
    `, [idGenerico]);
    return result.rows;
  }

  async addColor({ idGenerico, idColor, usuarioId }) {
    const result = await db.query(`
      INSERT INTO "RoppiTA".GENERICOSXCOLORES
        (ID_GENERICO, ID_COLOR, USUARIO_CREACION, USUARIO_MODIFICACION)
      VALUES ($1, $2, $3, $3)
      RETURNING *
    `, [idGenerico, idColor, usuarioId]);
    return result.rows[0];
  }

  async removeColor(idGenerico, idColor) {
    const result = await db.query(`
      DELETE FROM "RoppiTA".GENERICOSXCOLORES
      WHERE ID_GENERICO = $1 AND ID_COLOR = $2
      RETURNING *
    `, [idGenerico, idColor]);
    return result.rows[0];
  }

  // ─── GENERICOSXPERSONALIZACIONES (personalizaciones asociadas al producto genérico)───────────────────────────────────

  async findPersonalizacionesByGenerico(idGenerico) {
    const result = await db.query(`
      SELECT p.*, gp.COSTO_EXTRA
      FROM "RoppiTA".GENERICOSXPERSONALIZACIONES gp
      JOIN "RoppiTA".PERSONALIZACIONES p ON gp.ID_PERSONALIZACION = p.ID
      WHERE gp.ID_GENERICO = $1
    `, [idGenerico]);
    return result.rows;
  }

  async addPersonalizacion({ idGenerico, idPersonalizacion, costoExtra, usuarioId }) {
    const result = await db.query(`
      INSERT INTO "RoppiTA".GENERICOSXPERSONALIZACIONES
        (ID_GENERICO, ID_PERSONALIZACION, COSTO_EXTRA, USUARIO_CREACION, USUARIO_MODIFICACION)
      VALUES ($1, $2, $3, $4, $4)
      RETURNING *
    `, [idGenerico, idPersonalizacion, costoExtra, usuarioId]);
    return result.rows[0];
  }

  async removePersonalizacion(idGenerico, idPersonalizacion) {
    const result = await db.query(`
      DELETE FROM "RoppiTA".GENERICOSXPERSONALIZACIONES
      WHERE ID_GENERICO = $1 AND ID_PERSONALIZACION = $2
      RETURNING *
    `, [idGenerico, idPersonalizacion]);
    return result.rows[0];
  }

}

module.exports = new GenericosGateway();