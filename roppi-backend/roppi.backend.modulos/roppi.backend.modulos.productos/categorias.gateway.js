// modulos/productos/categorias.gateway.js
const db = require('../../roppi.backend.config/database.js');

class CategoriasGateway {

  async listarTodos() {
    const result = await db.query(`
      SELECT * FROM "RoppiTA".CATEGORIAS
      WHERE ACTIVA = 1
    `);
    return result.rows;
  }

  async buscarID(id) {
    const result = await db.query(`
      SELECT * FROM "RoppiTA".CATEGORIAS
      WHERE ID = $1
    `, [id]);
    return result.rows[0];
  }

  async create({ nombre, descripcion, precioBase, maximoStock, usuarioId }) {
    const result = await db.query(`
      INSERT INTO "RoppiTA".CATEGORIAS
        (NOMBRE, DESCRIPCION, PRECIO_BASE, MAXIMO_STOCK, USUARIO_CREACION, USUARIO_MODIFICACION)
      VALUES ($1, $2, $3, $4, $5, $5)
      RETURNING *
    `, [nombre, descripcion, precioBase, maximoStock, usuarioId]);
    return result.rows[0];
  }

  async update(id, { nombre, descripcion, precioBase, maximoStock, usuarioId }) {
    const result = await db.query(`
      UPDATE "RoppiTA".CATEGORIAS
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
      UPDATE "RoppiTA".CATEGORIAS
      SET ACTIVA = 0,
          USUARIO_MODIFICACION = $1,
          FECHA_MODIFICACION = CURRENT_TIMESTAMP
      WHERE ID = $2
      RETURNING *
    `, [usuarioId, id]);
    return result.rows[0];
  }

}

module.exports = new CategoriasGateway();