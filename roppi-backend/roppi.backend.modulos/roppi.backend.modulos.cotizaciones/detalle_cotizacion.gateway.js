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
}

module.exports = new DetalleCotizacionGateway();
