// roppi.backend.modulos/roppi.backend.mod.productos/personalizados.gateway.js
const db = require('../../roppi.backend.config/database');

class PersonalizadosGateway {

  async findAll() {
    const result = await db.query(`
      SELECT p.*,
             g.NOMBRE AS generico,
             t.NOMBRE AS tamano,
             c.NOMBRE AS color,
             m.NOMBRE AS material,
             pe.NOMBRE AS personalizacion
      FROM "RoppiTA".PERSONALIZADOS p
      JOIN "RoppiTA".GENERICOS g ON p.ID_GENERICO = g.ID
      JOIN "RoppiTA".TAMANOS t ON p.ID_TAMANO = t.ID
      JOIN "RoppiTA".COLORES c ON p.ID_COLOR = c.ID
      JOIN "RoppiTA".MATERIALES m ON p.ID_MATERIAL = m.ID
      JOIN "RoppiTA".PERSONALIZACIONES pe ON p.ID_PERSONALIZACION = pe.ID
    `);
    return result.rows;
  }

  async findById(id) {
    const result = await db.query(`
      SELECT p.*,
             g.NOMBRE AS generico,
             t.NOMBRE AS tamano,
             c.NOMBRE AS color,
             m.NOMBRE AS material,
             pe.NOMBRE AS personalizacion
      FROM "RoppiTA".PERSONALIZADOS p
      JOIN "RoppiTA".GENERICOS g ON p.ID_GENERICO = g.ID
      JOIN "RoppiTA".TAMANOS t ON p.ID_TAMANO = t.ID
      JOIN "RoppiTA".COLORES c ON p.ID_COLOR = c.ID
      JOIN "RoppiTA".MATERIALES m ON p.ID_MATERIAL = m.ID
      JOIN "RoppiTA".PERSONALIZACIONES pe ON p.ID_PERSONALIZACION = pe.ID
      WHERE p.ID = $1
    `, [id]);
    return result.rows[0];
  }

  async findBySku(sku) {
    const result = await db.query(`
      SELECT * FROM "RoppiTA".PERSONALIZADOS
      WHERE SKU = $1
    `, [sku]);
    return result.rows[0];
  }

  async findByGenerico(idGenerico) {
    const result = await db.query(`
      SELECT * FROM "RoppiTA".PERSONALIZADOS
      WHERE ID_GENERICO = $1
    `, [idGenerico]);
    return result.rows;
  }

  async existsCombinacion({ idGenerico, idTamano, idColor, idMaterial, idPersonalizacion }) {
    const result = await db.query(`
      SELECT ID FROM "RoppiTA".PERSONALIZADOS
      WHERE ID_GENERICO = $1
        AND ID_TAMANO = $2
        AND ID_COLOR = $3
        AND ID_MATERIAL = $4
        AND ID_PERSONALIZACION = $5
    `, [idGenerico, idTamano, idColor, idMaterial, idPersonalizacion]);
    return result.rows.length > 0;
  }

  async create({ idGenerico, idTamano, idColor, idMaterial, idPersonalizacion, sku, precio, usuarioId }) {
    const result = await db.query(`
      INSERT INTO "RoppiTA".PERSONALIZADOS
        (ID_GENERICO, ID_TAMANO, ID_COLOR, ID_MATERIAL, ID_PERSONALIZACION,
         SKU, PRECIO, USUARIO_CREACION, USUARIO_MODIFICACION)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
      RETURNING *
    `, [idGenerico, idTamano, idColor, idMaterial, idPersonalizacion, sku, precio, usuarioId]);
    return result.rows[0];
  }

  async updatePrecio(id, { precio, usuarioId }) {
    const result = await db.query(`
      UPDATE "RoppiTA".PERSONALIZADOS
      SET PRECIO = $1,
          USUARIO_MODIFICACION = $2,
          FECHA_MODIFICACION = CURRENT_TIMESTAMP
      WHERE ID = $3
      RETURNING *
    `, [precio, usuarioId, id]);
    return result.rows[0];
  }

}

module.exports = new PersonalizadosGateway();