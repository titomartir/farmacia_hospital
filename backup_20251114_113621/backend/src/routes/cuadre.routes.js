const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const cuadreController = require('../controllers/cuadreController');
const { verificarToken, verificarRol } = require('../middleware/auth.middleware');
const { validarResultados } = require('../middleware/validate.middleware');

// Validaciones
const validacionIniciarCuadre = [
  body('id_personal_turnista')
    .notEmpty().withMessage('El personal turnista es requerido')
    .isInt().withMessage('ID de turnista inválido'),
  body('id_personal_bodeguero')
    .notEmpty().withMessage('El personal bodeguero es requerido')
    .isInt().withMessage('ID de bodeguero inválido')
];

const validacionConteo = [
  body('cantidad_fisica')
    .notEmpty().withMessage('La cantidad física es requerida')
    .isFloat({ min: 0 }).withMessage('La cantidad debe ser mayor o igual a 0')
];

// Todas las rutas requieren autenticación
router.use(verificarToken);

// GET /api/cuadres - Listar cuadres
router.get('/', cuadreController.listarCuadres);

// GET /api/cuadres/:id - Obtener cuadre por ID
router.get('/:id', cuadreController.obtenerCuadrePorId);

// POST /api/cuadres - Iniciar nuevo cuadre
router.post(
  '/',
  verificarRol(['administrador', 'bodeguero', 'turnista']),
  validacionIniciarCuadre,
  validarResultados,
  cuadreController.iniciarCuadre
);

// PUT /api/cuadres/:id_cuadre_stock/detalles/:id_detalle_cuadre - Registrar conteo
router.put(
  '/:id_cuadre_stock/detalles/:id_detalle_cuadre',
  verificarRol(['administrador', 'bodeguero', 'turnista']),
  validacionConteo,
  validarResultados,
  cuadreController.registrarConteo
);

// PUT /api/cuadres/:id/finalizar - Finalizar cuadre
router.put(
  '/:id/finalizar',
  verificarRol(['administrador', 'bodeguero']),
  cuadreController.finalizarCuadre
);

module.exports = router;
