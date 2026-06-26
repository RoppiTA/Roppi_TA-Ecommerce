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
        SELECT DISTINCT ON (c.NUMERO_COTIZACION) c.NUMERO_COTIZACION, c.VERSION_COTIZACION, c.ESTADO, c.TOTAL, c.FECHA_LIMITE, c.ID_COMERCIANTE, u.NOMBRE, u.ID, c.FECHA_MODIFICACION
        FROM "RoppiTA".COTIZACIONES c
        JOIN "RoppiTA".USUARIOS u ON c.ID_USUARIO = u.ID
        WHERE c.ESTADO IN ('SOLICITADA', 'OBSERVADA')
        ORDER BY c.NUMERO_COTIZACION, c.VERSION_COTIZACION DESC
      )
      SELECT NUMERO_COTIZACION, VERSION_COTIZACION, ESTADO, TOTAL, FECHA_LIMITE, ID_COMERCIANTE, NOMBRE, ID
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
        SELECT DISTINCT ON (c.NUMERO_COTIZACION) c.NUMERO_COTIZACION, c.VERSION_COTIZACION, c.ESTADO, c.TOTAL, c.FECHA_LIMITE, c.ID_COMERCIANTE, u.NOMBRE, u.ID, c.FECHA_MODIFICACION
        FROM "RoppiTA".COTIZACIONES c
        JOIN "RoppiTA".USUARIOS u ON c.ID_USUARIO = u.ID
        WHERE c.ESTADO IN ('ACEPTADA', 'CANCELADA', 'VENCIDA')
        ORDER BY c.NUMERO_COTIZACION, c.VERSION_COTIZACION DESC
      )
      SELECT NUMERO_COTIZACION, VERSION_COTIZACION, ESTADO, TOTAL, FECHA_LIMITE, ID_COMERCIANTE, NOMBRE, ID
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
        SELECT DISTINCT ON (c.NUMERO_COTIZACION) c.NUMERO_COTIZACION, c.VERSION_COTIZACION, c.ESTADO, c.TOTAL, c.FECHA_LIMITE, c.ID_COMERCIANTE, u.NOMBRE, u.ID, c.FECHA_MODIFICACION
        FROM "RoppiTA".COTIZACIONES c
        JOIN "RoppiTA".USUARIOS u ON c.ID_USUARIO = u.ID
        WHERE c.ESTADO != 'CARRITO'
        ORDER BY c.NUMERO_COTIZACION, c.VERSION_COTIZACION DESC
      )
      SELECT NUMERO_COTIZACION, VERSION_COTIZACION, ESTADO, TOTAL, FECHA_LIMITE, ID_COMERCIANTE, NOMBRE, ID
      FROM UltimasVersiones
      ORDER BY FECHA_MODIFICACION DESC
      LIMIT $1 OFFSET $2
    `, [limit, indice_min]);
    return result.rows;
  }

  async updateEstadoCotizacion(numeroCotizacion, numeroVersion, estado, comentarioCliente, comentarioComerciante) {
    const result = await db.query(`
      UPDATE "RoppiTA".COTIZACIONES
      SET 
        ESTADO = $1,
        COMENTARIOS_CLIENTE = COALESCE($4, COMENTARIOS_CLIENTE),
        COMENTARIOS_COMERCIANTE = COALESCE($5, COMENTARIOS_COMERCIANTE),
        FECHA_MODIFICACION = CURRENT_TIMESTAMP
      WHERE NUMERO_COTIZACION = $2 AND VERSION_COTIZACION = $3
      RETURNING NUMERO_COTIZACION, VERSION_COTIZACION, ESTADO, COMENTARIOS_CLIENTE, COMENTARIOS_COMERCIANTE
    `, [estado, numeroCotizacion, numeroVersion, comentarioCliente ?? null, comentarioComerciante ?? null]);
    return result.rows[0];
  }

  async asignarComerciante(numeroCotizacion, numeroVersion, idComerciante) {
    const result = await db.query(`
      UPDATE "RoppiTA".COTIZACIONES
      SET ID_COMERCIANTE = $1, FECHA_MODIFICACION = CURRENT_TIMESTAMP
      WHERE NUMERO_COTIZACION = $2 AND VERSION_COTIZACION = $3
      RETURNING NUMERO_COTIZACION, VERSION_COTIZACION, ID_COMERCIANTE
    `, [idComerciante, numeroCotizacion, numeroVersion]);
    return result.rows[0];
  }

  async listarVersionesDeCotizacion(numeroCotizacion, indice_min, indice_max) {
    const limit = indice_max - indice_min;
    const result = await db.query(`
      SELECT NUMERO_COTIZACION, VERSION_COTIZACION, ESTADO, TOTAL, FECHA_LIMITE, ID_COMERCIANTE, FECHA_MODIFICACION
      FROM "RoppiTA".COTIZACIONES
      WHERE NUMERO_COTIZACION = $1
      ORDER BY VERSION_COTIZACION DESC
      LIMIT $2 OFFSET $3
    `, [numeroCotizacion, limit, indice_min]);
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
        c.ID_COMERCIANTE,
        u.NOMBRE AS cliente_nombre
      FROM "RoppiTA".COTIZACIONES c
      JOIN "RoppiTA".USUARIOS u ON c.ID_USUARIO = u.ID
      WHERE c.NUMERO_COTIZACION = $1 AND c.VERSION_COTIZACION = $2
    `, [numeroCotizacion, numeroVersion]);

    if (result.rows.length === 0) return null;

    const cabecera = result.rows[0];

    // 2. Obtenemos los detalles usando la nueva función modularizada V2
    const detalles = await detalleGateway.getDetallesByCotizacion(numeroCotizacion, numeroVersion);

    // 3. Combinamos la data
    cabecera.detalles = detalles;

    return cabecera;
  }

  async crearCotizacionTransaccion(data) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      let numeroCotizacion = data.numero_cotizacion;
      let versionCotizacion = 1;

      // Generar numero_cotizacion si es nuevo
      if (!numeroCotizacion) {
        const numResult = await client.query('SELECT COALESCE(MAX(NUMERO_COTIZACION), 0) + 1 AS next_num FROM "RoppiTA".COTIZACIONES');
        numeroCotizacion = parseInt(numResult.rows[0].next_num);
      } else {
        // Verificar que la cotización realmente exista
        const existsResult = await client.query('SELECT 1 FROM "RoppiTA".COTIZACIONES WHERE NUMERO_COTIZACION = $1 LIMIT 1', [numeroCotizacion]);
        if (existsResult.rowCount === 0) {
          throw new Error(`La cotización con número ${numeroCotizacion} no existe.`);
        }

        // Obtener la siguiente versión si ya existe
        const verResult = await client.query('SELECT COALESCE(MAX(VERSION_COTIZACION), 0) + 1 AS next_ver FROM "RoppiTA".COTIZACIONES WHERE NUMERO_COTIZACION = $1', [numeroCotizacion]);
        versionCotizacion = parseInt(verResult.rows[0].next_ver);
      }

      // Insertar Cabecera
      const cabeceraQuery = `
        INSERT INTO "RoppiTA".COTIZACIONES 
          (NUMERO_COTIZACION, VERSION_COTIZACION, ID_USUARIO, TOTAL, COMENTARIOS_CLIENTE, COMENTARIOS_COMERCIANTE, ESTADO, USUARIO_CREACION, USUARIO_MODIFICACION)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
        RETURNING *
      `;
      const cabeceraParams = [
        numeroCotizacion,
        versionCotizacion,
        data.id_usuario,
        data.total || 0,
        data.comentarios_cliente ?? null,
        data.comentarios_comerciante ?? null,
        data.estado || 'SOLICITADA',
        data.id_usuario
      ];

      await client.query(cabeceraQuery, cabeceraParams);

      // Insertar Detalles
      const detalles = data.detalles || [];
      for (const d of detalles) {
        const detQuery = `
          INSERT INTO "RoppiTA".detalles_cotizacion
            (id_generico, numero_cotizacion, version_cotizacion, cantidad, precio, id_tamano, id_color, id_material, id_personalizacion, url_diseno, usuario_creacion, usuario_modificacion)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)
        `;
        const detParams = [
          d.id_generico,
          numeroCotizacion,
          versionCotizacion,
          d.cantidad || 1,
          d.precio || 0,
          d.id_tamano || null,
          d.id_color || null,
          d.id_material || null,
          d.id_personalizacion || null,
          d.url_diseno || null,
          data.id_usuario
        ];
        await client.query(detQuery, detParams);
      }

      await client.query('COMMIT');

      return {
        numero_cotizacion: numeroCotizacion,
        version_cotizacion: versionCotizacion,
        mensaje: "Cotización registrada exitosamente"
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

}

module.exports = new CotizacionGateway();
