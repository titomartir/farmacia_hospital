const logger = require('../config/logger');

/**
 * Middleware para verificar que el usuario sea personal turnista (24 horas)
 * Solo personal con tipo_turno = '24_horas' o es_turnista = true puede acceder
 */
const verificarTurnista = (req, res, next) => {
  try {
    const usuario = req.usuario;

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Verificar si es turnista
    if (usuario.es_turnista || usuario.tipo_turno === '24_horas' || usuario.rol === 'turnista') {
      logger.info(`Acceso a recurso de stock 24h: Usuario ${usuario.nombre_usuario} (turnista)`);
      return next();
    }

    logger.warn(`Acceso denegado a stock 24h: Usuario ${usuario.nombre_usuario} no es turnista`);
    
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado: Solo personal de turno 24 horas puede acceder a esta función'
    });
  } catch (error) {
    logger.error('Error en middleware verificarTurnista:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar permisos',
      error: error.message
    });
  }
};

/**
 * Middleware para verificar que el usuario tenga permisos de administrador o turnista
 */
const verificarAdminOTurnista = (req, res, next) => {
  try {
    const usuario = req.usuario;

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Verificar si es admin o turnista
    if (
      usuario.rol === 'administrador' ||
      usuario.es_turnista ||
      usuario.tipo_turno === '24_horas' ||
      usuario.rol === 'turnista'
    ) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Acceso denegado: Requiere permisos de administrador o personal de turno 24h'
    });
  } catch (error) {
    logger.error('Error en middleware verificarAdminOTurnista:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar permisos',
      error: error.message
    });
  }
};

module.exports = {
  verificarTurnista,
  verificarAdminOTurnista
};
