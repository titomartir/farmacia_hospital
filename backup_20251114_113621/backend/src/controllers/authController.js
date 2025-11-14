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

// Listar usuarios (para filtros)
const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      where: { estado: true },
      include: [
        {
          model: Personal,
          as: 'personal',
          attributes: ['nombres', 'apellidos']
        }
      ],
      attributes: ['id_usuario', 'nombre_usuario', 'rol'],
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

module.exports = {
  login,
  obtenerPerfil,
  cambiarPassword,
  logout,
  listarUsuarios
};
