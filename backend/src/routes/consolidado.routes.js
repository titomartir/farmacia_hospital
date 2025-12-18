const express = require('express');
const router = express.Router();
const consolidadoController = require('../controllers/consolidadoController');
const { verificarToken } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// GET /api/consolidados - Listar con filtros
router.get('/', consolidadoController.listarConsolidados);

// GET /api/consolidados/:id - Obtener por ID
router.get('/:id', consolidadoController.obtenerConsolidadoPorId);

// POST /api/consolidados - Crear nuevo
router.post('/', consolidadoController.crearConsolidado);

// PUT /api/consolidados/:id - Actualizar consolidado (solo en estado activo)
router.put('/:id', consolidadoController.actualizarConsolidado);

// POST /api/consolidados/:id/aprobar - Aprobar consolidado
router.post('/:id/aprobar', consolidadoController.aprobarConsolidado);

// POST /api/consolidados/:id/cerrar - Cerrar consolidado
router.post('/:id/cerrar', consolidadoController.cerrarConsolidado);

// POST /api/consolidados/:id/entregar - Entregar consolidado
router.post('/:id/entregar', consolidadoController.entregarConsolidado);

// POST /api/consolidados/:id/anular - Anular consolidado
router.post('/:id/anular', consolidadoController.anularConsolidado);

module.exports = router;
