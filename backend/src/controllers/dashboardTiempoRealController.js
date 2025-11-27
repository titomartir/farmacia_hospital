const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');
const logger = require('../config/logger');

/**
 * Obtener estadísticas de Requisiciones y Recetas del día actual
 * El día inicia a las 10:00 AM y termina a las 9:59 AM del día siguiente
 * Retorna:
 * - req_unidades: Total de unidades de requisiciones
 * - req_costo: Costo total de requisiciones
 * - receta_unidades: Total de unidades de recetas
 * - receta_costo: Costo total de recetas
 */
const obtenerEstadisticasTiempoReal = async (req, res) => {
  try {
    const ahora = new Date();
    const horaActual = ahora.getHours();
    let fechaInicio, fechaFin;
    if (horaActual < 10) {
      fechaInicio = new Date(ahora);
      fechaInicio.setDate(fechaInicio.getDate() - 1);
      fechaInicio.setHours(10, 0, 0, 0);
      fechaFin = new Date(ahora);
      fechaFin.setHours(9, 59, 59, 999);
    } else {
      fechaInicio = new Date(ahora);
      fechaInicio.setHours(10, 0, 0, 0);
      fechaFin = new Date(ahora);
      fechaFin.setDate(fechaFin.getDate() + 1);
      fechaFin.setHours(9, 59, 59, 999);
    }
    logger.info(`Estadísticas tiempo real - Rango: ${fechaInicio.toISOString()} a ${fechaFin.toISOString()}`);
    const query = `
      SELECT 
        i.subclasificacion,
        SUM(dr.cantidad_autorizada) as total_unidades,
        SUM(dr.cantidad_autorizada * dr.precio_unitario) as total_costo
      FROM detalle_requisicion dr
      INNER JOIN requisicion r ON dr.id_requisicion = r.id_requisicion
      INNER JOIN insumo_presentacion ip ON dr.id_insumo_presentacion = ip.id_insumo_presentacion
      INNER JOIN insumo i ON ip.id_insumo = i.id_insumo
      WHERE r.fecha_creacion >= :fecha_inicio
        AND r.fecha_creacion <= :fecha_fin
        AND r.estado IN ('aprobada', 'entregada')
        AND i.subclasificacion IS NOT NULL
      GROUP BY i.subclasificacion
    `;
    const resultados = await sequelize.query(query, {
      replacements: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
      type: QueryTypes.SELECT
    });
    const estadisticas = {
      req_unidades: 0,
      req_costo: 0,
      receta_unidades: 0,
      receta_costo: 0,
      periodo: {
        inicio: fechaInicio,
        fin: fechaFin,
        tipo: horaActual < 10 ? 'dia_anterior' : 'dia_actual'
      }
    };
    resultados.forEach(row => {
      if (row.subclasificacion === 'requisicion') {
        estadisticas.req_unidades = parseFloat(row.total_unidades) || 0;
        estadisticas.req_costo = parseFloat(row.total_costo) || 0;
      } else if (row.subclasificacion === 'receta') {
        estadisticas.receta_unidades = parseFloat(row.total_unidades) || 0;
        estadisticas.receta_costo = parseFloat(row.total_costo) || 0;
      }
    });
    res.json({ success: true, data: estadisticas });
  } catch (error) {
    logger.error('Error al obtener estadísticas tiempo real:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas en tiempo real', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

const obtenerMovimientosDia = async (req, res) => {
  try {
    const ahora = new Date();
    const horaActual = ahora.getHours();
    let fechaInicio;
    if (horaActual < 10) {
      fechaInicio = new Date(ahora);
      fechaInicio.setDate(fechaInicio.getDate() - 1);
      fechaInicio.setHours(10, 0, 0, 0);
    } else {
      fechaInicio = new Date(ahora);
      fechaInicio.setHours(10, 0, 0, 0);
    }
    const query = `
      SELECT 
        r.id_requisicion,
        r.fecha_creacion,
        s.nombre_servicio,
        i.nombre as medicamento,
        i.subclasificacion,
        dr.cantidad_autorizada as cantidad,
        dr.precio_unitario,
        (dr.cantidad_autorizada * dr.precio_unitario) as subtotal
      FROM requisicion r
      INNER JOIN servicio s ON r.id_servicio = s.id_servicio
      INNER JOIN detalle_requisicion dr ON r.id_requisicion = dr.id_requisicion
      INNER JOIN insumo_presentacion ip ON dr.id_insumo_presentacion = ip.id_insumo_presentacion
      INNER JOIN insumo i ON ip.id_insumo = i.id_insumo
      WHERE r.fecha_creacion >= :fecha_inicio
        AND r.estado IN ('aprobada', 'entregada')
        AND i.subclasificacion IS NOT NULL
      ORDER BY r.fecha_creacion DESC
      LIMIT 20
    `;
    const movimientos = await sequelize.query(query, {
      replacements: { fecha_inicio: fechaInicio },
      type: QueryTypes.SELECT
    });
    res.json({ success: true, data: { movimientos, periodo_inicio: fechaInicio, total_movimientos: movimientos.length } });
  } catch (error) {
    logger.error('Error al obtener movimientos del día:', error);
    res.status(500).json({ success: false, message: 'Error al obtener movimientos', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

module.exports = {
  obtenerEstadisticasTiempoReal,
  obtenerMovimientosDia
};
