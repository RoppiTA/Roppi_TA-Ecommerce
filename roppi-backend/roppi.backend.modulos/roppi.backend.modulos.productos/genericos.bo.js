// roppi.backend.modulos/roppi.backend.mod.productos/genericos.bo.js
const genericosGateway = require('./genericos.gateway');
const Generico = require('./generico.model');
const Tamano = require('./tamano.model');
const Material = require('./material.model');
const Color = require('./color.model');
const Personalizacion = require('./personalizacion.model');

class GenericosBO {

    // Listar todos los genéricos sin sus relaciones (tamaños, materiales, colores, personalizaciones)
  async listarTodos() {
    const rows = await genericosGateway.findAll();
    return rows.map(row => new Generico(row));
  }

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
    generico.tamanos = tamanos.map(row => new Tamano(row));
    generico.materiales = materiales.map(row => new Material(row));
    generico.colores = colores.map(row => new Color(row));
    generico.personalizaciones = personalizaciones.map(row => new Personalizacion(row));

    return generico;
  }

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

}

module.exports = new GenericosBO();