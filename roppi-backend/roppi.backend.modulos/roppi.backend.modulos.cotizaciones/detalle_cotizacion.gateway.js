// roppi.backend.modulos/roppi.backend.modulos.cotizaciones/detalle_cotizacion.gateway.js
const db = require('../../roppi.backend.config/database');

class DetalleCotizacionGateway {

  async getDetallesByCotizacion(numeroCotizacion, versionCotizacion) {
    const result = await db.query(`
      SELECT 
        dc.*,
        p.SKU as producto_sku,
        g.NOMBRE as producto_nombre,
        g.MAXIMO_STOCK as maximo_stock,
        t.NOMBRE as tamano_nombre,
        c.NOMBRE as color_nombre,
        m.NOMBRE as material_nombre,
        pe.NOMBRE as personalizacion_nombre
      FROM "RoppiTA".DETALLES_COTIZACION dc
      JOIN "RoppiTA".PERSONALIZADOS p ON dc.ID_PRODUCTO = p.ID
      JOIN "RoppiTA".GENERICOS g ON p.ID_GENERICO = g.ID
      LEFT JOIN "RoppiTA".TAMANOS t ON p.ID_TAMANO = t.ID
      LEFT JOIN "RoppiTA".COLORES c ON p.ID_COLOR = c.ID
      LEFT JOIN "RoppiTA".MATERIALES m ON p.ID_MATERIAL = m.ID
      LEFT JOIN "RoppiTA".PERSONALIZACIONES pe ON p.ID_PERSONALIZACION = pe.ID
      WHERE dc.NUMERO_COTIZACION = $1 AND dc.VERSION_COTIZACION = $2
      ORDER BY dc.FECHA_CREACION ASC
    `, [numeroCotizacion, versionCotizacion]);
    return result.rows;
  }

  async getDetalleById(idProducto, numeroCotizacion, versionCotizacion) {
    const result = await db.query(`
      SELECT dc.*, g.MAXIMO_STOCK as maximo_stock 
      FROM "RoppiTA".DETALLES_COTIZACION dc
      JOIN "RoppiTA".PERSONALIZADOS p ON dc.ID_PRODUCTO = p.ID
      JOIN "RoppiTA".GENERICOS g ON p.ID_GENERICO = g.ID
      WHERE dc.ID_PRODUCTO = $1 AND dc.NUMERO_COTIZACION = $2 AND dc.VERSION_COTIZACION = $3
    `, [idProducto, numeroCotizacion, versionCotizacion]);
    return result.rows[0];
  }

  async addItem({ idProducto, numeroCotizacion, versionCotizacion, cantidad, precio, idUsuario }) {
    const result = await db.query(`
      INSERT INTO "RoppiTA".DETALLES_COTIZACION 
        (ID_PRODUCTO, NUMERO_COTIZACION, VERSION_COTIZACION, CANTIDAD, PRECIO, USUARIO_CREACION, USUARIO_MODIFICACION)
      VALUES ($1, $2, $3, $4, $5, $6, $6)
      RETURNING *
    `, [idProducto, numeroCotizacion, versionCotizacion, cantidad, precio, idUsuario]);
    return result.rows[0];
  }

  async updateCantidadItem(idProducto, numeroCotizacion, versionCotizacion, cantidad, idUsuario) {
    const result = await db.query(`
      UPDATE "RoppiTA".DETALLES_COTIZACION
      SET CANTIDAD = $1, USUARIO_MODIFICACION = $5, FECHA_MODIFICACION = CURRENT_TIMESTAMP
      WHERE ID_PRODUCTO = $2 AND NUMERO_COTIZACION = $3 AND VERSION_COTIZACION = $4
      RETURNING *
    `, [cantidad, idProducto, numeroCotizacion, versionCotizacion, idUsuario]);
    return result.rows[0];
  }

  async removeItem(idProducto, numeroCotizacion, versionCotizacion) {
    const result = await db.query(`
      DELETE FROM "RoppiTA".DETALLES_COTIZACION
      WHERE ID_PRODUCTO = $1 AND NUMERO_COTIZACION = $2 AND VERSION_COTIZACION = $3
      RETURNING *
    `, [idProducto, numeroCotizacion, versionCotizacion]);
    return result.rows[0];
  }

