const express = require('express');
const router = express.Router();
const catalogosController = require('../controllers/catalogosController');
const { verificarToken } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas de catálogos
router.get('/presentaciones', catalogosController.listarPresentaciones);
router.get('/unidades-medida', catalogosController.listarUnidadesMedida);
router.get('/proveedores', catalogosController.listarProveedores);
router.get('/servicios', catalogosController.listarServicios);

module.exports = router;
