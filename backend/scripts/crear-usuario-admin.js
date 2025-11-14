require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Usuario, Rol, Personal } = require('../src/models');

async function crearUsuarioAdmin() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✓ Conectado a la base de datos');

    // Verificar si existe el rol de Admin
    let rolAdmin = await Rol.findOne({ where: { id_rol: 1 } });
    if (!rolAdmin) {
      console.log('Creando rol de Administrador...');
      rolAdmin = await Rol.create({
        nombre_rol: 'Administrador',
        descripcion: 'Acceso total al sistema',
        activo: true
      });
      console.log('✓ Rol de Administrador creado');
    }

    // Crear personal
    let personal = await Personal.findOne({ where: { id_personal: 1 } });
    if (!personal) {
      console.log('Creando registro de personal...');
      personal = await Personal.create({
        nombre_completo: 'Administrador del Sistema',
        puesto: 'Administrador',
        activo: true
      });
      console.log('✓ Personal creado');
    }

    // Verificar si el usuario ya existe
    const usuarioExiste = await Usuario.findOne({ 
      where: { nombre_usuario: 'admin' } 
    });

    if (usuarioExiste) {
      console.log('⚠ El usuario "admin" ya existe');
      console.log('Usuario:', usuarioExiste.nombre_usuario);
      console.log('Email:', usuarioExiste.email);
      return;
    }

    // Generar hash de la contraseña
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('✓ Hash de contraseña generado');

    // Crear usuario
    const nuevoUsuario = await Usuario.create({
      nombre_usuario: 'admin',
      email: 'admin@farmacia.com',
      password_hash: passwordHash,
      id_rol: rolAdmin.id_rol,
      id_personal: personal.id_personal,
      activo: true
    });

    console.log('\n' + '='.repeat(50));
    console.log('✅ USUARIO ADMINISTRADOR CREADO EXITOSAMENTE');
    console.log('='.repeat(50));
    console.log('\nCredenciales de acceso:');
    console.log('  Usuario:    admin');
    console.log('  Contraseña: admin123');
    console.log('  Email:      admin@farmacia.com');
    console.log('  Rol:        Administrador');
    console.log('\n' + '='.repeat(50));
    console.log('\n✓ Ahora puedes iniciar sesión con estas credenciales\n');

  } catch (error) {
    console.error('❌ Error al crear usuario:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

// Ejecutar
crearUsuarioAdmin();
