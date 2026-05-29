// roppi.backend.modulos/roppi.backend.mod.productos/colores.bo.js
const coloresGateway = require('./colores.gateway');
const Color = require('./color.model');

class ColoresBO {

  async listarTodos() {
    const rows = await coloresGateway.findAll();
    return rows.map(row => new Color(row));
  }

  async obtenerPorId(id) {
    const row = await coloresGateway.findById(id);
    if (!row) return null;
    return new Color(row);
  }

}

module.exports = new ColoresBO();