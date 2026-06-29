// roppi.backend.modulos/roppi.backend.modulos.cotizaciones/detalle_cotizacion.gateway.js
const db = require('../../roppi.backend.config/database');

class DetalleCotizacionGateway {

  async deleteByCotizacion(numeroCotizacion, versionCotizacion) {
    await db.query(`
      DELETE FROM "RoppiTA".detalles_cotizacion
      WHERE numero_cotizacion = $1 AND version_cotizacion = $2
    `, [numeroCotizacion, versionCotizacion]);
  }

  /**
   * Consulta base modularizada para obtener los detalles junto a todas las tablas 
   * paramétricas asociadas.
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

  async getDetallesByCotizacion(numeroCotizacion, versionCotizacion) {
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

  async addItem({ idGenerico, numeroCotizacion, versionCotizacion, cantidad, precio, idTamano, idColor, idMaterial, idPersonalizacion, urlDiseno, idUsuario }) {
    const result = await db.query(`
      INSERT INTO "RoppiTA".detalles_cotizacion 
        (id_generico, numero_cotizacion, version_cotizacion, cantidad, precio, id_tamano, id_color, id_material, id_personalizacion, url_diseno, usuario_creacion, usuario_modificacion)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)
      RETURNING *
    `, [idGenerico, numeroCotizacion, versionCotizacion, cantidad, precio, idTamano, idColor, idMaterial, idPersonalizacion, urlDiseno, idUsuario]);
    return result.rows[0];
  }

  async updateCantidadItem(idGenerico, numeroCotizacion, versionCotizacion, cantidad, idUsuario) {
    const result = await db.query(`
      UPDATE "RoppiTA".detalles_cotizacion
      SET cantidad = $1, usuario_modificacion = $5, fecha_modificacion = CURRENT_TIMESTAMP
      WHERE id_generico = $2 AND numero_cotizacion = $3 AND version_cotizacion = $4
      RETURNING *
    `, [cantidad, idGenerico, numeroCotizacion, versionCotizacion, idUsuario]);
    return result.rows[0];
  }

  async removeItem(idGenerico, numeroCotizacion, versionCotizacion) {
    const result = await db.query(`
      DELETE FROM "RoppiTA".detalles_cotizacion
      WHERE id_generico = $1 AND numero_cotizacion = $2 AND version_cotizacion = $3
      RETURNING *
    `, [idGenerico, numeroCotizacion, versionCotizacion]);
    return result.rows[0];
  }
}

module.exports = new DetalleCotizacionGateway();
