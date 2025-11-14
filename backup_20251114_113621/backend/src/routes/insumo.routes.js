const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const insumoController = require('../controllers/insumoController');
const { verificarToken } = require('../middleware/auth.middleware');
const { validarResultados } = require('../middleware/validate.middleware');

// Validaciones
const validacionInsumo = [
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('descripcion').optional()
];

const validacionInsumoConPresentacion = [
  body('nombre').notEmpty().withMessage('El nombre del insumo es requerido'),
  body('id_presentacion').notEmpty().isInt().withMessage('La presentación es requerida'),
  body('id_unidad_medida').notEmpty().isInt().withMessage('La unidad de medida es requerida'),
  body('cantidad_presentacion').notEmpty().isFloat({ min: 0.01 }).withMessage('La cantidad debe ser mayor a 0')
];

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas
router.get('/', insumoController.listarInsumos);
router.get('/presentaciones/lista', insumoController.listarInsumosPresentaciones);
router.get('/:id', insumoController.obtenerInsumoPorId);
router.post('/', validacionInsumo, validarResultados, insumoController.crearInsumo);

// Registro dinámico de insumo con presentación (para ingresos)
router.post(
  '/con-presentacion',
  validacionInsumoConPresentacion,
  validarResultados,
  insumoController.crearInsumoConPresentacion
);

router.put('/:id', validacionInsumo, validarResultados, insumoController.actualizarInsumo);
router.delete('/:id', insumoController.eliminarInsumo);

module.exports = router;
