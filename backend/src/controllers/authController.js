const jwt = require('jsonwebtoken');
const { Usuario, Personal } = require('../models');

// Login
const login = async (req, res) => {
  try {
    const { nombre_usuario, password } = req.body;

    // Validar campos requeridos
    if (!nombre_usuario || !password) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar nombre de usuario y contraseña'
      });
    }

    // Buscar usuario
    const usuario = await Usuario.findOne({
      where: { 
        nombre_usuario,
        estado: true 
      },
      include: [
        { 
          model: Personal, 
          as: 'personal',
          attributes: ['nombres', 'apellidos', 'email', 'cargo']
        }
      ]
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const passwordValida = await usuario.compararPassword(password);
    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Actualizar último login
    await usuario.update({ ultimo_login: new Date() });

    // Generar token
    const token = jwt.sign(
      { 
        id_usuario: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        rol: usuario.rol,
        tipo_turno: usuario.tipo_turno
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '8h' }
    );

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        usuario: {
          id_usuario: usuario.id_usuario,
          nombre_usuario: usuario.nombre_usuario,
          rol: usuario.rol,
          tipo_turno: usuario.tipo_turno,
          personal: usuario.personal
        }
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener perfil del usuario autenticado
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id_usuario, {
      include: [
        { 
          model: Personal, 
          as: 'personal',
          attributes: ['nombres', 'apellidos', 'email', 'cargo']
        }
      ],
      attributes: { exclude: ['contrasena'] }
    });

    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Cambiar contraseña
const cambiarPassword = async (req, res) => {
  try {
    const { password_actual, password_nueva } = req.body;

    if (!password_actual || !password_nueva) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar la contraseña actual y la nueva'
      });
    }

    const usuario = await Usuario.findByPk(req.usuario.id_usuario);

    // Verificar contraseña actual
    const passwordValida = await usuario.compararPassword(password_actual);
    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Actualizar contraseña (el hook la hasheará automáticamente)
    await usuario.update({ contrasena: password_nueva });

    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Sesión cerrada correctamente'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cerrar sesión',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Listar usuarios (para filtros y administración)
const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      include: [
        {
          model: Personal,
          as: 'personal',
          attributes: ['nombres', 'apellidos', 'email', 'cargo']
        }
      ],
      attributes: ['id_usuario', 'nombre_usuario', 'rol', 'tipo_turno', 'estado', 'fecha_creacion', 'ultimo_login'],
      order: [['nombre_usuario', 'ASC']]
    });

    res.json({
      success: true,
      data: usuarios
    });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al listar usuarios',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Crear nuevo usuario y personal
const crearUsuario = async (req, res) => {
  const { sequelize } = require('../config/database');
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      nombre_usuario, contrasena, rol, tipo_turno,
      nombres, apellidos, dpi, cargo, telefono, email 
    } = req.body;

    // Validar campos requeridos
    if (!nombre_usuario || !contrasena || !rol || !nombres || !apellidos || !cargo) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar nombre de usuario, contraseña, rol, nombres, apellidos y cargo'
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ where: { nombre_usuario } });
    if (usuarioExistente) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'El nombre de usuario ya existe'
      });
    }

    // Crear registro de personal primero
    const nuevoPersonal = await Personal.create({
      nombres,
      apellidos,
      dpi: dpi || null,
      cargo,
      telefono: telefono || null,
      email: email || null,
      estado: true
    }, { transaction });

    // Crear usuario vinculado al personal (el hash de contraseña se hace automáticamente en el hook)
    const nuevoUsuario = await Usuario.create({
      nombre_usuario,
      contrasena,
      rol,
      tipo_turno: tipo_turno || 'diurno',
      id_personal: nuevoPersonal.id_personal,
      estado: true
    }, { transaction });

    // Commit de la transacción
    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Usuario y personal creados exitosamente',
      data: {
        id_usuario: nuevoUsuario.id_usuario,
        nombre_usuario: nuevoUsuario.nombre_usuario,
        rol: nuevoUsuario.rol,
        tipo_turno: nuevoUsuario.tipo_turno,
        personal: {
          id_personal: nuevoPersonal.id_personal,
          nombres: nuevoPersonal.nombres,
          apellidos: nuevoPersonal.apellidos,
          cargo: nuevoPersonal.cargo
        }
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear usuario y personal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario y personal',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Actualizar usuario (rol y turno)
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, tipo_turno } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    await usuario.update({
      rol: rol || usuario.rol,
      tipo_turno: tipo_turno || usuario.tipo_turno
    });

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: usuario
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Cambiar contraseña de otro usuario (admin)
const cambiarPasswordUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nueva_contrasena } = req.body;

    if (!nueva_contrasena) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar la nueva contraseña'
      });
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Actualizar contraseña (el hash se hace automáticamente en el hook)
    await usuario.update({ contrasena: nueva_contrasena });

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Eliminar usuario (desactivar)
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // No permitir eliminar el propio usuario
    if (usuario.id_usuario === req.usuario.id_usuario) {
      return res.status(400).json({
        success: false,
        message: 'No puede eliminar su propio usuario'
      });
    }

    await usuario.update({ estado: false });

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Activar usuario (reactivar)
const activarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    await usuario.update({ estado: true });

    res.json({
      success: true,
      message: 'Usuario activado exitosamente'
    });
  } catch (error) {
    console.error('Error al activar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al activar usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  login,
  obtenerPerfil,
  cambiarPassword,
  logout,
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  cambiarPasswordUsuario,
  eliminarUsuario
  ,activarUsuario
};
