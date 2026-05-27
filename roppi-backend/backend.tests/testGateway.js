// test-gateway.js
require('dotenv').config();
const productosGateway = require('../roppi.backend.modulos/roppi.backend.modulos.productos/productos.gateway.js');

async function test() {
  try {
    console.log('🧪 Probando listarTodos...');
    const productos = await productosGateway.listarTodos();
    console.log('✅ Productos encontrados:', productos);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit();
  }
}

test();