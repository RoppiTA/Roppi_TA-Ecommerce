// modulos/productos/medidas.gateway.js
const db = require('../../roppi.backend.config/database.js');

class MedidasGateway {

  async listarTodos() {
    const result = await db.query(`
      SELECT * FROM "RoppiTA".MEDIDAS
    `);
    return result.rows;
  }

  async buscarId(id) {
    const result = await db.query(`
      SELECT * FROM "RoppiTA".MEDIDAS
      WHERE ID = $1
    `, [id]);
    return result.rows[0];
  }

  async buscarCategoria(idCategoria) {
    const result = await db.query(`
      SELECT * FROM "RoppiTA".MEDIDAS
      WHERE ID_CATEGORIA = $1
    `, [idCategoria]);
    return result.rows;
  }

  async create({ idCategoria, nombre, descripcion, usuarioId }) {
    const result = await db.query(`
      INSERT INTO "RoppiTA".MEDIDAS
        (ID_CATEGORIA, NOMBRE, DESCRIPCION, USUARIO_CREACION, USUARIO_MODIFICACION)
      VALUES ($1, $2, $3, $4, $4)
      RETURNING *
    `, [idCategoria, nombre, descripcion, usuarioId]);
    return result.rows[0];
  }

  async update(id, { nombre, descripcion, usuarioId }) {
    const result = await db.query(`
      UPDATE "RoppiTA".MEDIDAS
      SET NOMBRE = $1,
          DESCRIPCION = $2,
          USUARIO_MODIFICACION = $3,
          FECHA_MODIFICACION = CURRENT_TIMESTAMP
      WHERE ID = $4
      RETURNING *
    `, [nombre, descripcion, usuarioId, id]);
    return result.rows[0];
  }

}

module.exports = new MedidasGateway();