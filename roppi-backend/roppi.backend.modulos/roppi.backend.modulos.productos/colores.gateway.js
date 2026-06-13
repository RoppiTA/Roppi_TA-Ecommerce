// modulos/productos/colores.gateway.js
const db = require('../../roppi.backend.config/database.js');
class ColoresGateway {

  async findAll() {
    const result = await db.query(`
      SELECT * FROM "RoppiTA".COLORES
      WHERE ACTIVO = 1
    `);
    return result.rows;
  }

  async findById(id) {
    const result = await db.query(`
      SELECT * FROM "RoppiTA".COLORES
      WHERE ID = $1
    `, [id]);
    return result.rows[0];
  }

  async create({ nombre, pantone, usuarioId }) {
    const result = await db.query(`
      INSERT INTO "RoppiTA".COLORES
        (NOMBRE, PANTONE, USUARIO_CREACION, USUARIO_MODIFICACION)
      VALUES ($1, $2, $3, $3)
      RETURNING *
    `, [nombre, pantone, usuarioId]);
    return result.rows[0];
  }

  async update(id, { nombre, pantone, usuarioId }) {
    const result = await db.query(`
      UPDATE "RoppiTA".COLORES
      SET NOMBRE = $1,
          PANTONE = $2,
          USUARIO_MODIFICACION = $3,
          FECHA_MODIFICACION = CURRENT_TIMESTAMP
      WHERE ID = $4
      RETURNING *
    `, [nombre, pantone, usuarioId, id]);
    return result.rows[0];
  }

  async deactivate(id, usuarioId) {
    const result = await db.query(`
      UPDATE "RoppiTA".COLORES
      SET ACTIVO = 0,
          USUARIO_MODIFICACION = $1,
          FECHA_MODIFICACION = CURRENT_TIMESTAMP
      WHERE ID = $2
      RETURNING *
    `, [usuarioId, id]);
    return result.rows[0];
  }

}

module.exports = new ColoresGateway();