require('dotenv').config();
const { sequelize, Usuario } = require('../src/models');

async function listarUsuarios() {
  try {
    console.log('📋 Listando todos los usuarios...\n');

    await sequelize.authenticate();
    console.log('✅ Conexión establecida\n');

    const usuarios = await Usuario.findAll({
      attributes: ['id_usuario', 'nombre_usuario', 'rol', 'estado'],
      order: [['nombre_usuario', 'ASC']],
      raw: true
    });

    console.log('Usuarios en BD:\n');
    usuarios.forEach(u => {
      console.log(`ID: ${u.id_usuario.toString().padEnd(3)} | Nombre: "${u.nombre_usuario}" | Rol: ${u.rol.padEnd(15)} | Estado: ${u.estado}`);
    });

    // Buscar específicamente por LOURDES
    console.log('\n🔍 Buscando usuarios con "LOURDES":\n');
    const lourdes = usuarios.filter(u => u.nombre_usuario.includes('LOURDES'));
    if (lourdes.length === 0) {
      console.log('❌ No se encontró ningún usuario con "LOURDES"');
    } else {
      lourdes.forEach(u => {
        console.log(`ID: ${u.id_usuario} | "${u.nombre_usuario}" (longitud: ${u.nombre_usuario.length})`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listarUsuarios();
