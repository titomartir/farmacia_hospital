const { 
  Insumo,
  InsumoPresentacion,
  LoteInventario, 
  Stock24Horas,
  Requisicion,
  DetalleRequisicion,
  Servicio,
  sequelize 
} = require('../models');
const logger = require('../config/logger');
const { Op, QueryTypes } = require('sequelize');

// Obtener estadísticas generales del dashboard
const obtenerEstadisticas = async (req, res) => {
  try {
    // Total de insumos activos
    const totalInsumos = await Insumo.count({
      where: { estado: true }
    });

    // Total de presentaciones activas
    const totalPresentaciones = await InsumoPresentacion.count({
      where: { estado: true }
    });

    // Stock 24h items
    const totalStock24h = await Stock24Horas.count();

    // Lotes activos
    const lotesActivos = await LoteInventario.count({
      where: { estado: true }
    });

    res.json({
      success: true,
      data: {
        totalInsumos,
        totalPresentaciones,
        totalStock24h,
        lotesActivos,
        alertas: 0,
        lotesProximosVencer: 0
      }
    });
  } catch (error) {
    logger.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

// Obtener alertas recientes
const obtenerAlertas = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Stock 24h bajo
    const stockBajo = await Stock24Horas.findAll({
      include: [{
        model: InsumoPresentacion,
        as: 'insumoPresentacion',
        include: [{
          model: Insumo,
          as: 'insumo'
        }]
      }],
      limit: parseInt(limit)
    });

    const alertas = stockBajo.map(item => ({
      tipo: 'stock_bajo',
      mensaje: `Stock bajo en ${item.insumoPresentacion?.insumo?.nombre || 'Insumo'}`,
      nivel: 'warning',
      fecha: new Date()
    }));

    res.json({
      success: true,
      data: alertas
    });
  } catch (error) {
    logger.error('Error al obtener alertas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener alertas',
      error: error.message
    });
  }
};

// Obtener movimientos recientes
const obtenerMovimientosRecientes = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Por ahora retornar array vacío
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    logger.error('Error al obtener movimientos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener movimientos',
      error: error.message
    });
  }
};

/**
 * Gráfico 1: Consumo por Servicio (últimos 30 días)
 */
const consumoPorServicio = async (req, res) => {
  try {
    const fechaDesde = new Date();
    fechaDesde.setDate(fechaDesde.getDate() - 30);

    const query = `
      SELECT 
        s.nombre_servicio as servicio,
        COUNT(DISTINCT r.id_requisicion) as total_requisiciones,
        SUM(dr.cantidad_autorizada) as total_unidades,
        SUM(dr.cantidad_autorizada * dr.precio_unitario) as total_costo
      FROM requisicion r
      INNER JOIN servicio s ON r.id_servicio = s.id_servicio
      INNER JOIN detalle_requisicion dr ON r.id_requisicion = dr.id_requisicion
      WHERE r.fecha_solicitud >= :fecha_desde
        AND r.estado IN ('aprobada', 'entregada')
      GROUP BY s.id_servicio, s.nombre_servicio
      ORDER BY total_costo DESC
      LIMIT 10
    `;

    const resultados = await sequelize.query(query, {
      replacements: { fecha_desde: fechaDesde },
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: resultados
    });
  } catch (error) {
    logger.error('Error en consumoPorServicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener consumo por servicio'
    });
  }
};

/**
 * Gráfico 2: Stock por Estado (Crítico/Bajo/Normal)
 */
const stockPorEstado = async (req, res) => {
  try {
    const query = `
      WITH stock_totales AS (
        SELECT 
          i.id_insumo,
          i.stock_minimo,
          COALESCE(SUM(l.cantidad_actual), 0) as stock_total
        FROM insumo i
        INNER JOIN insumo_presentacion ip ON i.id_insumo = ip.id_insumo
        LEFT JOIN lote_inventario l ON ip.id_insumo_presentacion = l.id_insumo_presentacion
          AND l.estado = true
        WHERE i.estado = true
        GROUP BY i.id_insumo, i.stock_minimo
      )
      SELECT 
        CASE 
          WHEN stock_total = 0 THEN 'Agotado'
          WHEN stock_total <= stock_minimo THEN 'Crítico'
          WHEN stock_total <= stock_minimo * 1.5 THEN 'Bajo'
          ELSE 'Normal'
        END as estado,
        COUNT(*) as cantidad
      FROM stock_totales
      GROUP BY 
        CASE 
          WHEN stock_total = 0 THEN 'Agotado'
          WHEN stock_total <= stock_minimo THEN 'Crítico'
          WHEN stock_total <= stock_minimo * 1.5 THEN 'Bajo'
          ELSE 'Normal'
        END
      ORDER BY cantidad DESC
    `;

    const resultados = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: resultados
    });
  } catch (error) {
    logger.error('Error en stockPorEstado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado de stock'
    });
  }
};

