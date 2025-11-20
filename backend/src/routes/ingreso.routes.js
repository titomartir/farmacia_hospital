const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ingresoController = require('../controllers/ingresoController');
const { verificarToken, verificarRol } = require('../middleware/auth.middleware');
const { validarResultados } = require('../middleware/validate.middleware');

// Validaciones
const validacionIngreso = [
  body('tipo_ingreso')
    .notEmpty().withMessage('El tipo de ingreso es requerido')
    .isIn(['COMPRA', 'DONACION', 'TRANSFERENCIA', 'DEVOLUCION']).withMessage('Tipo de ingreso inválido'),
  body('id_proveedor')
    .if(body('tipo_ingreso').equals('COMPRA'))
    .notEmpty().withMessage('El proveedor es obligatorio para una compra'),
  body('detalles')
    .isArray({ min: 1 }).withMessage('Debe proporcionar al menos un detalle'),
  body('detalles.*.id_insumo_presentacion')
    .notEmpty().withMessage('Debe indicar la presentación del insumo'),
  body('detalles.*.cantidad')
    .isFloat({ min: 0.01 }).withMessage('La cantidad debe ser mayor a 0'),
  body('detalles.*.precio_unitario')
    .isFloat({ min: 0 }).withMessage('El precio debe ser mayor o igual a 0'),
  body('detalles.*.lote')
    .notEmpty().withMessage('El número de lote es requerido'),
  body('detalles.*.fecha_vencimiento')
    .isDate().withMessage('La fecha de vencimiento es inválida')
];

const validacionAnulacion = [
  body('motivo_anulacion')
    .notEmpty().withMessage('Debe proporcionar un motivo de anulación')
];

// Todas las rutas requieren autenticación
router.use(verificarToken);

// GET /api/ingresos - Listar ingresos
router.get('/', ingresoController.listarIngresos);

// GET /api/ingresos/estadisticas - Obtener estadísticas
router.get('/estadisticas', ingresoController.obtenerEstadisticas);

// GET /api/ingresos/lotes - Obtener lotes disponibles
router.get('/lotes', ingresoController.obtenerLotes);

// GET /api/ingresos/:id - Obtener ingreso por ID
router.get('/:id', ingresoController.obtenerIngresoPorId);

// POST /api/ingresos - Crear nuevo ingreso
router.post(
  '/',
  verificarRol(['administrador', 'farmaceutico', 'bodeguero']),
  validacionIngreso,
  validarResultados,
  ingresoController.crearIngreso
);

// PUT /api/ingresos/:id/anular - Anular ingreso
router.put(
  '/:id/anular',
  verificarRol(['administrador', 'farmaceutico']),
  validacionAnulacion,
  validarResultados,
  ingresoController.anularIngreso
);

module.exports = router;
