const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth.middleware');
const { obtenerEstadisticasTiempoReal, obtenerMovimientosDia } = require('../controllers/dashboardTiempoRealController');
router.use(verificarToken);
router.get('/tiempo-real', obtenerEstadisticasTiempoReal);
router.get('/movimientos-dia', obtenerMovimientosDia);
module.exports = router;