/**
 * Gráfico 3: Tendencia de Requisiciones (últimos 30 días)
 */
const tendenciaRequisiciones = async (req, res) => {
  try {
    const query = `
      SELECT 
        DATE(r.fecha_solicitud) as fecha,
        COUNT(*) as cantidad,
        SUM(CASE WHEN r.estado = 'entregada' THEN 1 ELSE 0 END) as entregadas,
        SUM(CASE WHEN r.estado = 'aprobada' THEN 1 ELSE 0 END) as aprobadas,
        SUM(CASE WHEN r.estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes
      FROM requisicion r
      WHERE r.fecha_solicitud >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(r.fecha_solicitud)
      ORDER BY fecha ASC
    `;

    const resultados = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: resultados
    });
  } catch (error) {
    logger.error('Error en tendenciaRequisiciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tendencia de requisiciones'
    });
  }
};

/**
 * Gráfico 4: Medicamentos Próximos a Vencer (próximos 60 días)
 */
const proximosVencer = async (req, res) => {
  try {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + 60);

    const query = `
      SELECT 
        i.nombre as medicamento,
        p.nombre as presentacion,
        l.numero_lote,
        l.fecha_vencimiento,
        l.cantidad_actual,
        EXTRACT(DAY FROM (l.fecha_vencimiento::timestamp - CURRENT_DATE)) as dias_restantes
      FROM lote_inventario l
      INNER JOIN insumo_presentacion ip ON l.id_insumo_presentacion = ip.id_insumo_presentacion
      INNER JOIN insumo i ON ip.id_insumo = i.id_insumo
      INNER JOIN presentacion p ON ip.id_presentacion = p.id_presentacion
      WHERE l.fecha_vencimiento <= :fecha_limite
        AND l.fecha_vencimiento >= CURRENT_DATE
        AND l.cantidad_actual > 0
        AND l.estado = true
      ORDER BY l.fecha_vencimiento ASC
      LIMIT 10
    `;

    const resultados = await sequelize.query(query, {
      replacements: { fecha_limite: fechaLimite },
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: resultados
    });
  } catch (error) {
    logger.error('Error en proximosVencer:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener medicamentos próximos a vencer'
    });
  }
};

/**
 * Gráfico 5: Costos por Servicio (últimos 30 días)
 */
const costosPorServicio = async (req, res) => {
  try {
    const fechaDesde = new Date();
    fechaDesde.setDate(fechaDesde.getDate() - 30);

    const query = `
      SELECT 
        s.nombre_servicio as servicio,
        SUM(dr.cantidad_autorizada * dr.precio_unitario) as costo_total,
        COUNT(DISTINCT r.id_requisicion) as num_requisiciones
      FROM requisicion r
      INNER JOIN servicio s ON r.id_servicio = s.id_servicio
      INNER JOIN detalle_requisicion dr ON r.id_requisicion = dr.id_requisicion
      WHERE r.fecha_solicitud >= :fecha_desde
        AND r.estado IN ('aprobada', 'entregada')
      GROUP BY s.id_servicio, s.nombre_servicio
      ORDER BY costo_total DESC
    `;

    const resultados = await sequelize.query(query, {
      replacements: { fecha_desde: fechaDesde },
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: resultados
    });
  } catch (error) {
    logger.error('Error en costosPorServicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener costos por servicio'
    });
  }
};

module.exports = {
  obtenerEstadisticas,
  obtenerAlertas,
  obtenerMovimientosRecientes,
  consumoPorServicio,
  stockPorEstado,
  tendenciaRequisiciones,
  proximosVencer,
  costosPorServicio
};
