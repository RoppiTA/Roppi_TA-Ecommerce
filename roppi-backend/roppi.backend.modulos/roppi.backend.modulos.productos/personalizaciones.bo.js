// roppi.backend.modulos/roppi.backend.mod.productos/personalizaciones.bo.js
const personalizacionesGateway = require('./personalizaciones.gateway');
const Personalizacion = require('./personalizacion.model');

class PersonalizacionesBO {

  async listarTodos() {
    const rows = await personalizacionesGateway.findAll();
    return rows.map(row => new Personalizacion(row));
  }

  async obtenerPorId(id) {
    const row = await personalizacionesGateway.findById(id);
    if (!row) return null;
    return new Personalizacion(row);
  }

}

module.exports = new PersonalizacionesBO();
