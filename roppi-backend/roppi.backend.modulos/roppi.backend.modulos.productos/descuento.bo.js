const descuentoGateway = require("./descuento.gateway");
const Descuento = require("./descuento.model");

class DescuentoBO {
    async listarTodos() {
        const rows = await descuentoGateway.findAll();
        return rows;
    }

    async obtenerPorId(id) {
        const rows = await descuentoGateway.findById(id);
        if (!rows) return null;
        return new Descuento(row);
    }

}

module.exports = new DescuentoBO();