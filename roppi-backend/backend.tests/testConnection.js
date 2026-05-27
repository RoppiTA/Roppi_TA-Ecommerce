// backend.tests/testConnection.js
require('dotenv').config();
const db = require('../roppi.backend.config/database');

async function testConnection() {
  try {
    const ok = await db.healthCheck();
    if (ok) {
      console.log('Conexión a PostgreSQL exitosa!');
    } else {
      console.log('healthCheck falló');
    }
  } catch (error) {
    console.error('Error de conexión:', error.message);
  } finally {
    await db.close();
  }
}

testConnection();