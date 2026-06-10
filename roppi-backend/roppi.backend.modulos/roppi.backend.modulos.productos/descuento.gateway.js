const db = require('../../roppi.backend.config/database.js');

class DescuentoGateway {

    async findAll() {
        const result = await db.query(`
            SELECT * FROM "RoppiTA".DESCUENTOS
            WHERE ACTIVO = 1
        `);
        return result.rows;
    }

    async findById(id) {
        const result = await db.query(`
            SELECT * FROM "RoppiTA".DESCUENTOS
            WHERE ID = $1
        `, [id]);
        return result.rows[0];
    }

    async create({ nombre, cantidad, porcentaje, usuarioId }) {
        const result = await db.query(`
            INSERT INTO "RoppiTA".DESCUENTOS (NOMBRE, CANTIDAD, PORCENTAJE_DESCUENTO, USUARIO_CREACION, USUARIO_MODIFICACION)
            VALUES ($1, $2, $3, $4, $4) 
            RETURNING *`, [nombre, cantidad, porcentaje, usuarioId]);
        return result.rows[0];
    }

    async update(id, { nombre, cantidad, porcentaje, usuarioId }) {
        const result = await db.query(`
            UPDATE "RoppiTA".DESCUENTOS
            SET 
                NOMBRE = $2,
                CANTIDAD = $3,
                PORCENTAJE = $4,
                USUARIO_MODIFICACION = $5,
                FECHA_MODIFICACION = CURRENT_TIMESTAMP
            WHERE ID = $1
            RETURNING *`, [id, nombre, cantidad, porcentaje, usuarioId]);
        return result.rows[0];
    }

    async delete(id) {
        const result = await db.query(`
            DELETE FROM "RoppiTA".DESCUENTOS
            WHERE ID = $1`, [id]);
    }

    // ACA VA TODO LO DE LA TABLA GENERICOSXDESCUENTO

    async findByProductoId(idGenerico) {
        const result = await db.query(`
            SELECT 
                D.ID, 
                D.NOMBRE, 
                D.CANTIDAD, 
                D.PORCENTAJE_DESCUENTO AS PORCENTAJE
            FROM "RoppiTA".DESCUENTOS D
            INNER JOIN "RoppiTA".GENERICOSXDESCUENTOS GD ON D.ID = GD.ID_DESCUENTO
            WHERE GD.ID_GENERICO = $1 AND GD.ACTIVO = 1
        `, [idGenerico]);
        return result.rows;
    }

    async findAllWithProductos() {
        const result = await db.query(`
            SELECT 
                D.ID, 
                D.NOMBRE, 
                D.CANTIDAD, 
                D.PORCENTAJE_DESCUENTO AS PORCENTAJE,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', G.ID, 
                            'nombre', G.NOMBRE
                        )
                    ) FILTER (WHERE G.ID IS NOT NULL), 
                    '[]'
                ) AS productos
            FROM "RoppiTA".DESCUENTOS D
            LEFT JOIN "RoppiTA".GENERICOSXDESCUENTOS GD ON D.ID = GD.ID_DESCUENTO AND GD.ACTIVO = 1
            LEFT JOIN "RoppiTA".GENERICOS G ON GD.ID_GENERICO = G.ID
            GROUP BY D.ID
        `);
        return result.rows;
    }

    async createProductoDescuento(idProducto, idDescuento, idUsuario) {
        const result = await db.query(`
            INSERT INTO "RoppiTA".GENERICOSXDESCUENTOS (ID_GENERICO, ID_DESCUENTO, USUARIO_CREACION, USUARIO_MODIFICACION)
            VALUES ($1, $2, $3, $3)
            RETURNING *
        `, [idProducto, idDescuento, idUsuario]);
        return result.rows[0];
    }
}

module.exports = new DescuentoGateway();