require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Usuario } = require('../src/models');

async function fixLourdes() {
  try {
    console.log('🔧 Iniciando corrección de LOURDES ARCENNETH...\n');

    // Conectar a la BD
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida\n');

    // Buscar usuario con LOURDES (puede tener espacios)
    const usuario = await Usuario.findOne({
      where: sequelize.where(
        sequelize.fn('TRIM', sequelize.col('nombre_usuario')),
        'ILIKE',
        'LOURDES ARCENNETH'
      )
    });

    if (!usuario) {
      console.log('❌ Usuario no encontrado');
      process.exit(0);
    }

    console.log(`📋 Usuario encontrado:`);
    console.log(`   ID: ${usuario.id_usuario}`);
    console.log(`   Nombre (actual): "${usuario.nombre_usuario}"`);
    console.log(`   Estado: ${usuario.estado ? 'Activo' : 'Inactivo'}`);
    console.log(`   Rol: ${usuario.rol}\n`);

    // Actualizar: TRIM nombre, activar, resetear contraseña
    const nombreLimpio = usuario.nombre_usuario.trim();
    const passwordNueva = 'usuario';
    const passwordHash = await bcrypt.hash(passwordNueva, 10);

    await usuario.update({
      nombre_usuario: nombreLimpio,
      estado: true,
      contrasena: passwordHash
    });

    console.log('✅ Actualizaciones aplicadas:\n');
    console.log(`   ✓ Nombre_usuario normalizado a: "${nombreLimpio}"`);
    console.log(`   ✓ Cuenta activada (estado = true)`);
    console.log(`   ✓ Contraseña reseteada a: "usuario" (hasheada)\n`);

    console.log('🎯 LOURDES ARCENNETH ya puede iniciar sesión con:');
    console.log(`   Usuario: LOURDES ARCENNETH`);
    console.log(`   Contraseña: usuario\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixLourdes();
