/**
 * Script para hashear las contraseñas existentes en la base de datos
 * Las contraseñas actuales están en texto plano ("usuario")
 */

const bcrypt = require('bcryptjs');
const { Usuario } = require('./src/models');

async function hashearPasswords() {
  try {
    console.log('🔐 Iniciando proceso de hasheo de contraseñas...\n');

    // Obtener todos los usuarios con contraseñas sin hashear
    const usuarios = await Usuario.findAll({
      attributes: ['id_usuario', 'nombre_usuario', 'contrasena']
    });

    console.log(`📊 Total de usuarios encontrados: ${usuarios.length}\n`);

    let actualizados = 0;
    let yaHasheados = 0;

    for (const usuario of usuarios) {
      // Verificar si la contraseña ya está hasheada (empieza con $2a$ o $2b$)
      if (usuario.contrasena.startsWith('$2a$') || usuario.contrasena.startsWith('$2b$')) {
        console.log(`✓ ${usuario.nombre_usuario} - Ya hasheada`);
        yaHasheados++;
        continue;
      }

      // Hashear la contraseña
      const hash = await bcrypt.hash(usuario.contrasena, 10);
      
      // Actualizar en la base de datos
      await usuario.update({ contrasena: hash });
      
      console.log(`✅ ${usuario.nombre_usuario} - Contraseña hasheada`);
      actualizados++;
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Proceso completado`);
    console.log(`   - Contraseñas actualizadas: ${actualizados}`);
    console.log(`   - Ya estaban hasheadas: ${yaHasheados}`);
    console.log(`   - Total procesados: ${usuarios.length}`);
    console.log('='.repeat(50));

    process.exit(0);

  } catch (error) {
    console.error('❌ Error al hashear contraseñas:', error);
    process.exit(1);
  }
}

// Ejecutar
hashearPasswords();
