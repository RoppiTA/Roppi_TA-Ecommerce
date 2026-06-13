// modulos/productos/materiales.gateway.js
const db = require('../../roppi.backend.config/database.js');
class MaterialesGateway {

  async findAll() {
    const result = await db.query(`
      SELECT * FROM "RoppiTA".MATERIALES
      WHERE ACTIVO = 1
    `);
    return result.rows;
  }

  async findById(id) {
    const result = await db.query(`
      SELECT * FROM "RoppiTA".MATERIALES
      WHERE ID = $1
    `, [id]);
    return result.rows[0];
  }

  async create({ nombre, descripcion, usuarioId }) {
    const result = await db.query(`
      INSERT INTO "RoppiTA".MATERIALES
        (NOMBRE, DESCRIPCION, USUARIO_CREACION, USUARIO_MODIFICACION)
      VALUES ($1, $2, $3, $3)
      RETURNING *
    `, [nombre, descripcion, usuarioId]);
    return result.rows[0];
  }

  async update(id, { nombre, descripcion, usuarioId }) {
    const result = await db.query(`
      UPDATE "RoppiTA".MATERIALES
      SET NOMBRE = $1,
          DESCRIPCION = $2,
          USUARIO_MODIFICACION = $3,
          FECHA_MODIFICACION = CURRENT_TIMESTAMP
      WHERE ID = $4
      RETURNING *
    `, [nombre, descripcion, usuarioId, id]);
    return result.rows[0];
  }

  async deactivate(id, usuarioId) {
    const result = await db.query(`
      UPDATE "RoppiTA".MATERIALES
      SET ACTIVO = 0,
          USUARIO_MODIFICACION = $1,
          FECHA_MODIFICACION = CURRENT_TIMESTAMP
      WHERE ID = $2
      RETURNING *
    `, [usuarioId, id]);
    return result.rows[0];
  }

}

module.exports = new MaterialesGateway();