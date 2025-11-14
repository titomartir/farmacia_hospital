const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verificarToken } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas
router.get('/estadisticas', dashboardController.obtenerEstadisticas);
router.get('/alertas', dashboardController.obtenerAlertas);
router.get('/movimientos-recientes', dashboardController.obtenerMovimientosRecientes);

// Rutas para gráficos
router.get('/graficos/consumo-servicio', dashboardController.consumoPorServicio);
router.get('/graficos/stock-estado', dashboardController.stockPorEstado);
router.get('/graficos/tendencia-requisiciones', dashboardController.tendenciaRequisiciones);
router.get('/graficos/proximos-vencer', dashboardController.proximosVencer);
router.get('/graficos/costos-servicio', dashboardController.costosPorServicio);

module.exports = router;
