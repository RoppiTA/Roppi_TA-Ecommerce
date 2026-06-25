// roppi.backend.modulos/roppi.backend.mod.productos/genericos.gateway.js
const db = require('../../roppi.backend.config/database');

class GenericosGateway {

  // ─── PRODUCTOS GENERICOS ───────────────────────────────────────────

  async findAll({ colores, materiales, tamanos, personalizaciones, precioMin, precioMax, nombre } = {}) {
    const result = await db.query(`
      SELECT DISTINCT g.*
      FROM "RoppiTA".GENERICOS g
      LEFT JOIN "RoppiTA".GENERICOSXCOLORES gc ON gc.ID_GENERICO = g.ID
      LEFT JOIN "RoppiTA".GENERICOSXMATERIALES gm ON gm.ID_GENERICO = g.ID
      LEFT JOIN "RoppiTA".GENERICOSXTAMANOS gt ON gt.ID_GENERICO = g.ID
      LEFT JOIN "RoppiTA".GENERICOSXPERSONALIZACIONES gp ON gp.ID_GENERICO = g.ID
      WHERE g.ACTIVO = 1
        AND ($1::int[] IS NULL OR gc.ID_COLOR = ANY($1))
        AND ($2::int[] IS NULL OR gm.ID_MATERIAL = ANY($2))
        AND ($3::int[] IS NULL OR gt.ID_TAMANO = ANY($3))
        AND ($4::int[] IS NULL OR gp.ID_PERSONALIZACION = ANY($4))
        AND ($5::numeric IS NULL OR g.PRECIO_BASE >= $5)
        AND ($6::numeric IS NULL OR g.PRECIO_BASE <= $6)
        AND ($7::text IS NULL OR LOWER(g.NOMBRE) LIKE '%' || LOWER($7) || '%')
    `, [colores, materiales, tamanos, personalizaciones, precioMin, precioMax, nombre]);
    return result.rows;
  }

  async findById(id) {
    const result = await db.query(`
      SELECT * FROM "RoppiTA".GENERICOS
      WHERE ID = $1
    `, [id]);
    return result.rows[0];
  }

  async createWithClient(client, { nombre, descripcion, precioBase, maximoStock, urlImagen, usuarioId, posicionX, posicionY }) {
    console.log(nombre);
    const result = await client.query(`
    INSERT INTO "RoppiTA".GENERICOS
      (NOMBRE, DESCRIPCION, PRECIO_BASE, MAXIMO_STOCK, USUARIO_CREACION, USUARIO_MODIFICACION, URL_IMAGEN, POSICION_X, POSICION_Y)
    VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $8)
    RETURNING *
  `, [nombre, descripcion, precioBase, maximoStock, usuarioId, urlImagen, posicionX, posicionY]);
    return result.rows[0];
  }

  async updateWithClient(client, id, { nombre, descripcion, precioBase, maximoStock, urlImagen, usuarioId, posicionX, posicionY }) {
    const result = await client.query(`
    UPDATE "RoppiTA".GENERICOS
    SET NOMBRE = $1,
        DESCRIPCION = $2,
        PRECIO_BASE = $3,
        MAXIMO_STOCK = $4,
        USUARIO_MODIFICACION = $5,
        FECHA_MODIFICACION = CURRENT_TIMESTAMP,
        URL_IMAGEN = $6,
        POSICION_X = $7,
        POSICION_Y = $8
    WHERE ID = $9
    RETURNING *
  `, [nombre, descripcion, precioBase, maximoStock, usuarioId, urlImagen, posicionX, posicionY, id]);
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

  async updateTamanoWithClient(client, { idGenerico, idTamano, alto, ancho, usuarioId }) {
    const result = await client.query(`
      UPDATE "RoppiTA".GENERICOSXTAMANOS
      SET ALTO = $1,
          ANCHO = $2,
          USUARIO_MODIFICACION = $3,
          FECHA_MODIFICACION = CURRENT_TIMESTAMP
      WHERE ID_GENERICO = $4
      AND ID_TAMANO = $5
      RETURNING *
    `, [alto, ancho, usuarioId, idGenerico, idTamano]);
    return result.rows[0];
  }

  async removeTodosLosTamanosWithClient(client, idGenerico) {
    await client.query(`
    DELETE FROM "RoppiTA".GENERICOSXTAMANOS
    WHERE ID_GENERICO = $1
  `, [idGenerico]);
  }

  async removeParTamanoWithClient(client, idGenerico, idTamano) {
    await client.query(`
    DELETE FROM "RoppiTA".GENERICOSXTAMANOS
    WHERE ID_GENERICO = $1
    AND ID_TAMANO = $2
  `, [idGenerico, idTamano]);
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

  async updateMaterialWithClient(client, { idGenerico, idMaterial, costoExtra, usuarioId }) {
    const result = await client.query(`
      UPDATE "RoppiTA".GENERICOSXMATERIALES
      SET COSTO_EXTRA = $1,
          USUARIO_MODIFICACION = $2,
          FECHA_MODIFICACION = CURRENT_TIMESTAMP
      WHERE ID_GENERICO = $3
      AND ID_MATERIAL = $4
      RETURNING *
    `, [costoExtra, usuarioId, idGenerico, idMaterial]);
    return result.rows[0];
  }

  async removeTodosLosMaterialesWithClient(client, idGenerico) {
    await client.query(`
    DELETE FROM "RoppiTA".GENERICOSXMATERIALES
    WHERE ID_GENERICO = $1
  `, [idGenerico]);
  }

  async removeParMaterialWithClient(client, idGenerico, idMaterial) {
    await client.query(`
    DELETE FROM "RoppiTA".GENERICOSXMATERIALES
    WHERE ID_GENERICO = $1
    AND ID_MATERIAL = $2
  `, [idGenerico, idMaterial]);
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

  async removeParColorWithClient(client, idGenerico, idColor) {
    await client.query(`
    DELETE FROM "RoppiTA".GENERICOSXCOLORES
    WHERE ID_GENERICO = $1
    AND ID_COLOR = $2
  `, [idGenerico, idColor]);
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

  async updatePersonalizacionWithClient(client, { idGenerico, idPersonalizacion, costoExtra, usuarioId }) {
    const result = await client.query(`
      UPDATE "RoppiTA".GENERICOSXPERSONALIZACIONES
      SET COSTO_EXTRA = $1,
          USUARIO_MODIFICACION = $2,
          FECHA_MODIFICACION = CURRENT_TIMESTAMP
      WHERE ID_GENERICO = $3
      AND ID_PERSONALIZACION = $4
      RETURNING *
    `, [costoExtra, usuarioId, idGenerico, idPersonalizacion]);
    return result.rows[0];
  }

  async removeTodosLasPersonalizacionesWithClient(client, idGenerico) {
    await client.query(`
    DELETE FROM "RoppiTA".GENERICOSXPERSONALIZACIONES
    WHERE ID_GENERICO = $1
  `, [idGenerico]);
  }

  async removeParPersonalizacionWithClient(client, idGenerico, idPersonalizacion) {
    await client.query(`
    DELETE FROM "RoppiTA".GENERICOSXPERSONALIZACIONES
    WHERE ID_GENERICO = $1
    AND ID_PERSONALIZACION = $2
  `, [idGenerico, idPersonalizacion]);
  }
  // los métodos clientes "with client" son para ser usados dentro de transacciones manejadas a nivel de BO,
  //  para asegurar que si alguna inserción falla, se revierta toda la operación. 
  // Lo que hacen es asegurar que cada query use el mismo cliente y no haga utilice cualquier cliente en la BD



}

module.exports = new GenericosGateway();