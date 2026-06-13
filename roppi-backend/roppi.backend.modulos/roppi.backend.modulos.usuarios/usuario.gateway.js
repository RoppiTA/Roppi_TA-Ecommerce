// roppi.backend.modulos/roppi.backend.modulos.usuarios/usuario.gateway.js
const db = require('../../roppi.backend.config/database.js');

class UsuariosGateway {

  async findAll() {
    const result = await db.query(`
      SELECT u.*, 
             (SELECT COALESCE(array_agg(rol), '{}') FROM "RoppiTA".usuarios_roles WHERE id_usuario = u.id) as roles
      FROM "RoppiTA".usuarios u
      ORDER BY u.fecha_creacion DESC
    `);
    return result.rows;
  }

  async findById(id) {
    const result = await db.query(`
      SELECT u.*, 
             (SELECT COALESCE(array_agg(rol), '{}') FROM "RoppiTA".usuarios_roles WHERE id_usuario = u.id) as roles
      FROM "RoppiTA".usuarios u
      WHERE u.id = $1
    `, [id]);
    return result.rows[0];
  }

  async findByCorreo(correo) {
    const result = await db.query(`
      SELECT u.*, 
             (SELECT COALESCE(json_agg(rol), '[]'::json) FROM "RoppiTA".usuarios_roles WHERE id_usuario = u.id) as roles
      FROM "RoppiTA".usuarios u
      WHERE u.correo = $1
    `, [correo]);
    return result.rows[0];
  }

  async findByNumeroDocumento(numeroDocumento) {
    const result = await db.query(`
      SELECT u.*, 
             (SELECT COALESCE(array_agg(rol), '{}') FROM "RoppiTA".usuarios_roles WHERE id_usuario = u.id) as roles
      FROM "RoppiTA".usuarios u
      WHERE u.numero_documento = $1
    `, [numeroDocumento]);
    return result.rows[0];
  }

  async create({ nombre, correo, contrasena, numeroDocumento, tipoDocumento, usuarioCreacion = 1 }) {
    const result = await db.query(`
      INSERT INTO "RoppiTA".usuarios
        (nombre, correo, contrasena, numero_documento, tipo_documento, activo, usuario_creacion, usuario_modificacion)
      VALUES ($1, $2, $3, $4, $5, 0, $6, $6)
      RETURNING *
    `, [nombre, correo, contrasena, numeroDocumento, tipoDocumento, usuarioCreacion]);

    const newUser = result.rows[0];

    await db.query(`
      INSERT INTO "RoppiTA".usuarios_roles
        (id_usuario, rol, usuario_creacion, usuario_modificacion)
      VALUES ($1, 'CLIENTE', $2, $2)
    `, [newUser.id, usuarioCreacion]);

    newUser.roles = ['CLIENTE'];

    return newUser;
  }

  async actualizarContrasena(id, contrasena, usuarioModificacion = 1) {
    const result = await db.query(`
      WITH updated AS (
        UPDATE "RoppiTA".usuarios
        SET contrasena = $1,
            usuario_modificacion = $2,
            fecha_modificacion = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      )
      SELECT u.*, 
             (SELECT COALESCE(array_agg(rol), '{}') FROM "RoppiTA".usuarios_roles WHERE id_usuario = u.id) as roles
      FROM updated u
    `, [contrasena, usuarioModificacion, id]);
    return result.rows[0];
  }

  async activar(id, usuarioModificacion = 1) {
    const result = await db.query(`
      WITH updated AS (
        UPDATE "RoppiTA".usuarios
        SET activo = 1,
            usuario_modificacion = $1,
            fecha_modificacion = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      )
      SELECT u.*, 
             (SELECT COALESCE(array_agg(rol), '{}') FROM "RoppiTA".usuarios_roles WHERE id_usuario = u.id) as roles
      FROM updated u
    `, [usuarioModificacion, id]);
    return result.rows[0];
  }

  async desactivar(id, usuarioModificacion = 1) {
    const result = await db.query(`
      WITH updated AS (
        UPDATE "RoppiTA".usuarios
        SET activo = 0,
            usuario_modificacion = $1,
            fecha_modificacion = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      )
      SELECT u.*, 
             (SELECT COALESCE(array_agg(rol), '{}') FROM "RoppiTA".usuarios_roles WHERE id_usuario = u.id) as roles
      FROM updated u
    `, [usuarioModificacion, id]);
    return result.rows[0];
  }

  async update(id, { nombre, numeroDocumento, tipoDocumento, usuarioModificacion = 1 }) {
    const result = await db.query(`
      WITH updated AS (
        UPDATE "RoppiTA".usuarios
        SET nombre = COALESCE($1, nombre),
            numero_documento = COALESCE($2, numero_documento),
            tipo_documento = COALESCE($3, tipo_documento),
            usuario_modificacion = $4,
            fecha_modificacion = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
      )
      SELECT u.*, 
             (SELECT COALESCE(array_agg(rol), '{}') FROM "RoppiTA".usuarios_roles WHERE id_usuario = u.id) as roles
      FROM updated u
    `, [nombre, numeroDocumento, tipoDocumento, usuarioModificacion, id]);
    return result.rows[0];
  }

  async findAllActivas() {
    const result = await db.query(`
      SELECT u.*, 
             (SELECT COALESCE(array_agg(rol), '{}') FROM "RoppiTA".usuarios_roles WHERE id_usuario = u.id) as roles
      FROM "RoppiTA".usuarios u
      WHERE u.activo = 1
      ORDER BY u.fecha_creacion DESC
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

  async asignarRol(idUsuario, rol, usuarioModificacion = 1) {
    const check = await db.query(`
      SELECT 1 FROM "RoppiTA".usuarios_roles WHERE id_usuario = $1 AND rol = $2
    `, [idUsuario, rol]);

    if (check.rowCount === 0) {
      await db.query(`
        INSERT INTO "RoppiTA".usuarios_roles
          (id_usuario, rol, usuario_creacion, usuario_modificacion)
        VALUES ($1, $2, $3, $3)
      `, [idUsuario, rol, usuarioModificacion]);
    }
    return this.findById(idUsuario);
  }

  async quitarRol(idUsuario, rol) {
    await db.query(`
      DELETE FROM "RoppiTA".usuarios_roles 
      WHERE id_usuario = $1 AND rol = $2
    `, [idUsuario, rol]);

    return this.findById(idUsuario);
  }
}

module.exports = new UsuariosGateway();