  async deleteByCotizacion(numeroCotizacion, versionCotizacion) {
    await db.query(`
      DELETE FROM "RoppiTA".DETALLES_COTIZACION
      WHERE NUMERO_COTIZACION = $1 AND VERSION_COTIZACION = $2
    `, [numeroCotizacion, versionCotizacion]);
  }

  // --- NUEVAS FUNCIONES MODULARIZADAS PARA EL NUEVO ESQUEMA ---

  /**
   * Consulta base modularizada para obtener los detalles junto a todas las tablas 
   * paramétricas asociadas. Esto nos evita repetir los 5 JOINs en cada consulta de lectura.
   */
  _getBaseQuery() {
    return `
      SELECT 
        dc.*,
        g.nombre AS generico_nombre, 
        g.url_imagen AS generico_imagen, 
        g.precio_base AS generico_precio_base,
        g.maximo_stock AS maximo_stock,
        t.nombre AS tamano_nombre,
        c.nombre AS color_nombre, 
        c.pantone AS color_pantone,
        m.nombre AS material_nombre,
        p.nombre AS personalizacion_nombre
      FROM "RoppiTA".detalles_cotizacion dc
      JOIN "RoppiTA".genericos g ON dc.id_generico = g.id
      LEFT JOIN "RoppiTA".tamanos t ON dc.id_tamano = t.id
      LEFT JOIN "RoppiTA".colores c ON dc.id_color = c.id
      LEFT JOIN "RoppiTA".materiales m ON dc.id_material = m.id
      LEFT JOIN "RoppiTA".personalizaciones p ON dc.id_personalizacion = p.id
    `;
  }

  async getDetallesByCotizacionV2(numeroCotizacion, versionCotizacion) {
    const query = this._getBaseQuery() + `
      WHERE dc.numero_cotizacion = $1 AND dc.version_cotizacion = $2
      ORDER BY dc.fecha_creacion ASC
    `;
    const result = await db.query(query, [numeroCotizacion, versionCotizacion]);
    return result.rows;
  }

  async getDetalleByGenerico(idGenerico, numeroCotizacion, versionCotizacion) {
    const query = this._getBaseQuery() + `
      WHERE dc.id_generico = $1 AND dc.numero_cotizacion = $2 AND dc.version_cotizacion = $3
    `;
    const result = await db.query(query, [idGenerico, numeroCotizacion, versionCotizacion]);
    return result.rows[0];
  }

  async addItemV2({ idGenerico, numeroCotizacion, versionCotizacion, cantidad, precio, idTamano, idColor, idMaterial, idPersonalizacion, urlDiseno, idUsuario }) {
    const result = await db.query(`
      INSERT INTO "RoppiTA".detalles_cotizacion 
        (id_generico, numero_cotizacion, version_cotizacion, cantidad, precio, id_tamano, id_color, id_material, id_personalizacion, url_diseno, usuario_creacion, usuario_modificacion)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)
      RETURNING *
    `, [idGenerico, numeroCotizacion, versionCotizacion, cantidad, precio, idTamano, idColor, idMaterial, idPersonalizacion, urlDiseno, idUsuario]);
    return result.rows[0];
  }

  async updateCantidadItemV2(idGenerico, numeroCotizacion, versionCotizacion, cantidad, idUsuario) {
    const result = await db.query(`
      UPDATE "RoppiTA".detalles_cotizacion
      SET cantidad = $1, usuario_modificacion = $5, fecha_modificacion = CURRENT_TIMESTAMP
      WHERE id_generico = $2 AND numero_cotizacion = $3 AND version_cotizacion = $4
      RETURNING *
    `, [cantidad, idGenerico, numeroCotizacion, versionCotizacion, idUsuario]);
    return result.rows[0];
  }

  async removeItemV2(idGenerico, numeroCotizacion, versionCotizacion) {
    const result = await db.query(`
      DELETE FROM "RoppiTA".detalles_cotizacion
      WHERE id_generico = $1 AND numero_cotizacion = $2 AND version_cotizacion = $3
      RETURNING *
    `, [idGenerico, numeroCotizacion, versionCotizacion]);
    return result.rows[0];
  }
}

module.exports = new DetalleCotizacionGateway();
