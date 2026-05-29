require('dotenv').config({ path: '../api.env' }); // Datos de conexión, etc...
const APIServer = require('./api.server');

async function main() {
  try {
    const server = new APIServer();
    await server.startServer();
  } catch (error) {
    console.error('No se pudo inicializar la API:', error);
    process.exit(1);
  }
}

main();
