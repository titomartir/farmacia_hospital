const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const { verificarToken } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verificarToken);

/**
 * GET /api/reportes/resumen-total
 * Resumen total por medicamento (todos los servicios)
 * Query params: fecha_desde, fecha_hasta
 */
router.get('/resumen-total', reporteController.resumenTotalMedicamentos);

/**
 * GET /api/reportes/resumen-servicio
 * Resumen total por medicamento (por servicio)
 * Query params: fecha_desde, fecha_hasta, id_servicio
 */
router.get('/resumen-servicio', reporteController.resumenPorServicio);

/**
 * GET /api/reportes/consumo-servicio
 * Consumo comparado por servicio
 * Query params: fecha_desde, fecha_hasta
 */
router.get('/consumo-servicio', reporteController.consumoPorServicio);

/**
 * GET /api/reportes/stock-actual
 * Stock actual y alertas
 */
router.get('/stock-actual', reporteController.stockActual);

/**
 * GET /api/reportes/kardex/:id_insumo
 * Kardex de un medicamento específico
 * Query params: fecha_inicio, fecha_fin
 */
router.get('/kardex/:id_insumo', reporteController.generarKardex);

module.exports = router;
