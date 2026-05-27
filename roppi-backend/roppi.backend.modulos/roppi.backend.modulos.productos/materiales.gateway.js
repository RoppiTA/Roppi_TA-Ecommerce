// modulos/productos/materiales.gateway.js
const db = require('../../roppi.backend.config/database.js');

class MaterialesGateway {

  async listarTodos() {
    const result = await db.query(`
      SELECT * FROM "RoppiTA".MATERIALES
    `);
    return result.rows;
  }

  async create({ nombre, descripcion, costoExtra, usuarioId }) {
    const result = await db.query(`
      INSERT INTO "RoppiTA".MATERIALES
        (NOMBRE, DESCRIPCION, COSTO_EXTRA, USUARIO_CREACION, USUARIO_MODIFICACION)
      VALUES ($1, $2, $3, $4, $4)
      RETURNING *
    `, [nombre, descripcion, costoExtra, usuarioId]);
    return result.rows[0];
  }

  async update(id, { nombre, descripcion, costoExtra, usuarioId }) {
    const result = await db.query(`
      UPDATE "RoppiTA".MATERIALES
      SET NOMBRE = $1,
          DESCRIPCION = $2,
          COSTO_EXTRA = $3,
          USUARIO_MODIFICACION = $4,
          FECHA_MODIFICACION = CURRENT_TIMESTAMP
      WHERE ID = $5
      RETURNING *
    `, [nombre, descripcion, costoExtra, usuarioId, id]);
    return result.rows[0];
  }

}

module.exports = new MaterialesGateway();