require('dotenv').config();
const { sequelize } = require('../src/models');
const { QueryTypes } = require('sequelize');

async function listarTodos() {
  try {
    console.log('📋 Listando TODOS los usuarios sin filtros...\n');

    await sequelize.authenticate();
    console.log('✅ Conexión establecida\n');

    // Query crudo sin filtros
    const usuarios = await sequelize.query(
      `SELECT id_usuario, nombre_usuario, rol, estado FROM usuario ORDER BY nombre_usuario ASC;`,
      { type: QueryTypes.SELECT, raw: true }
    );

    console.log(`Total de usuarios encontrados: ${usuarios.length}\n`);
    console.log('Usuarios en BD:\n');
    usuarios.forEach((u, i) => {
      console.log(`${(i+1).toString().padEnd(2)}. ID: ${u.id_usuario.toString().padEnd(3)} | Nombre: "${u.nombre_usuario}" | Rol: ${u.rol.padEnd(15)} | Estado: ${u.estado}`);
    });

    // Buscar específicamente a LOURDES
    console.log('\n\n🔍 Buscando usuarios que contengan "LOURDES" (case-insensitive):\n');
    const lourdes = usuarios.filter(u => u.nombre_usuario.toUpperCase().includes('LOURDES'));
    if (lourdes.length === 0) {
      console.log('❌ No se encontró ningún usuario con "LOURDES"');
    } else {
      lourdes.forEach(u => {
        console.log(`   ID: ${u.id_usuario} | "${u.nombre_usuario}" (longitud: ${u.nombre_usuario.length} chars)`);
      });
    }

    // Buscar ANA MERCEDES y ERNESTO
    console.log('\n🔍 Buscando "ANA MERCEDES":\n');
    const ana = usuarios.filter(u => u.nombre_usuario.toUpperCase().includes('ANA'));
    if (ana.length === 0) {
      console.log('❌ No encontrado');
    } else {
      ana.forEach(u => console.log(`   ${u.nombre_usuario}`));
    }

    console.log('\n🔍 Buscando "ERNESTO":\n');
    const ernesto = usuarios.filter(u => u.nombre_usuario.toUpperCase().includes('ERNESTO'));
    if (ernesto.length === 0) {
      console.log('❌ No encontrado');
    } else {
      ernesto.forEach(u => console.log(`   ${u.nombre_usuario}`));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listarTodos();
