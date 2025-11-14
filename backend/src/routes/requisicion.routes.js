const express = require('express');
const router = express.Router();
const requisicionController = require('../controllers/requisicionController');
const { verificarToken } = require('../middleware/auth.middleware');

router.use(verificarToken);

// GET /api/requisiciones - Listar
router.get('/', requisicionController.listarRequisiciones);

// GET /api/requisiciones/:id - Obtener por ID
router.get('/:id', requisicionController.obtenerRequisicionPorId);

// POST /api/requisiciones - Crear nueva
router.post('/', requisicionController.crearRequisicion);

// POST /api/requisiciones/:id/aprobar - Aprobar
router.post('/:id/aprobar', requisicionController.aprobarRequisicion);

// POST /api/requisiciones/:id/entregar - Entregar
router.post('/:id/entregar', requisicionController.entregarRequisicion);

// POST /api/requisiciones/:id/rechazar - Rechazar
router.post('/:id/rechazar', requisicionController.rechazarRequisicion);

module.exports = router;
