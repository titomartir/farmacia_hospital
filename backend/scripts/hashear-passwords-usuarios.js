const bcrypt = require('bcryptjs');
const { sequelize, Usuario } = require('../src/models');

async function hashearPasswordsUsuarios() {
  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('Conexión establecida correctamente.');

    // Obtener todos los usuarios
    const usuarios = await Usuario.findAll();
    console.log(`\nSe encontraron ${usuarios.length} usuarios.`);

    let actualizados = 0;
    
    for (const usuario of usuarios) {
      // Verificar si la contraseña ya está hasheada (bcrypt hashes empiezan con $2)
      if (!usuario.contrasena.startsWith('$2')) {
        console.log(`\nHasheando contraseña para: ${usuario.nombre_usuario}`);
        console.log(`  Contraseña actual: ${usuario.contrasena}`);
        
        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(usuario.contrasena, 10);
        
        // Actualizar el usuario
        await usuario.update({ contrasena: hashedPassword });
        
        console.log(`  ✓ Contraseña hasheada exitosamente`);
        actualizados++;
      } else {
        console.log(`\n✓ ${usuario.nombre_usuario} - contraseña ya está hasheada`);
      }
    }

    console.log(`\n=========================================`);
    console.log(`Proceso completado:`);
    console.log(`  Total usuarios: ${usuarios.length}`);
    console.log(`  Contraseñas actualizadas: ${actualizados}`);
    console.log(`  Ya hasheadas: ${usuarios.length - actualizados}`);
    console.log(`=========================================`);
    console.log(`\nPara hacer login usa:`);
    console.log(`  - Usuario: ILEANA MARIBEL (administrador)`);
    console.log(`  - Contraseña: admin`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

hashearPasswordsUsuarios();
