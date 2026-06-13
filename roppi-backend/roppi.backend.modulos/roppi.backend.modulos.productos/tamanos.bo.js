// roppi.backend.modulos/roppi.backend.mod.productos/tamanos.bo.js
const tamanosGateway = require('./tamanos.gateway');
const Tamano = require('./tamano.model');

class TamanosBO {

  async listarTodos() {
    const rows = await tamanosGateway.findAll();
    return rows.map(row => new Tamano(row));
  }

  async obtenerPorId(id) {
    const row = await tamanosGateway.findById(id);
    if (!row) return null;
    return new Tamano(row);
  }

}

module.exports = new TamanosBO();