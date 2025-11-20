const express = require('express');
const router = express.Router();
const stock24hController = require('../controllers/stock24hController');
const { verificarToken } = require('../middleware/auth.middleware');
const { verificarAdminOTurnista } = require('../middleware/turnista.middleware');

// Aplicar verificación de token a todas las rutas
router.use(verificarToken);

// Aplicar verificación de turnista a todas las rutas de stock 24h
router.use(verificarAdminOTurnista);

// GET /api/stock-24h/estadisticas - Obtener estadísticas
router.get('/estadisticas', stock24hController.obtenerEstadisticas);

// GET /api/stock-24h - Listar stock con alertas
router.get('/', stock24hController.listarStock24h);

// GET /api/stock-24h/alertas - Obtener alertas
router.get('/alertas', stock24hController.obtenerAlertas);

// POST /api/stock-24h/configurar - Configurar stock fijo
router.post('/configurar', stock24hController.configurarStockFijo);

// POST /api/stock-24h/agregar - Agregar nuevo medicamento a stock 24h
router.post('/agregar', stock24hController.agregarMedicamentoStock24h);

// GET /api/stock-24h/reposiciones - Listar reposiciones
router.get('/reposiciones', stock24hController.listarReposiciones);

// POST /api/stock-24h/reposiciones - Crear reposición
router.post('/reposiciones', stock24hController.crearReposicion);

module.exports = router;
