require('dotenv').config();
const { sequelize } = require('../src/config/database');

async function probarConexion() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  🔍 PROBANDO CONEXIÓN A POSTGRESQL');
  console.log('═══════════════════════════════════════════════════\n');

  console.log('📋 Configuración:');
  console.log(`   • Host:     ${process.env.DB_HOST}`);
  console.log(`   • Puerto:   ${process.env.DB_PORT}`);
  console.log(`   • Base:     ${process.env.DB_NAME}`);
  console.log(`   • Usuario:  ${process.env.DB_USER}`);
  console.log('');

  try {
    console.log('⏳ Conectando...');
    await sequelize.authenticate();
    console.log('✓ Conexión a PostgreSQL establecida correctamente\n');

    // Probar una consulta simple
    const [result] = await sequelize.query('SELECT version();');
    console.log('✓ Consulta de prueba exitosa');
    console.log(`PostgreSQL versión: ${result[0].version}\n`);

    console.log('✅ ¡CONEXIÓN EXITOSA!\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('  ✅ TODO CORRECTO - PUEDES CONTINUAR');
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('✗ Error al conectar con PostgreSQL:', error.message);
    console.error('');
    console.error('Posibles soluciones:');
    console.error('  1. Verifica que Docker esté corriendo: docker ps');
    console.error('  2. Verifica que PostgreSQL esté en puerto 5433');
    console.error('  3. Verifica las credenciales en el archivo .env');
    console.error('  4. Ejecuta: docker-compose up -d\n');
  } finally {
    await sequelize.close();
    process.exit();
  }
}

probarConexion();
