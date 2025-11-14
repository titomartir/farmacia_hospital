require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/config/database');
const { QueryTypes } = require('sequelize');

async function hashExistingPasswords() {
  try {
    console.log('🔐 Iniciando hash de contraseñas...\n');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión establecida\n');

    // Obtener usuarios con contraseña en texto plano
    const usuarios = await sequelize.query(
      'SELECT id_usuario, nombre_usuario, password_hash FROM usuario',
      { type: QueryTypes.SELECT }
    );

    console.log(`📊 Se encontraron ${usuarios.length} usuarios\n`);

    // Hash de cada contraseña
    let actualizados = 0;
    for (const usuario of usuarios) {
      // Si la contraseña parece ser texto plano (no empieza con $2a$ o $2b$)
      if (!usuario.password_hash.startsWith('$2a$') && !usuario.password_hash.startsWith('$2b$')) {
        const passwordHash = await bcrypt.hash(usuario.password_hash, 10);
        
        await sequelize.query(
          'UPDATE usuario SET password_hash = :password_hash WHERE id_usuario = :id',
          {
            replacements: {
              password_hash: passwordHash,
              id: usuario.id_usuario
            },
            type: QueryTypes.UPDATE
          }
        );

        console.log(`✅ Usuario actualizado: ${usuario.nombre_usuario}`);
        actualizados++;
      } else {
        console.log(`⏭️  Usuario ya tiene hash: ${usuario.nombre_usuario}`);
      }
    }

    console.log(`\n🎉 Proceso completado: ${actualizados} contraseñas hasheadas`);
    console.log('\n💡 Ahora puedes iniciar sesión con:');
    console.log('   Usuario: (cualquier nombre de usuario existente)');
    console.log('   Contraseña: usuario');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

hashExistingPasswords();
