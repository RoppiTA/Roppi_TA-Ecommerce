// backend.tests/testGenericosBO.js
require('dotenv').config();
const genericosBO = require('../roppi.backend.modulos/roppi.backend.modulos.productos/genericos.bo');

async function testListar() {
  console.log('Probando listarTodos...');
  const genericos = await genericosBO.listarTodos();
  console.log('Genéricos encontrados:', genericos);
  console.log('Total:', genericos.length);
}

async function testObtenerPorId() {
  console.log('\nProbando obtenerPorId con ID = 1...');
  const generico = await genericosBO.obtenerPorId(1);
  if (generico) {
    console.log('Genérico encontrado:', generico);
    console.log('Tamaños:', generico.tamanos);
    console.log('Colores:', generico.colores);
    console.log('Materiales:', generico.materiales);
    console.log('Personalizaciones:', generico.personalizaciones);
  } else {
    console.log('No se encontró genérico con ID 1');
  }
}

async function run() {
  try {
    await testListar();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

run();