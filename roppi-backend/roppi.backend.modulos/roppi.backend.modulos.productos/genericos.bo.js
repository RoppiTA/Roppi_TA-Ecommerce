// roppi.backend.modulos/roppi.backend.mod.productos/genericos.bo.js
const genericosGateway = require('./genericos.gateway');
const Generico = require('./generico.model');
const GenericoTamano = require('./tamanoGenerico.js');
const GenericoMaterial = require('./materialGenerico.js');
const GenericoPersonalizacion = require('./personalizacionGenerico.js');
const Color = require('./color.model');
const db = require('../../roppi.backend.config/database.js');

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
  async crear({ nombre, descripcion, precioBase, maximoStock, urlImagen, posicionX, posicionY, tamanos, materiales, colores, personalizaciones, usuarioId }) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      //Insertar el genérico
      console.log(nombre);
      const genericoRow = await genericosGateway.createWithClient(client,
        { nombre, descripcion, precioBase, maximoStock, urlImagen, usuarioId, posicionX, posicionY });
      const idGenerico = genericoRow.id;

      // Insertar todas las relacinones de manera paralela
      await Promise.all([
        ...tamanos.map(t => genericosGateway.addTamanoWithClient(client, {
          idGenerico: idGenerico, idTamano: t.id, alto: t.alto, ancho: t.ancho, usuarioId: usuarioId
        })),
        ...materiales.map(m => genericosGateway.addMaterialWithClient(client, {
          idGenerico: idGenerico, idMaterial: m.id, costoExtra: m.costoExtra, usuarioId: usuarioId
        })),
        ...colores.map(c => genericosGateway.addColorWithClient(client, {
          idGenerico: idGenerico, idColor: c.id, usuarioId: usuarioId
        })),
        ...personalizaciones.map(p => genericosGateway.addPersonalizacionWithClient(client, {
          idGenerico: idGenerico, idPersonalizacion: p.id, costoExtra: p.costoExtra, usuarioId: usuarioId
        })),
      ]);

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
//lo que estamos haciendo para actualizar las listas vinculadas es comparar la lista anterior con la nueva 
// y solo eliminar/insertar lo que cambió.
  async actualizar(id, { nombre, descripcion, precioBase, maximoStock, urlImagen,
    tamanos, materiales, colores, personalizaciones, usuarioId, posicionX, posicionY
  }) {

    // Obtener el producto actual con sus atributos
    const existe = await genericosGateway.findById(id);
    if (!existe) throw new Error(`Genérico con ID ${id} no encontrado`);

    const coloresActuales = await genericosGateway.findColoresByGenerico(id);
    const materialesActuales = await genericosGateway.findMaterialesByGenerico(id);
    const tamanosActuales = await genericosGateway.findTamanosByGenerico(id);
    const personalizacionesActuales = await genericosGateway.findPersonalizacionesByGenerico(id);

    // Obtener los atributos a insertar y eliminar

      const oldIdsT = new Set(tamanosActuales.map(x => Number(x.id)));
      const newIdsT = new Set(tamanos.map(x => Number(x.id)));
      
      const tamanosBorrar = tamanosActuales.filter(x => !newIdsT.has(Number(x.id)));
      const tamanosInsertar = tamanos.filter(x => !oldIdsT.has(Number(x.id)));


      const oldIdsM = new Set(materialesActuales.map(x => x.id));
      const newIdsM = new Set(materiales.map(x => x.id));

      const materialesBorrar = materialesActuales.filter(x => !newIdsM.has(x.id));
      const materialesInsertar = materiales.filter(x => !oldIdsM.has(x.id));


      const oldIdsC = new Set(coloresActuales.map(x => x.id));
      const newIdsC = new Set(colores.map(x => x.id));

      const coloresBorrar = coloresActuales.filter(x => !newIdsC.has(x.id));
      const coloresInsertar = colores.filter(x => !oldIdsC.has(x.id));


      const oldIdsP = new Set(personalizacionesActuales.map(x => x.id));
      const newIdsP = new Set(personalizaciones.map(x => x.id));

      const personalizacionesBorrar = personalizacionesActuales.filter(x => !newIdsP.has(x.id));
      const personalizacionesInsertar = personalizaciones.filter(x => !oldIdsP.has(x.id));
      
      const tamanosActualizar = tamanos.filter(t => {
        const actual = tamanosActuales.find(a => Number(a.id) === Number(t.id));
        if (!actual) return false;
        return (Number(actual.alto) !== Number(t.alto) || Number(actual.ancho) !== Number(t.ancho));
      });
      const materialesActualizar = materiales.filter(m => {
        const actual = materialesActuales.find(a => Number(a.id) === Number(m.id));
        if (!actual) return false;
        return (Number(actual.costoExtra) !== Number(m.costoExtra));
      });
      const personalizacionesActualizar = personalizaciones.filter(p => {
        const actual = personalizacionesActuales.find(a => Number(a.id) === Number(p.id));
        if (!actual) return false;
        return (Number(actual.costoExtra) !== Number(p.costoExtra));
      });

      // hacerlo
      const client = await db.getClient();
      try {
          await client.query('BEGIN');

      await genericosGateway.updateWithClient(client, id, {
        nombre: nombre, descripcion: descripcion, precioBase: precioBase, maximoStock: maximoStock,
        urlImagen: urlImagen, usuarioId: usuarioId, posicionX: posicionX, posicionY: posicionY
      });

          await Promise.all([
                ...tamanosInsertar.map(t => genericosGateway.addTamanoWithClient(client, {
                  idGenerico: id, idTamano: t.id, alto: t.alto, ancho: t.ancho, usuarioId: usuarioId
                })),
                ...tamanosBorrar.map(t => genericosGateway.removeParTamanoWithClient(client, id, t.id)),
                ...materialesInsertar.map(m => genericosGateway.addMaterialWithClient(client, {
                  idGenerico: id, idMaterial: m.id, costoExtra: m.costo_extra, usuarioId: usuarioId
                })),
                ...materialesBorrar.map(m => genericosGateway.removeParMaterialWithClient(client, id, m.id)),
                ...coloresInsertar.map(c => genericosGateway.addColorWithClient(client, {
                  idGenerico: id, idColor: c.id, usuarioId: usuarioId
                })),
                ...coloresBorrar.map(c => genericosGateway.removeParColorWithClient(client, id, c.id)),
                ...personalizacionesInsertar.map(p => genericosGateway.addPersonalizacionWithClient(client, {
                  idGenerico: id, idPersonalizacion: p.id, costoExtra: p.costo_extra, usuarioId: usuarioId
                })),
                ...personalizacionesBorrar.map(p => genericosGateway.removeParPersonalizacionWithClient(client, id, p.id)),
          ]);

           await Promise.all([
            ...tamanosActualizar.map(t => genericosGateway.updateTamanoWithClient(client, {
                  idGenerico: id, idTamano: t.id, alto: t.alto, ancho: t.ancho, usuarioId: usuarioId
                })),
            ...materialesActualizar.map(m => genericosGateway.updateMaterialWithClient(client, {
                  idGenerico: id, idMaterial: m.id, costoExtra: m.costoExtra, usuarioId: usuarioId
                })),
            ...personalizacionesActualizar.map(p => genericosGateway.updatePersonalizacionWithClient(client, {
                  idGenerico: id, idPersonalizacion: p.id, costoExtra: p.costoExtra, usuarioId: usuarioId
                })),
          ]);
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