const descuentoGateway = require("./descuento.gateway");
const Descuento = require("./descuento.model");

class DescuentoBO {
    async listarTodos() {
        const rows = await descuentoGateway.findAll();
        return rows;
    }

    async obtenerPorId(id) {
        const row = await descuentoGateway.findById(id);
        if (!row) return null;
        return new Descuento(row);
    }

    // Obtiene solo los descuentos de un tipo de producto
    async obtenerDescuentosPorIdProducto(id) {
        const rows = await descuentoGateway.findByProductoId(id);
        return rows.map(row => new Descuento(row));
    }

    // Obtiene todos los descuentos de todos los productos. Es decir,
    // obtiene una lista de descuentos y cada descuento esta vinculado a 
    // una lista de productos.
    async obtenerDescuentos() {
        const rows = await descuentoGateway.findAllWithProductos();
        return rows.map(row => {
            const descuento = new Descuento(row);
            descuento.productos = row.productos; // Asignamos el array de productos generado en el SQL
            return descuento;
        });
    }

}

module.exports = new DescuentoBO();