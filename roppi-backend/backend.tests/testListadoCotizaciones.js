// Uso: node backend.tests/testListadoCotizaciones.js [idCliente]
require('dotenv').config();
const db = require('../roppi.backend.config/database');
const cotizacionBO = require('../roppi.backend.modulos/roppi.backend.modulos.cotizaciones/cotizacion.bo');

const idCliente = parseInt(process.argv[2]) || null;

async function test() {
  try {
    // 1. Ver todos los estados distintos en la tabla (sin filtro de usuario)
    console.log('\n--- Estados en COTIZACIONES (todos los usuarios) ---');
    const estados = await db.query(
      `SELECT estado, COUNT(*) as total FROM "RoppiTA".COTIZACIONES GROUP BY estado ORDER BY estado`
    );
    console.table(estados.rows);

    // 2. Ver todas las SOLICITADA (sin filtro de usuario)
    console.log('\n--- Cotizaciones SOLICITADA (todos los usuarios) ---');
    const solicitadas = await db.query(
      `SELECT numero_cotizacion, version_cotizacion, id_usuario, estado, fecha_creacion
       FROM "RoppiTA".COTIZACIONES
       WHERE estado = 'SOLICITADA'
       ORDER BY fecha_creacion DESC
       LIMIT 10`
    );
    console.table(solicitadas.rows);

    // 3. Si se pasó idCliente, ejecutar el BO completo
    if (idCliente) {
      console.log(`\n--- listarTodasLasCotizacionesPorCliente(idCliente=${idCliente}) ---`);
      const result = await cotizacionBO.listarTodasLasCotizacionesPorCliente(idCliente, 1, 10);
      console.log('Resultado BO:', JSON.stringify(result, null, 2));
    } else {
      console.log('\n[INFO] Pasa el id del cliente como argumento para probar el BO:');
      console.log('  node backend.tests/testListadoCotizaciones.js <idCliente>');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await db.close();
    process.exit();
  }
}

test();
