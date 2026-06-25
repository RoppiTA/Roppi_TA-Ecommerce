require('dotenv').config({ path: '../.env' });
const CotizacionServer = require('./cotizaciones.server.js');

async function main() {
    try {
        const server = new CotizacionServer();
        await server.startServer();
    } catch (error) {
        console.error('No se pudo inicializar la API:', error);
        process.exit(1);
    }
}

main();