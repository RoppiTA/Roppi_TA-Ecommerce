// roppi.backend.modulos/roppi.backend.mod.productos/genericos.bo.js
const genericosGateway = require('./genericos.gateway');
const Generico = require('./generico.model');
const GenericoTamano = require('./tamanoGenerico.js');
const GenericoMaterial = require('./materialGenerico.js');
const GenericoPersonalizacion = require('./personalizacionGenerico.js');
const Color = require('./color.model');

class GenericosBO {

  ///////////////////////////////////////////
    // Listar todos los genéricos sin sus relaciones (tamaños, materiales, colores, personalizaciones)
  async listarTodos() {
    const rows = await genericosGateway.findAll();
    return rows.map(row => new Generico(row));
  }

    ///////////////////////////////////////////
  // Traer por id sí lista todas las relaciones del genérico (tamaños, materiales, colores, personalizaciones)
  async obtenerPorId(id) {
    // 1. Traer el genérico
    const row = await genericosGateway.findById(id);
    if (!row) return null;

    const generico = new Generico(row);

    // 2. Traer todas sus listas en paralelo
    const [tamanos, materiales, colores, personalizaciones] = await Promise.all([
      genericosGateway.findTamanosByGenerico(id),
      genericosGateway.findMaterialesByGenerico(id),
      genericosGateway.findColoresByGenerico(id),
      genericosGateway.findPersonalizacionesByGenerico(id),
    ]);

    // 3. Moldear con sus models
    generico.tamanos = tamanos.map(row => new GenericoTamano(row));
    generico.materiales = materiales.map(row => new GenericoMaterial(row));
    generico.colores = colores.map(row => new Color(row));
    generico.personalizaciones = personalizaciones.map(row => new GenericoPersonalizacion(row));

    return generico;
  }

  ///////////////////////////////////////////
  //para crear se debe realizar una inserción de todas sus relaciones. Se manejan a este nivel por que si falla alguna inserción, se revierte toda la operación.
  async crear({ nombre, descripcion, precioBase, maximoStock, tamanos, materiales, colores, personalizaciones, usuarioId }) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    //Insertar el genérico
    const genericoRow = await genericosGateway.createWithClient(client, {
      nombre, descripcion, precioBase, maximoStock, usuarioId
    });
    const idGenerico = genericoRow.id;

    // Insertar todas las relacinones de manera paralela
    await Promise.all([
      ...tamanos.map(t => genericosGateway.addTamanoWithClient(client, {
        idGenerico, idTamano: t.id, alto: t.alto, ancho: t.ancho, usuarioId
      })),
      ...materiales.map(m => genericosGateway.addMaterialWithClient(client, {
        idGenerico, idMaterial: m.id, costoExtra: m.costoExtra, usuarioId
      })),
      ...colores.map(c => genericosGateway.addColorWithClient(client, {
        idGenerico, idColor: c.id, usuarioId
      })),
      ...personalizaciones.map(p => genericosGateway.addPersonalizacionWithClient(client, {
        idGenerico, idPersonalizacion: p.id, costoExtra: p.costoExtra, usuarioId
      })),
    ]);

    // Generar todas las combinatorias de personalizados
    for (const tamano of tamanos) {
      for (const color of colores) {
        for (const material of materiales) {
          for (const personalizacion of personalizaciones) {
            const sku = `${idGenerico}-${tamano.id}-${color.id}-${material.id}-${personalizacion.id}`;
            const precio = precioBase + (material.costoExtra || 0) + (personalizacion.costoExtra || 0);
            await personalizadosGateway.createWithClient(client, {
              idGenerico, idTamano: tamano.id, idColor: color.id,
              idMaterial: material.id, idPersonalizacion: personalizacion.id,
              sku, precio, usuarioId
            });
          }
        }
      }
    }

    await client.query('COMMIT');
    return await this.obtenerPorId(idGenerico);

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

///////////////////////////////////////////
// MODIFICAR
//lo que estamos haciendo para actualizar las listas vinculadas es eliminar
//todas las relaciones anteriores y volver a insertar las nuevas. Esto es más sencillo de implementar
// aunque no es lo más óptimo. Para optimizar, tendríamos que comparar la lista anterior con la nueva 
// y solo eliminar/insertar lo que cambió.
    async actualizar(id, { nombre, descripcion, precioBase, maximoStock, 
                        tamanos, materiales, colores, personalizaciones, 
                        usuarioId }) {

        const existe = await genericosGateway.findById(id);
        if (!existe) throw new Error(`Genérico con ID ${id} no encontrado`);

        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            // 1. Actualizar datos básicos
            await genericosGateway.updateWithClient(client, id, {
            nombre, descripcion, precioBase, maximoStock, usuarioId
            });

            // 2. Si vienen listas, reemplazarlas
            if (tamanos) {
            await genericosGateway.removeTodosLosTamanosWithClient(client, id);
            for (const t of tamanos) {
                await genericosGateway.addTamanoWithClient(client, {
                idGenerico: id, idTamano: t.id, alto: t.alto, ancho: t.ancho, usuarioId
                });
            }
            }

            if (materiales) {
            await genericosGateway.removeTodosLosMaterialesWithClient(client, id);
            for (const m of materiales) {
                await genericosGateway.addMaterialWithClient(client, {
                idGenerico: id, idMaterial: m.id, costoExtra: m.costoExtra, usuarioId
                });
            }
            }

            if (colores) {
            await genericosGateway.removeTodosLosColoresWithClient(client, id);
            for (const c of colores) {
                await genericosGateway.addColorWithClient(client, {
                idGenerico: id, idColor: c.id, usuarioId
                });
            }
            }

            if (personalizaciones) {
            await genericosGateway.removeTodosLasPersonalizacionesWithClient(client, id);
            for (const p of personalizaciones) {
                await genericosGateway.addPersonalizacionWithClient(client, {
                idGenerico: id, idPersonalizacion: p.id, costoExtra: p.costoExtra, usuarioId
                });
            }
            }

            await client.query('COMMIT');
            return await this.obtenerPorId(id);

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async desactivar(id, usuarioId) {
        // 1. Verificar que existe
        const existe = await genericosGateway.findById(id);
        if (!existe) throw new Error(`Genérico con ID ${id} no encontrado`);

        // 2. Desactivar el genérico
        const row = await genericosGateway.deactivate(id, usuarioId);

        return new Generico(row);
    }

}

module.exports = new GenericosBO();