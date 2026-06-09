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
            INSERT INTO "RoppiTA".DESCUENTOS (NOMBRE, CANTIDAD, PORCENTAJE, USUARIO_CREACION, USUARIO_MODIFICACION)
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
}

module.exports = new DescuentoGateway();