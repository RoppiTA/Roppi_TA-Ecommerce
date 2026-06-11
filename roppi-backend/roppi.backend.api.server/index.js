const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
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
