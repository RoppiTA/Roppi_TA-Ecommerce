// roppi.backend.modulos/roppi.backend.modulos.cotizaciones/cotizacion.gateway.js
const db = require('../../roppi.backend.config/database');
const detalleGateway = require('./detalle_cotizacion.gateway');

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

  // --- COTIZACIONES (NEGOCIACIÓN ENTRE VENDEDOR Y USUARIO) ---

  // POV del cliente
  async listarCotizacionesActivasPorCliente(idCliente, indice_min, indice_max) {
    const limit = indice_max - indice_min;
    const result = await db.query(`
      WITH UltimasVersiones AS (
        SELECT DISTINCT ON (NUMERO_COTIZACION) NUMERO_COTIZACION, VERSION_COTIZACION, ESTADO, TOTAL, FECHA_LIMITE, FECHA_MODIFICACION
        FROM "RoppiTA".COTIZACIONES
        WHERE ID_USUARIO = $1 AND ESTADO IN ('SOLICITADA', 'OBSERVADA')
        ORDER BY NUMERO_COTIZACION, VERSION_COTIZACION DESC
      )
      SELECT NUMERO_COTIZACION, VERSION_COTIZACION, ESTADO, TOTAL, FECHA_LIMITE
      FROM UltimasVersiones
      ORDER BY FECHA_MODIFICACION DESC
      LIMIT $2 OFFSET $3
    `, [idCliente, limit, indice_min]);
    return result.rows;
  }

  async listarCotizacionesCerradasPorCliente(idCliente, indice_min, indice_max) {
    const limit = indice_max - indice_min;
    const result = await db.query(`
      WITH UltimasVersiones AS (
        SELECT DISTINCT ON (NUMERO_COTIZACION) NUMERO_COTIZACION, VERSION_COTIZACION, ESTADO, TOTAL, FECHA_LIMITE, FECHA_MODIFICACION
        FROM "RoppiTA".COTIZACIONES
        WHERE ID_USUARIO = $1 AND ESTADO IN ('ACEPTADA', 'CANCELADA', 'VENCIDA')
        ORDER BY NUMERO_COTIZACION, VERSION_COTIZACION DESC
      )
      SELECT NUMERO_COTIZACION, VERSION_COTIZACION, ESTADO, TOTAL, FECHA_LIMITE
      FROM UltimasVersiones
      ORDER BY FECHA_MODIFICACION DESC
      LIMIT $2 OFFSET $3
    `, [idCliente, limit, indice_min]);
    return result.rows;
  }

  async listarTodasLasCotizacionesPorCliente(idCliente, indice_min, indice_max) {
    const limit = indice_max - indice_min;
    const result = await db.query(`
      WITH UltimasVersiones AS (
        SELECT DISTINCT ON (NUMERO_COTIZACION) NUMERO_COTIZACION, VERSION_COTIZACION, ESTADO, TOTAL, FECHA_LIMITE, FECHA_MODIFICACION
        FROM "RoppiTA".COTIZACIONES
        WHERE ID_USUARIO = $1 AND ESTADO != 'CARRITO'
        ORDER BY NUMERO_COTIZACION, VERSION_COTIZACION DESC
      )
      SELECT NUMERO_COTIZACION, VERSION_COTIZACION, ESTADO, TOTAL, FECHA_LIMITE
      FROM UltimasVersiones
      ORDER BY FECHA_MODIFICACION DESC
      LIMIT $2 OFFSET $3
    `, [idCliente, limit, indice_min]);
    return result.rows;
  }

  // POV del comerciante
  async listarCotizacionesAbiertas(indice_min, indice_max) {
    const limit = indice_max - indice_min;
    const result = await db.query(`
      WITH UltimasVersiones AS (
        SELECT DISTINCT ON (c.NUMERO_COTIZACION) c.NUMERO_COTIZACION, c.VERSION_COTIZACION, c.ESTADO, c.TOTAL, c.FECHA_LIMITE, u.NOMBRE, u.ID, c.FECHA_MODIFICACION
        FROM "RoppiTA".COTIZACIONES c
        JOIN "RoppiTA".USUARIOS u ON c.ID_USUARIO = u.ID
        WHERE c.ESTADO IN ('SOLICITADA', 'OBSERVADA')
        ORDER BY c.NUMERO_COTIZACION, c.VERSION_COTIZACION DESC
      )
      SELECT NUMERO_COTIZACION, VERSION_COTIZACION, ESTADO, TOTAL, FECHA_LIMITE, NOMBRE, ID
      FROM UltimasVersiones
      ORDER BY FECHA_MODIFICACION DESC
      LIMIT $1 OFFSET $2
    `, [limit, indice_min]);
    return result.rows;
  }

  async listarCotizacionesCerradas(indice_min, indice_max) {
    const limit = indice_max - indice_min;
    const result = await db.query(`
      WITH UltimasVersiones AS (
        SELECT DISTINCT ON (c.NUMERO_COTIZACION) c.NUMERO_COTIZACION, c.VERSION_COTIZACION, c.ESTADO, c.TOTAL, c.FECHA_LIMITE, u.NOMBRE, u.ID, c.FECHA_MODIFICACION
        FROM "RoppiTA".COTIZACIONES c
        JOIN "RoppiTA".USUARIOS u ON c.ID_USUARIO = u.ID
        WHERE c.ESTADO IN ('ACEPTADA', 'CANCELADA', 'VENCIDA')
        ORDER BY c.NUMERO_COTIZACION, c.VERSION_COTIZACION DESC
      )
      SELECT NUMERO_COTIZACION, VERSION_COTIZACION, ESTADO, TOTAL, FECHA_LIMITE, NOMBRE, ID
      FROM UltimasVersiones
      ORDER BY FECHA_MODIFICACION DESC
      LIMIT $1 OFFSET $2
    `, [limit, indice_min]);
    return result.rows;
  }

  async listarTodasLasCotizaciones(indice_min, indice_max) {
    const limit = indice_max - indice_min;
    const result = await db.query(`
      WITH UltimasVersiones AS (
        SELECT DISTINCT ON (c.NUMERO_COTIZACION) c.NUMERO_COTIZACION, c.VERSION_COTIZACION, c.ESTADO, c.TOTAL, c.FECHA_LIMITE, u.NOMBRE, u.ID, c.FECHA_MODIFICACION
        FROM "RoppiTA".COTIZACIONES c
        JOIN "RoppiTA".USUARIOS u ON c.ID_USUARIO = u.ID
        WHERE c.ESTADO != 'CARRITO'
        ORDER BY c.NUMERO_COTIZACION, c.VERSION_COTIZACION DESC
      )
      SELECT NUMERO_COTIZACION, VERSION_COTIZACION, ESTADO, TOTAL, FECHA_LIMITE, NOMBRE, ID
      FROM UltimasVersiones
      ORDER BY FECHA_MODIFICACION DESC
      LIMIT $1 OFFSET $2
    `, [limit, indice_min]);
    return result.rows;
  }

  async updateEstadoCotizacion(numeroCotizacion, numeroVersion, estado) {
    const result = await db.query(`
      UPDATE "RoppiTA".COTIZACIONES
      SET ESTADO = $1, FECHA_MODIFICACION = CURRENT_TIMESTAMP
      WHERE NUMERO_COTIZACION = $2 AND VERSION_COTIZACION = $3
      RETURNING NUMERO_COTIZACION, VERSION_COTIZACION, ESTADO
    `, [estado, numeroCotizacion, numeroVersion]);
    return result.rows[0];
  }

  async listarVersionesDeCotizacion(numeroCotizacion) {
    const result = await db.query(`
      SELECT NUMERO_COTIZACION, VERSION_COTIZACION, ESTADO, TOTAL, FECHA_LIMITE, FECHA_MODIFICACION
      FROM "RoppiTA".COTIZACIONES
      WHERE NUMERO_COTIZACION = $1
      ORDER BY VERSION_COTIZACION DESC
    `, [numeroCotizacion]);
    return result.rows;
  }

  async obtenerDetallesCotizacion(numeroCotizacion, numeroVersion) {
    // 1. Obtenemos la cabecera de la cotización
    const result = await db.query(`
      SELECT 
        c.NUMERO_COTIZACION,
        c.VERSION_COTIZACION,
        c.ESTADO,
        c.COMENTARIOS_CLIENTE,
        c.COMENTARIOS_COMERCIANTE,
        c.FECHA_CREACION,
        c.FECHA_LIMITE,
        c.TOTAL,
        u.NOMBRE AS cliente_nombre
      FROM "RoppiTA".COTIZACIONES c
      JOIN "RoppiTA".USUARIOS u ON c.ID_USUARIO = u.ID
      WHERE c.NUMERO_COTIZACION = $1 AND c.VERSION_COTIZACION = $2
    `, [numeroCotizacion, numeroVersion]);

    if (result.rows.length === 0) return null;

    const cabecera = result.rows[0];

    // 2. Obtenemos los detalles usando la nueva función modularizada V2
    const detalles = await detalleGateway.getDetallesByCotizacionV2(numeroCotizacion, numeroVersion);

    // 3. Combinamos la data
    cabecera.detalles = detalles;

    return cabecera;
  }

}

module.exports = new CotizacionGateway();
