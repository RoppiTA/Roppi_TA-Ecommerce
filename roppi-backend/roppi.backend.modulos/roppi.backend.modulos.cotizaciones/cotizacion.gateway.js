// roppi.backend.modulos/roppi.backend.modulos.cotizaciones/cotizacion.gateway.js
const db = require('../../roppi.backend.config/database');

class CotizacionGateway {

  // --- CARRITO (ESTADO = 'CARRITO') ---

  async getCarritoActivoByCliente(idUsuario) {
    const result = await db.query(`
      SELECT * FROM "RoppiTA".COTIZACIONES
      WHERE ID_USUARIO = $1 AND ESTADO = 'CARRITO'
      ORDER BY NUMERO_COTIZACION DESC
      LIMIT 1
    `, [idUsuario]);
    return result.rows[0];
  }

  async getSiguienteNumeroCotizacion() {
    const result = await db.query(`SELECT COALESCE(MAX(NUMERO_COTIZACION), 0) + 1 AS next_id FROM "RoppiTA".COTIZACIONES`);
    return parseInt(result.rows[0].next_id);
  }

  async createCarrito(idUsuario) {
    const nextNumero = await this.getSiguienteNumeroCotizacion();
    const result = await db.query(`
      INSERT INTO "RoppiTA".COTIZACIONES (NUMERO_COTIZACION, VERSION_COTIZACION, ID_USUARIO, ESTADO, TOTAL, USUARIO_CREACION, USUARIO_MODIFICACION)
      VALUES ($1, 1, $2, 'CARRITO', 0, $2, $2)
      RETURNING *
    `, [nextNumero, idUsuario]);
    return result.rows[0];
  }

  async updateTotal(numeroCotizacion, versionCotizacion, total, idUsuario) {
    const result = await db.query(`
      UPDATE "RoppiTA".COTIZACIONES
      SET TOTAL = $1, USUARIO_MODIFICACION = $4, FECHA_MODIFICACION = CURRENT_TIMESTAMP
      WHERE NUMERO_COTIZACION = $2 AND VERSION_COTIZACION = $3
      RETURNING *
    `, [total, numeroCotizacion, versionCotizacion, idUsuario]);
    return result.rows[0];
  }
}

module.exports = new CotizacionGateway();
