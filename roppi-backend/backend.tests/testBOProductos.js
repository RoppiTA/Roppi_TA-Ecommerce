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

async function testCrear(){
  console.log('\nProbando crear una mochila:');
  const generico = await genericosBO.crear( {nombre:'Mochila', descripcion:'Mochila', precioBase: 12,
    maximoStock: 100, urlImagen: 'assets/maxwell.jpg',
    tamanos:[{ id: 1, alto: 100, ancho: 50 },{ id: 2, alto: 200, ancho: 80 }],
    materiales:[{id: 1, costoExtra: 10}],
    colores:[{id: 3}],
    personalizaciones:[{id: 1, costoExtra: 20}], usuarioId:1} );
  if(generico){
    console.log("ID de la mochila creada: ", generico);
  }
  else {
    console.log('No se creó la mochila');
  }
}

async function testActualizar(){
  console.log('\nProbando actualizar la mochila previa:'); // Actualmente id = 17
  const generico = await genericosBO.actualizar( 17, {nombre:'Mochila 2', descripcion:'Mochila actualizada',
    precioBase: 120, maximoStock: 100, urlImagen: 'assets/maxwell.jpg',
    tamanos:[{ id: 1, alto: 100, ancho: 50 },{ id: 3, alto: 400, ancho: 80 }],
    materiales:[{id: 2, costoExtra: 20}], colores:[{id: 2}],
    personalizaciones:[{id: 2, costoExtra: 30}], usuarioId:1} );
  if(generico){
    console.log("ID de la mochila creada: ", generico);
  }
  else {
    console.log('No se creó la mochila');
  }
}

async function runListar() {
  try {
    await testListar();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

async function runID() {
  try {
    await testObtenerPorId();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

async function runCrear(){
  try {
    await testCrear();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

async function runActualizar(){
  try {
    await testActualizar();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

runActualizar();