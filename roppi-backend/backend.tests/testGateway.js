// test-gateway.js
require('dotenv').config();
const coloresGateway = require('../roppi.backend.modulos/roppi.backend.modulos.productos/colores.gateway');

async function test() {
  try {
    console.log('🧪 Probando findAll de colores...');
    const colores = await coloresGateway.findAll();
    console.log('✅ Resultado:', colores);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit();
  }
}

test();