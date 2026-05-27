// modulos/productos/tamanos.gateway.js
const db = require('../../roppi.backend.config/database.js');

class TamanosGateway {

  async listarTodos() {
    const result = await db.query(
        ` SELECT * FROM "RoppiTA".TAMANOS`);
    return result.rows;
  }

  async buscarID(id) {
    const result = await db.query(`SELECT * FROM 
        "RoppiTA".TAMANOS
      WHERE ID = $1`, [id]);
    return result.rows[0];
  }

  async create({ idCategoria, nombre, costoExtra, usuarioId }) {
    const result = await db.query(
        `INSERT INTO "RoppiTA".TAMANOS
        (ID_CATEGORIA, NOMBRE, COSTO_EXTRA, USUARIO_CREACION, USUARIO_MODIFICACION)
      VALUES ($1, $2, $3, $4, $4)
      RETURNING *`,
      [idCategoria, nombre, costoExtra, usuarioId]);
    return result.rows[0];
  }

  async update(id, { nombre, costoExtra, usuarioId }) {
    const result = await db.query(
        `UPDATE "RoppiTA".TAMANOS
        SET NOMBRE = $1,
          COSTO_EXTRA = $2,
          USUARIO_MODIFICACION = $3,
          FECHA_MODIFICACION = CURRENT_TIMESTAMP
      WHERE ID = $4
      RETURNING *`,
      [nombre, costoExtra, usuarioId, id]);
    return result.rows[0];
  }

    async buscaPorCategoria(idCategoria) {
    const result = await db.query(`
      SELECT * FROM "RoppiTA".TAMANOS
      WHERE ID_CATEGORIA = $1
    `, [idCategoria]);
    return result.rows;
  }

}

module.exports = new TamanosGateway();