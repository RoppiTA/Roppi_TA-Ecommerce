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

    // Acá creamos un descuento asociado un Producto Genérico. Esto se debe generar en la tabla
    // GENERICOSXDESCUENTOS y, adicionalmente, en DESCUENTOS usando el método de create en descuento.gateway.js
    // Ejemplo: { nombre: "Descuento Por Invierno", cantidad: 100, porcentaje: 0.2, usuarioId: 2, idProductos: [10, 11, 12, 13] }
    async crearDescuentoDeProducto({ nombre, cantidad, porcentaje, usuarioId, idProductos }) {
        const descuento = await descuentoGateway.create({ nombre, cantidad, porcentaje, usuarioId });
        const descuentoId = descuento.id;
        for (const idProducto of idProductos) {
            await descuentoGateway.createProductoDescuento(idProducto, descuentoId, usuarioId);
        }
        return descuento;
    }

    async eliminarDescuento(idDescuento) {
        const existenActivos = await descuentoGateway.findByDescuentoIdActivo(idDescuento);
        console.log(existenActivos);
        const existenInactivos = await descuentoGateway.findByDescuentoIdInactivo(idDescuento);
        //const client = await db.getClient();
        if (existenActivos[0]) {
            return 0;
        }
        else {
            try {
                //await client.query('BEGIN');
                if (existenInactivos[0]) {
                    descuentoGateway.deleteInactivos(idDescuento);
                }
                await descuentoGateway.delete(idDescuento);
            }
            catch (error) {
                //await client.query('ROLLBACK');
                throw error;
            }
            finally {
                return 1;
            }
        }
    }

    async actualizarDescuento(id, { nombre, cantidad, porcentaje, usuarioId }) {
        const descuentoActualizado = await descuentoGateway.update(id, { nombre, cantidad, porcentaje, usuarioId });
        return descuentoActualizado;
    }

}

module.exports = new DescuentoBO();