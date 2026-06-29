// Prueba de la API HTTP de cotizaciones (simula las llamadas del frontend)
// Uso:
//   node backend.tests/testApiCotizaciones.js <correo> <contrasena> [idCliente]
// Ejemplo:
//   node backend.tests/testApiCotizaciones.js cliente@test.com 123456
//   node backend.tests/testApiCotizaciones.js cliente@test.com 123456 5

const BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

const [, , correo, contrasena, idClienteArg] = process.argv;

if (!correo || !contrasena) {
    console.error('\nUso: node backend.tests/testApiCotizaciones.js <correo> <contrasena> [idCliente]\n');
    process.exit(1);
}

// ── helpers ────────────────────────────────────────────────────────────────

async function login(correo, contrasena) {
    const res = await fetch(`${BASE_URL}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena }),
    });
    const json = await res.json();
    if (!json.exito) throw new Error(`Login fallido: ${json.mensaje}`);
    return json.data; // { token, id, rol, nombre, ... }
}

async function getCotizacionesCliente(token, idCliente, page = 1, len = 10) {
    const res = await fetch(
        `${BASE_URL}/cotizaciones/solicitudes/cliente/${idCliente}?page=${page}&len=${len}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.json();
}

async function getCotizacionesComerciante(token, page = 1, len = 10) {
    const res = await fetch(
        `${BASE_URL}/cotizaciones/solicitudes/comerciante?page=${page}&len=${len}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.json();
}

// ── mapeo equivalente al del frontend ─────────────────────────────────────

function mapearCotizacion(c) {
    return {
        id:                  c.numero_cotizacion ?? c.id,
        version:             c.version_cotizacion ?? c.version,
        estado:              c.estado,
        cliente:             c.cliente_nombre ?? c.nombre ?? c.cliente,
        comerciante:         c.comerciante,
        fechaSolicitud:      c.fecha_creacion ?? c.fechaSolicitud,
        fechaVencimiento:    c.fecha_limite ?? c.fechaVencimiento,
        total:               c.total != null ? Number(c.total) : undefined,
        observacionesCliente: c.comentarios_cliente ?? c.observacionesCliente,
    };
}

// ── ejecución ─────────────────────────────────────────────────────────────

async function run() {
    console.log(`\n[1] Haciendo login con: ${correo} ...`);
    const usuario = await login(correo, contrasena);
    console.log(`    OK — id=${usuario.id}  rol=${usuario.rol}  nombre=${usuario.nombre}`);

    const token   = usuario.token;
    const idCliente = idClienteArg ? parseInt(idClienteArg) : usuario.id;

    // ── Test A: listar cotizaciones como CLIENTE ───────────────────────────
    console.log(`\n[2] GET /cotizaciones/solicitudes/cliente/${idCliente}?page=1&len=10`);
    const respCliente = await getCotizacionesCliente(token, idCliente);
    console.log('    Backend raw exito:', respCliente.exito);

    if (respCliente.exito && Array.isArray(respCliente.data)) {
        const cotizaciones = respCliente.data.map(mapearCotizacion);
        console.log(`    Total registros devueltos: ${cotizaciones.length}`);
        if (cotizaciones.length > 0) {
            console.log('\n    Listado (mapeado como el frontend):');
            console.table(cotizaciones);
        } else {
            console.log('    (Sin cotizaciones para este cliente)');
        }
    } else {
        console.log('    Respuesta inesperada:', JSON.stringify(respCliente, null, 2));
    }

    // ── Test B: listar cotizaciones como COMERCIANTE ───────────────────────
    console.log('\n[3] GET /cotizaciones/solicitudes/comerciante?page=1&len=10');
    const respComerciante = await getCotizacionesComerciante(token);
    console.log('    Backend raw exito:', respComerciante.exito);

    if (respComerciante.exito && Array.isArray(respComerciante.data)) {
        const cotizaciones = respComerciante.data.map(mapearCotizacion);
        console.log(`    Total registros devueltos: ${cotizaciones.length}`);
        if (cotizaciones.length > 0) {
            console.log('\n    Listado (mapeado como el frontend):');
            console.table(cotizaciones);
        } else {
            console.log('    (Sin cotizaciones en el sistema)');
        }
    } else {
        console.log('    Respuesta inesperada:', JSON.stringify(respComerciante, null, 2));
    }

    console.log('\nPruebas completadas.\n');
}

run().catch((err) => {
    console.error('\nError fatal:', err.message);
    process.exit(1);
});
