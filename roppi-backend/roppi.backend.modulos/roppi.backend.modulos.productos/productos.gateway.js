// roppi.backend.modulos.products/productos.gateway.js
const db = require('../../roppi.backend.config/database.js');

class ProductosGateway {

  async listarTodos() {
    const result = await db.query(`
      SELECT p.*,
             c.NOMBRE AS categoria,
             t.NOMBRE AS tamano,
             col.NOMBRE AS color,
             m.NOMBRE AS material
      FROM "RoppiTA".PRODUCTOS p
      JOIN "RoppiTA".CATEGORIAS c ON p.ID_CATEGORIA = c.ID
      JOIN "RoppiTA".TAMANOS t ON p.ID_TAMANO = t.ID
      JOIN "RoppiTA".COLORES col ON p.ID_COLOR = col.ID
      JOIN "RoppiTA".MATERIALES m ON p.ID_MATERIAL = m.ID
      WHERE p.ACTIVO = 1
    `);
    return result.rows;
  }

  async buscarId(id) {
    const result = await db.query(`
      SELECT p.*,
             c.NOMBRE AS categoria,
             t.NOMBRE AS tamano,
             col.NOMBRE AS color,
             m.NOMBRE AS material
      FROM "RoppiTA".PRODUCTOS p
      JOIN "RoppiTA".CATEGORIAS c ON p.ID_CATEGORIA = c.ID
      JOIN "RoppiTA".TAMANOS t ON p.ID_TAMANO = t.ID
      JOIN "RoppiTA".COLORES col ON p.ID_COLOR = col.ID
      JOIN "RoppiTA".MATERIALES m ON p.ID_MATERIAL = m.ID
      WHERE p.ID = $1
    `, [id]);
    return result.rows[0];
  }

  async BuscarCategoria(idCategoria) {
    const result = await db.query(`
      SELECT * FROM "RoppiTA".PRODUCTOS
      WHERE ID_CATEGORIA = $1 AND ACTIVO = 1
    `, [idCategoria]);
    return result.rows;
  }

  async create({ idCategoria, idTamano, idColor, idMaterial, idPersonalizacion, sku, precio, usuarioId }) {
    const result = await db.query(`
      INSERT INTO "RoppiTA".PRODUCTOS
        (ID_CATEGORIA, ID_TAMANO, ID_COLOR, ID_MATERIAL, ID_PERSONALIZACION,
         SKU, PRECIO, ACTIVO, USUARIO_CREACION, USUARIO_MODIFICACION)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 1, $8, $8)
      RETURNING *
    `, [idCategoria, idTamano, idColor, idMaterial, idPersonalizacion, sku, precio, usuarioId]);
    return result.rows[0];
  }

  async update(id, { precio, usuarioId }) {
    const result = await db.query(`
      UPDATE "RoppiTA".PRODUCTOS
      SET PRECIO = $1,
          USUARIO_MODIFICACION = $2,
          FECHA_MODIFICACION = CURRENT_TIMESTAMP
      WHERE ID = $3
      RETURNING *
    `, [precio, usuarioId, id]);
    return result.rows[0];
  }

  async eliminarLogico(id, usuarioId) {
    const result = await db.query(`
      UPDATE "RoppiTA".PRODUCTOS
      SET ACTIVO = 0,
          USUARIO_MODIFICACION = $1,
          FECHA_MODIFICACION = CURRENT_TIMESTAMP
      WHERE ID = $2
      RETURNING *
    `, [usuarioId, id]);
    return result.rows[0];
  }

}

module.exports = new ProductosGateway();