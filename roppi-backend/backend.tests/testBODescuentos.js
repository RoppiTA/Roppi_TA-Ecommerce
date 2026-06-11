// backend.tests/testBODescuentos.js
require('dotenv').config();
const descuentosBO = require('../roppi.backend.modulos/roppi.backend.modulos.productos/descuento.bo');

async function testCrear(){
  console.log('\nProbando crear un descuento:');
  const generico = await descuentosBO.crearDescuentoDeProducto( {nombre:'ProbarCreacion3', cantidad: 10, porcentaje:10, usuarioId: 1, idProductos:[17]});
  if(generico){
    console.log("ID del descuento creado: ", generico);
  }
  else {
    console.log('SI SE CREO PERO NO RETORNA NADA POR QUEEEEEEEE');
  }
}

async function testEliminar(){
  console.log('\nProbando crear un descuento:');
  const eliminado = await descuentosBO.eliminarDescuento(13);
  if(eliminado){
    console.log("Hecho");
  }
  else {
    console.log('como?');
  }
}

testEliminar();