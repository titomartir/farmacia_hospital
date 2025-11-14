const jwt = require('jsonwebtoken');
const { Usuario, Personal } = require('../models');
const logger = require('../config/logger');

// Verificar token JWT
const verificarToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. No se proporcionó token de autenticación.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario en la base de datos
    const usuario = await Usuario.findByPk(decoded.id_usuario, {
      include: [
        { model: Personal, as: 'personal' }
      ]
    });

    if (!usuario || !usuario.estado) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o usuario inactivo.'
      });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    logger.error('Error en verificación de token:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al verificar la autenticación.'
    });
  }
};

// Verificar rol específico
const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado.'
      });
    }

    // Convertir a array si es string
    const roles = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];

    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para realizar esta acción.'
      });
    }

    next();
  };
};

module.exports = {
  verificarToken,
  verificarRol
};
