require('dotenv').config({ path: '../.env' });
const ProductServer = require('./producto.server.js');

async function main() {
  try {
    const server = new ProductServer();
    await server.startServer();
  } catch (error) {
    console.error('No se pudo inicializar la API:', error);
    process.exit(1);
  }
}

main();