const express = require('express');
const router = express.Router();

// Importar todas las rutas
const authRoutes = require('./auth.routes');
const insumoRoutes = require('./insumo.routes');
const dashboardRoutes = require('./dashboard.routes');
const dashboardTiempoRealRoutes = require('./dashboardTiempoReal.routes');
const consolidadoRoutes = require('./consolidado.routes');
const requisicionRoutes = require('./requisicion.routes');
const stock24hRoutes = require('./stock24h.routes');
const ingresoRoutes = require('./ingreso.routes');
const catalogosRoutes = require('./catalogos.routes');
const cuadreRoutes = require('./cuadre.routes');
const reporteRoutes = require('./reporte.routes');

// Configurar rutas
router.use('/auth', authRoutes);
router.use('/insumos', insumoRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/dashboard', dashboardTiempoRealRoutes);
router.use('/consolidados', consolidadoRoutes);
router.use('/requisiciones', requisicionRoutes);
router.use('/stock-24h', stock24hRoutes);
router.use('/ingresos', ingresoRoutes);
router.use('/catalogos', catalogosRoutes);
router.use('/cuadres', cuadreRoutes);
router.use('/reportes', reporteRoutes);

// Ruta de prueba
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date()
  });
});

module.exports = router;
