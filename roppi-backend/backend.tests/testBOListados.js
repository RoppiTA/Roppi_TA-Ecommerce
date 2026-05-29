// backend.tests/testCatalogosBO.js
require('dotenv').config();
const tamanosBO = require('../roppi.backend.modulos/roppi.backend.modulos.productos/tamanos.bo');
const materialesBO = require('../roppi.backend.modulos/roppi.backend.modulos.productos/materiales.bo');
const coloresBO = require('../roppi.backend.modulos/roppi.backend.modulos.productos/colores.bo');
const personalizacionesBO = require('../roppi.backend.modulos/roppi.backend.modulos.productos/personalizaciones.bo');

async function run() {
  try {
    const [tamanos, materiales, colores, personalizaciones] = await Promise.all([
      tamanosBO.listarTodos(),
      materialesBO.listarTodos(),
      coloresBO.listarTodos(),
      personalizacionesBO.listarTodos(),
    ]);

    console.log('Tamaños:', tamanos);
    console.log('Materiales:', materiales);
    console.log('Colores:', colores);
    console.log('Personalizaciones:', personalizaciones);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

run();