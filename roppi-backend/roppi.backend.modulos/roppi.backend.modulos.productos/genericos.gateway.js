// roppi.backend.modulos/roppi.backend.mod.productos/genericos.gateway.js
const db = require('../../roppi.backend.config/database');

class GenericosGateway {

  // ─── PRODUCTOS GENERICOS ───────────────────────────────────────────

  async findAll() {
    const result = await db.query(`
      SELECT * FROM "RoppiTA".GENERICOS
      WHERE ACTIVO = 1
    `);
    return result.rows;
  }

  async findById(id) {
    const result = await db.query(`
      SELECT * FROM "RoppiTA".GENERICOS
      WHERE ID = $1
    `, [id]);
    return result.rows[0];
  }
  
  async createWithClient(client, { nombre, descripcion, precioBase, maximoStock, usuarioId }) {
  const result = await client.query(`
    INSERT INTO "RoppiTA".GENERICOS
      (NOMBRE, DESCRIPCION, PRECIO_BASE, MAXIMO_STOCK, USUARIO_CREACION, USUARIO_MODIFICACION)
    VALUES ($1, $2, $3, $4, $5, $5)
    RETURNING *
  `, [nombre, descripcion, precioBase, maximoStock, usuarioId]);
  return result.rows[0];
  } 

  async updateWithClient(client, id, { nombre, descripcion, precioBase, maximoStock, usuarioId }) {
  const result = await client.query(`
    UPDATE "RoppiTA".GENERICOS
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
      UPDATE "RoppiTA".GENERICOS
      SET ACTIVO = 0,
          USUARIO_MODIFICACION = $1,
          FECHA_MODIFICACION = CURRENT_TIMESTAMP
      WHERE ID = $2
      RETURNING *
    `, [usuarioId, id]);
    return result.rows[0];
  }

  // ─── GENERICOSXTAMANOS (tamaños asociados al producto genérico)───────────────────────────────────

  async findTamanosByGenerico(idGenerico) {
    const result = await db.query(`
      SELECT t.*, gt.ALTO, gt.ANCHO
      FROM "RoppiTA".GENERICOSXTAMANOS gt
      JOIN "RoppiTA".TAMANOS t ON gt.ID_TAMANO = t.ID
      WHERE gt.ID_GENERICO = $1
    `, [idGenerico]);
    return result.rows;
  }

  async addTamanoWithClient(client, { idGenerico, idTamano, alto, ancho, usuarioId }) {
    const result = await client.query(`
      INSERT INTO "RoppiTA".GENERICOSXTAMANOS
        (ID_GENERICO, ID_TAMANO, ALTO, ANCHO, USUARIO_CREACION, USUARIO_MODIFICACION)
      VALUES ($1, $2, $3, $4, $5, $5)
      RETURNING *
    `, [idGenerico, idTamano, alto, ancho, usuarioId]);
    return result.rows[0];
  }

  async removeTodosLosTamanosWithClient(client, idGenerico) {
  await client.query(`
    DELETE FROM "RoppiTA".GENERICOSXTAMANOS
    WHERE ID_GENERICO = $1
  `, [idGenerico]);
  }


  // ─── GENERICOSXMATERIALES (materiales asociados al producto genérico)────────────────────────────────

  async findMaterialesByGenerico(idGenerico) {
    const result = await db.query(`
      SELECT m.*, gm.COSTO_EXTRA
      FROM "RoppiTA".GENERICOSXMATERIALES gm
      JOIN "RoppiTA".MATERIALES m ON gm.ID_MATERIAL = m.ID
      WHERE gm.ID_GENERICO = $1
    `, [idGenerico]);
    return result.rows;
  }


  async addMaterialWithClient(client, { idGenerico, idMaterial, costoExtra, usuarioId }) {
  const result = await client.query(`
    INSERT INTO "RoppiTA".GENERICOSXMATERIALES
      (ID_GENERICO, ID_MATERIAL, COSTO_EXTRA, USUARIO_CREACION, USUARIO_MODIFICACION)
    VALUES ($1, $2, $3, $4, $4)
    RETURNING *
  `, [idGenerico, idMaterial, costoExtra, usuarioId]);
  return result.rows[0];
  }


  async removeTodosLosMaterialesWithClient(client, idGenerico) {
  await client.query(`
    DELETE FROM "RoppiTA".GENERICOSXMATERIALES
    WHERE ID_GENERICO = $1
  `, [idGenerico]);
  }
  // ─── GENERICOSXCOLORES (colores asociados al producto genérico)───────────────────────────────────

  async findColoresByGenerico(idGenerico) {
    const result = await db.query(`
      SELECT c.*
      FROM "RoppiTA".GENERICOSXCOLORES gc
      JOIN "RoppiTA".COLORES c ON gc.ID_COLOR = c.ID
      WHERE gc.ID_GENERICO = $1
    `, [idGenerico]);
    return result.rows;
  }
  
  async addColorWithClient(client, { idGenerico, idColor, usuarioId }) {
  const result = await client.query(`
    INSERT INTO "RoppiTA".GENERICOSXCOLORES
      (ID_GENERICO, ID_COLOR, USUARIO_CREACION, USUARIO_MODIFICACION)
    VALUES ($1, $2, $3, $3)
    RETURNING *
  `, [idGenerico, idColor, usuarioId]);
  return result.rows[0];
  }


  async removeTodosLosColoresWithClient(client, idGenerico) {
  await client.query(`
    DELETE FROM "RoppiTA".GENERICOSXCOLORES
    WHERE ID_GENERICO = $1
  `, [idGenerico]);
  }

  // ─── GENERICOSXPERSONALIZACIONES (personalizaciones asociadas al producto genérico)───────────────────────────────────

  async findPersonalizacionesByGenerico(idGenerico) {
    const result = await db.query(`
      SELECT p.*, gp.COSTO_EXTRA
      FROM "RoppiTA".GENERICOSXPERSONALIZACIONES gp
      JOIN "RoppiTA".PERSONALIZACIONES p ON gp.ID_PERSONALIZACION = p.ID
      WHERE gp.ID_GENERICO = $1
    `, [idGenerico]);
    return result.rows;
  }

  async addPersonalizacionWithClient(client, { idGenerico, idPersonalizacion, costoExtra, usuarioId }) {
  const result = await client.query(`
    INSERT INTO "RoppiTA".GENERICOSXPERSONALIZACIONES
      (ID_GENERICO, ID_PERSONALIZACION, COSTO_EXTRA, USUARIO_CREACION, USUARIO_MODIFICACION)
    VALUES ($1, $2, $3, $4, $4)
    RETURNING *
  `, [idGenerico, idPersonalizacion, costoExtra, usuarioId]);
  return result.rows[0];
  }

 
  async removeTodosLasPersonalizacionesWithClient(client, idGenerico) {
  await client.query(`
    DELETE FROM "RoppiTA".GENERICOSXPERSONALIZACIONES
    WHERE ID_GENERICO = $1
  `, [idGenerico]);
  }
  // los métodos clientes "with client" son para ser usados dentro de transacciones manejadas a nivel de BO,
  //  para asegurar que si alguna inserción falla, se revierta toda la operación. 
  // Lo que hacen es asegurar que cada query use el mismo cliente y no haga utilice cualquier cliente en la BD



}

module.exports = new GenericosGateway();