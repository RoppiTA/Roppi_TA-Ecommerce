// Script de prueba para validar el login directamente contra la BD
// Uso: node test-login.js <correo> <contrasena>
// Ejemplo: node test-login.js ana@correo.com MiPass123

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const correo    = process.argv[2];
const contrasena = process.argv[3];

if (!correo || !contrasena) {
  console.log('\nUso: node test-login.js <correo> <contrasena>');
  console.log('Ejemplo: node test-login.js ana@correo.com MiPass123\n');
  process.exit(1);
}

async function main() {
  console.log('\n========== TEST DE LOGIN ==========');
  console.log(`Correo:     ${correo}`);
  console.log(`Contrasena: ${'*'.repeat(contrasena.length)}`);
  console.log('===================================\n');

  // 1. Verificar conexión a la BD
  const db = require('./roppi.backend.config/database.js');
  console.log('[1] Probando conexión a la BD...');
  const ok = await db.healthCheck();
  if (!ok) {
    console.error('❌ No se pudo conectar a la BD. Revisa las variables en .env\n');
    process.exit(1);
  }
  console.log('✅ Conexión OK\n');

  // 2. Buscar el usuario por correo
  const gateway = require('./roppi.backend.modulos/roppi.backend.modulos.usuarios/usuario.gateway.js');
  console.log('[2] Buscando usuario por correo...');
  const usuarioBD = await gateway.findByCorreo(correo);

  if (!usuarioBD) {
    console.error(`❌ No existe ningún usuario con el correo: "${correo}"`);
    console.log('   → Verifica que el correo sea exactamente igual al registrado (mayúsculas/minúsculas).\n');
    process.exit(1);
  }
  console.log('✅ Usuario encontrado:');
  console.log(`   ID:     ${usuarioBD.id}`);
  console.log(`   Nombre: ${usuarioBD.nombre}`);
  console.log(`   Activo: ${usuarioBD.activo}`);
  console.log(`   Roles:  ${usuarioBD.roles}\n`);

  // 3. Verificar que la cuenta esté activa
  console.log('[3] Verificando estado de la cuenta...');
  if (usuarioBD.activo !== 1) {
    console.error(`❌ La cuenta está INACTIVA (activo = ${usuarioBD.activo})`);
    console.log('   → La cuenta necesita ser activada por correo o manualmente en la BD.\n');
    process.exit(1);
  }
  console.log('✅ Cuenta activa\n');

  // 4. Comparar contraseña con bcrypt
  console.log('[4] Comparando contraseña con el hash guardado...');
  const bcrypt = require('bcrypt');
  const match = await bcrypt.compare(contrasena, usuarioBD.contrasena);

  if (!match) {
    console.error('❌ La contraseña NO coincide con el hash en la BD');
    console.log(`   Hash guardado: ${usuarioBD.contrasena.substring(0, 20)}...`);
    console.log('   → Verifica que no tengas espacios extra o que el Caps Lock no esté activo.\n');
    process.exit(1);
  }
  console.log('✅ Contraseña correcta\n');

  // 5. Todo OK — mostrar resultado completo
  console.log('========== RESULTADO ==========');
  console.log('✅ Login exitoso. Las credenciales son válidas.');
  console.log(`   Usuario: ${usuarioBD.nombre} (ID: ${usuarioBD.id})`);
  console.log(`   Roles:   ${usuarioBD.roles}`);
  console.log('================================\n');

  process.exit(0);
}

main().catch(err => {
  console.error('\n❌ Error inesperado:', err.message);
  process.exit(1);
});
