// roppi.backend.modulos/roppi.backend.modulos.pedidos/pedido.gateway.js
const db = require('../../roppi.backend.config/database');

class PedidoGateway {

  async findAll() {
    const result = await db.query(`SELECT * FROM "RoppiTA".PEDIDOS ORDER BY FECHA_CREACION DESC`);
    return result.rows;
  }

  async findById(id) {
    const result = await db.query(`SELECT * FROM "RoppiTA".PEDIDOS WHERE ID = $1`, [id]);
    return result.rows[0];
  }

  async findByUsuario(idUsuario) {
    const result = await db.query(`SELECT * FROM "RoppiTA".PEDIDOS WHERE ID_USUARIO = $1 ORDER BY FECHA_CREACION DESC`, [idUsuario]);
    return result.rows;
  }

  async create({ idUsuario, idDireccion, numeroCotizacion, versionCotizacion, montoTotal }) {
    const result = await db.query(`
      INSERT INTO "RoppiTA".PEDIDOS 
        (ID_USUARIO, ID_DIRECCION, NUMERO_COTIZACION, VERSION_COTIZACION, MONTO_TOTAL, USUARIO_CREACION, USUARIO_MODIFICACION)
      VALUES ($1, $2, $3, $4, $5, $1, $1)
      RETURNING *
    `, [idUsuario, idDireccion, numeroCotizacion, versionCotizacion, montoTotal]);
    return result.rows[0];
  }

  async updateEstadoEntrega(id, estadoEntrega, idUsuario) {
    const result = await db.query(`
      UPDATE "RoppiTA".PEDIDOS 
      SET ESTADO_ENTREGA = $1, USUARIO_MODIFICACION = $3, FECHA_MODIFICACION = CURRENT_TIMESTAMP
      WHERE ID = $2
      RETURNING *
    `, [estadoEntrega, id, idUsuario]);
    return result.rows[0];
  }
}

module.exports = new PedidoGateway();
