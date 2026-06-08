// roppi.backend.modulos/roppi.backend.modulos.usuarios/usuario.gateway.js
const db = require('../../roppi.backend.config/database.js');

class UsuariosGateway {

  async findAll() {
    const result = await db.query(`
      SELECT * FROM "RoppiTA".usuarios
      ORDER BY fecha_creacion DESC
    `);
    return result.rows;
  }

  async findById(id) {
    const result = await db.query(`
      SELECT * FROM "RoppiTA".usuarios
      WHERE id = $1
    `, [id]);
    return result.rows[0];
  }

  async findByCorreo(correo) {
    const result = await db.query(`
      SELECT * FROM "RoppiTA".usuarios
      WHERE correo = $1
    `, [correo]);
    return result.rows[0];
  }

  async findByNumeroDocumento(numeroDocumento) {
    const result = await db.query(`
      SELECT * FROM "RoppiTA".usuarios
      WHERE numero_documento = $1
    `, [numeroDocumento]);
    return result.rows[0];
  }

  async create({ nombre, correo, contraseña, numeroDocumento, tipoDocumento, usuarioCreacion = 1 }) {
    const result = await db.query(`
      INSERT INTO "RoppiTA".usuarios
        (nombre, correo, contrasena, numero_documento, tipo_documento, activo, usuario_creacion, usuario_modificacion)
      VALUES ($1, $2, $3, $4, $5, 0, $6, $6)
      RETURNING *
    `, [nombre, correo, contraseña, numeroDocumento, tipoDocumento, usuarioCreacion]);
    return result.rows[0];
  }

  async actualizarContraseña(id, contraseña, usuarioModificacion = 1) {
    const result = await db.query(`
      UPDATE "RoppiTA".usuarios
      SET contrasena = $1,
          usuario_modificacion = $2,
          fecha_modificacion = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [contraseña, usuarioModificacion, id]);
    return result.rows[0];
  }

  async activar(id, usuarioModificacion = 1) {
    const result = await db.query(`
      UPDATE "RoppiTA".usuarios
      SET activo = 1,
          usuario_modificacion = $1,
          fecha_modificacion = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [usuarioModificacion, id]);
    return result.rows[0];
  }

  async desactivar(id, usuarioModificacion = 1) {
    const result = await db.query(`
      UPDATE "RoppiTA".usuarios
      SET activo = 0,
          usuario_modificacion = $1,
          fecha_modificacion = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [usuarioModificacion, id]);
    return result.rows[0];
  }

  async update(id, { nombre, numeroDocumento, tipoDocumento, usuarioModificacion = 1 }) {
    const result = await db.query(`
      UPDATE "RoppiTA".usuarios
      SET nombre = COALESCE($1, nombre),
          numero_documento = COALESCE($2, numero_documento),
          tipo_documento = COALESCE($3, tipo_documento),
          usuario_modificacion = $4,
          fecha_modificacion = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `, [nombre, numeroDocumento, tipoDocumento, usuarioModificacion, id]);
    return result.rows[0];
  }

  async findAllActivas() {
    const result = await db.query(`
      SELECT * FROM "RoppiTA".usuarios
      WHERE activo = 1
      ORDER BY fecha_creacion DESC
    `);
    return result.rows;
  }

  async existeCorreo(correo) {
    const result = await db.query(`
      SELECT COUNT(*) as total FROM "RoppiTA".usuarios
      WHERE correo = $1
    `, [correo]);
    return result.rows[0].total > 0;
  }

  async existeNumeroDocumento(numeroDocumento) {
    const result = await db.query(`
      SELECT COUNT(*) as total FROM "RoppiTA".usuarios
      WHERE numero_documento = $1
    `, [numeroDocumento]);
    return result.rows[0].total > 0;
  }
}

module.exports = new UsuariosGateway();
