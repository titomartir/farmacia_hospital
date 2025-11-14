const { validationResult } = require('express-validator');

// Middleware para validar resultados de express-validator
const validarResultados = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array().map(err => ({
        campo: err.path || err.param,
        mensaje: err.msg
      }))
    });
  }
  
  next();
};

module.exports = { validarResultados };
