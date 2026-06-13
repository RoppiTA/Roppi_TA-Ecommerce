// roppi.backend.modulos/roppi.backend.mod.productos/materiales.bo.js
const materialesGateway = require('./materiales.gateway');
const Material = require('./material.model');

class MaterialesBO {

  async listarTodos() {
    const rows = await materialesGateway.findAll();
    return rows.map(row => new Material(row));
  }

  async obtenerPorId(id) {
    const row = await materialesGateway.findById(id);
    if (!row) return null;
    return new Material(row);
  }

}

module.exports = new MaterialesBO();