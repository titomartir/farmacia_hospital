const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');
const logger = require('../config/logger');
const Requisicion = require('../models/Requisicion');
const DetalleRequisicion = require('../models/DetalleRequisicion');
const Insumo = require('../models/Insumo');
const InsumoPresentacion = require('../models/InsumoPresentacion');
const Presentacion = require('../models/Presentacion');
const Servicio = require('../models/Servicio');

/**
 * Reporte: Resumen Total por Medicamento (Todos los Servicios)
 * Muestra requisiciones y recetas con totales de unidades y costos
 */
const resumenTotalMedicamentos = async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;

    if (!fecha_desde || !fecha_hasta) {
      return res.status(400).json({
        success: false,
        message: 'Las fechas desde y hasta son requeridas'
      });
    }

    // Query para sumar requisiciones y consolidados
    const query = `
      SELECT 
        id_insumo,
        medicamento,
        clasificacion,
        subclasificacion,
        presentacion,
        SUM(req_unidades) as req_unidades,
        SUM(req_costo) as req_costo,
        SUM(receta_unidades) as receta_unidades,
        SUM(receta_costo) as receta_costo,
        SUM(total_unidades) as total_unidades,
        SUM(total_costo) as total_costo,
        AVG(precio_promedio) as precio_promedio
      FROM (
        SELECT 
          i.id_insumo,
          i.nombre as medicamento,
          i.clasificacion,
          COALESCE(i.subclasificacion, 'requisicion') as subclasificacion,
          p.nombre as presentacion,
          SUM(CASE WHEN COALESCE(i.subclasificacion, 'requisicion') = 'requisicion' THEN dr.cantidad_autorizada ELSE 0 END) as req_unidades,
          SUM(CASE WHEN COALESCE(i.subclasificacion, 'requisicion') = 'requisicion' THEN (dr.cantidad_autorizada * COALESCE(NULLIF(dr.precio_unitario, 0), l.precio_lote, 0)) ELSE 0 END) as req_costo,
          SUM(CASE WHEN COALESCE(i.subclasificacion, 'requisicion') = 'receta' THEN dr.cantidad_autorizada ELSE 0 END) as receta_unidades,
          SUM(CASE WHEN COALESCE(i.subclasificacion, 'requisicion') = 'receta' THEN (dr.cantidad_autorizada * COALESCE(NULLIF(dr.precio_unitario, 0), l.precio_lote, 0)) ELSE 0 END) as receta_costo,
          SUM(dr.cantidad_autorizada) as total_unidades,
          SUM(dr.cantidad_autorizada * COALESCE(NULLIF(dr.precio_unitario, 0), l.precio_lote, 0)) as total_costo,
          AVG(COALESCE(NULLIF(dr.precio_unitario, 0), l.precio_lote, 0)) as precio_promedio
        FROM detalle_requisicion dr
        INNER JOIN requisicion r ON dr.id_requisicion = r.id_requisicion
        INNER JOIN insumo_presentacion ip ON dr.id_insumo_presentacion = ip.id_insumo_presentacion
        INNER JOIN insumo i ON ip.id_insumo = i.id_insumo
        INNER JOIN presentacion p ON ip.id_presentacion = p.id_presentacion
        LEFT JOIN lote_inventario l ON dr.id_lote = l.id_lote
        WHERE r.fecha_solicitud BETWEEN :fecha_desde AND :fecha_hasta
          AND r.estado IN ('aprobada', 'entregada')
        GROUP BY i.id_insumo, i.nombre, i.clasificacion, i.subclasificacion, p.nombre
        
        UNION ALL
        
        SELECT 
          i.id_insumo,
          i.nombre as medicamento,
          i.clasificacion,
          'receta' as subclasificacion,
          p.nombre as presentacion,
          0 as req_unidades,
          0 as req_costo,
          SUM(dc.cantidad) as receta_unidades,
          SUM(dc.cantidad * COALESCE(NULLIF(dc.precio_unitario, 0), 0)) as receta_costo,
          SUM(dc.cantidad) as total_unidades,
          SUM(dc.cantidad * COALESCE(NULLIF(dc.precio_unitario, 0), 0)) as total_costo,
          AVG(COALESCE(NULLIF(dc.precio_unitario, 0), 0)) as precio_promedio
        FROM detalle_consolidado dc
        INNER JOIN consolidado c ON dc.id_consolidado = c.id_consolidado
        INNER JOIN insumo_presentacion ip ON dc.id_insumo_presentacion = ip.id_insumo_presentacion
        INNER JOIN insumo i ON ip.id_insumo = i.id_insumo
        INNER JOIN presentacion p ON ip.id_presentacion = p.id_presentacion
        WHERE c.fecha_consolidado BETWEEN :fecha_desde AND :fecha_hasta
          AND c.estado IN ('aprobado', 'cerrado')
        GROUP BY i.id_insumo, i.nombre, i.clasificacion, i.subclasificacion, p.nombre
      ) as resumen
      GROUP BY id_insumo, medicamento, clasificacion, subclasificacion, presentacion
      ORDER BY medicamento ASC
    `;

    const resultados = await sequelize.query(query, {
      replacements: { fecha_desde, fecha_hasta },
      type: QueryTypes.SELECT
    });

    // Calcular totales generales
    const totales = {
      req_unidades: 0,
      req_costo: 0,
      receta_unidades: 0,
      receta_costo: 0,
      total_unidades: 0,
      total_costo: 0
    };

    resultados.forEach(item => {
      totales.req_unidades += parseFloat(item.req_unidades || 0);
      totales.req_costo += parseFloat(item.req_costo || 0);
      totales.receta_unidades += parseFloat(item.receta_unidades || 0);
      totales.receta_costo += parseFloat(item.receta_costo || 0);
      totales.total_unidades += parseFloat(item.total_unidades || 0);
      totales.total_costo += parseFloat(item.total_costo || 0);
    });

    res.json({
      success: true,
      data: {
        periodo: { fecha_desde, fecha_hasta },
        medicamentos: resultados,
        totales
      }
    });

  } catch (error) {
    logger.error('Error en resumenTotalMedicamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Reporte: Resumen Total por Medicamento (Por Servicio)
 * Similar al anterior pero filtrado por servicio específico
 */
const resumenPorServicio = async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta, id_servicio } = req.query;

    if (!fecha_desde || !fecha_hasta) {
      return res.status(400).json({
        success: false,
        message: 'Las fechas desde y hasta son requeridas'
      });
    }

    if (!id_servicio) {
      return res.status(400).json({
        success: false,
        message: 'El servicio es requerido'
      });
    }

    // Query similar pero con filtro de servicio y subclasificacion (NULL = requisicion por defecto)
    // Usa precio_unitario si existe, si no usa precio_lote del lote asignado
    const query = `
      SELECT 
        i.id_insumo,
        i.nombre as medicamento,
        i.clasificacion,
        COALESCE(i.subclasificacion, 'requisicion') as subclasificacion,
        p.nombre as presentacion,
        s.nombre_servicio as servicio,
        
        -- REQUISICIONES (cuando subclasificacion = 'requisicion' o es NULL)
        SUM(CASE WHEN COALESCE(i.subclasificacion, 'requisicion') = 'requisicion' THEN dr.cantidad_autorizada ELSE 0 END) as req_unidades,
        SUM(CASE WHEN COALESCE(i.subclasificacion, 'requisicion') = 'requisicion' THEN (dr.cantidad_autorizada * COALESCE(NULLIF(dr.precio_unitario, 0), l.precio_lote, 0)) ELSE 0 END) as req_costo,
        
        -- RECETAS (cuando subclasificacion = 'receta')
        SUM(CASE WHEN COALESCE(i.subclasificacion, 'requisicion') = 'receta' THEN dr.cantidad_autorizada ELSE 0 END) as receta_unidades,
        SUM(CASE WHEN COALESCE(i.subclasificacion, 'requisicion') = 'receta' THEN (dr.cantidad_autorizada * COALESCE(NULLIF(dr.precio_unitario, 0), l.precio_lote, 0)) ELSE 0 END) as receta_costo,
        
        -- TOTALES
        SUM(dr.cantidad_autorizada) as total_unidades,
        SUM(dr.cantidad_autorizada * COALESCE(NULLIF(dr.precio_unitario, 0), l.precio_lote, 0)) as total_costo,
        
        AVG(COALESCE(NULLIF(dr.precio_unitario, 0), l.precio_lote, 0)) as precio_promedio
        
      FROM detalle_requisicion dr
      INNER JOIN requisicion r ON dr.id_requisicion = r.id_requisicion
      INNER JOIN insumo_presentacion ip ON dr.id_insumo_presentacion = ip.id_insumo_presentacion
      INNER JOIN insumo i ON ip.id_insumo = i.id_insumo
      INNER JOIN presentacion p ON ip.id_presentacion = p.id_presentacion
      INNER JOIN servicio s ON r.id_servicio = s.id_servicio
      LEFT JOIN lote_inventario l ON dr.id_lote = l.id_lote
      
      WHERE r.fecha_solicitud BETWEEN :fecha_desde AND :fecha_hasta
        AND r.id_servicio = :id_servicio
        AND r.estado IN ('aprobada', 'entregada')
      
      GROUP BY i.id_insumo, i.nombre, i.clasificacion, i.subclasificacion, p.nombre, s.nombre_servicio
      ORDER BY i.nombre ASC
    `;

    const resultados = await sequelize.query(query, {
      replacements: { fecha_desde, fecha_hasta, id_servicio },
      type: QueryTypes.SELECT
    });

    // Calcular totales
    const totales = {
      req_unidades: 0,
      req_costo: 0,
      receta_unidades: 0,
      receta_costo: 0,
      total_unidades: 0,
      total_costo: 0
    };

    resultados.forEach(item => {
      totales.req_unidades += parseFloat(item.req_unidades || 0);
      totales.req_costo += parseFloat(item.req_costo || 0);
      totales.receta_unidades += parseFloat(item.receta_unidades || 0);
      totales.receta_costo += parseFloat(item.receta_costo || 0);
      totales.total_unidades += parseFloat(item.total_unidades || 0);
      totales.total_costo += parseFloat(item.total_costo || 0);
    });

    // Obtener info del servicio
    const servicio = await Servicio.findByPk(id_servicio);

    res.json({
      success: true,
      data: {
        periodo: { fecha_desde, fecha_hasta },
        servicio: servicio ? servicio.nombre_servicio : null,
        medicamentos: resultados,
        totales
      }
    });

  } catch (error) {
    logger.error('Error en resumenPorServicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Reporte: Consumo por Servicio (Todos los servicios comparados)
 */
const consumoPorServicio = async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;

    if (!fecha_desde || !fecha_hasta) {
      return res.status(400).json({
        success: false,
        message: 'Las fechas desde y hasta son requeridas'
      });
    }

    const query = `
      SELECT 
        s.id_servicio,
        s.nombre_servicio as servicio,
        i.id_insumo,
        i.nombre as medicamento,
        p.nombre as presentacion,
        SUM(CASE WHEN COALESCE(i.subclasificacion, 'requisicion') = 'requisicion' THEN dr.cantidad_autorizada ELSE 0 END) as req_unidades,
        SUM(CASE WHEN COALESCE(i.subclasificacion, 'requisicion') = 'requisicion' THEN (dr.cantidad_autorizada * COALESCE(NULLIF(dr.precio_unitario, 0), l.precio_lote, 0)) ELSE 0 END) as req_costo,
        SUM(CASE WHEN COALESCE(i.subclasificacion, 'requisicion') = 'receta' THEN dr.cantidad_autorizada ELSE 0 END) as receta_unidades,
        SUM(CASE WHEN COALESCE(i.subclasificacion, 'requisicion') = 'receta' THEN (dr.cantidad_autorizada * COALESCE(NULLIF(dr.precio_unitario, 0), l.precio_lote, 0)) ELSE 0 END) as receta_costo,
        SUM(dr.cantidad_autorizada) as total_unidades,
        SUM(dr.cantidad_autorizada * COALESCE(NULLIF(dr.precio_unitario, 0), l.precio_lote, 0)) as total_costo
        
      FROM requisicion r
      INNER JOIN servicio s ON r.id_servicio = s.id_servicio
      INNER JOIN detalle_requisicion dr ON r.id_requisicion = dr.id_requisicion
      INNER JOIN insumo_presentacion ip ON dr.id_insumo_presentacion = ip.id_insumo_presentacion
      INNER JOIN insumo i ON ip.id_insumo = i.id_insumo
      INNER JOIN presentacion p ON ip.id_presentacion = p.id_presentacion
      LEFT JOIN lote_inventario l ON dr.id_lote = l.id_lote
      
      WHERE r.fecha_solicitud BETWEEN :fecha_desde AND :fecha_hasta
        AND r.estado IN ('aprobada', 'entregada')
      
      GROUP BY s.id_servicio, s.nombre_servicio, i.id_insumo, i.nombre, i.subclasificacion, p.nombre
      ORDER BY s.nombre_servicio ASC, i.nombre ASC
    `;

    const resultados = await sequelize.query(query, {
      replacements: { fecha_desde, fecha_hasta },
      type: QueryTypes.SELECT
    });

    // Agrupar por servicio
    const servicios = {};
    resultados.forEach(item => {
      if (!servicios[item.servicio]) {
        servicios[item.servicio] = {
          servicio: item.servicio,
          medicamentos: [],
          totales: {
            req_unidades: 0,
            req_costo: 0,
            receta_unidades: 0,
            receta_costo: 0,
            total_unidades: 0,
            total_costo: 0
          }
        };
      }

      servicios[item.servicio].medicamentos.push({
        medicamento: item.medicamento,
        presentacion: item.presentacion,
        req_unidades: parseFloat(item.req_unidades || 0),
        req_costo: parseFloat(item.req_costo || 0),
        receta_unidades: parseFloat(item.receta_unidades || 0),
        receta_costo: parseFloat(item.receta_costo || 0),
        total_unidades: parseFloat(item.total_unidades || 0),
        total_costo: parseFloat(item.total_costo || 0)
      });

      // Sumar totales por servicio
      servicios[item.servicio].totales.req_unidades += parseFloat(item.req_unidades || 0);
      servicios[item.servicio].totales.req_costo += parseFloat(item.req_costo || 0);
      servicios[item.servicio].totales.receta_unidades += parseFloat(item.receta_unidades || 0);
      servicios[item.servicio].totales.receta_costo += parseFloat(item.receta_costo || 0);
      servicios[item.servicio].totales.total_unidades += parseFloat(item.total_unidades || 0);
      servicios[item.servicio].totales.total_costo += parseFloat(item.total_costo || 0);
    });

    res.json({
      success: true,
      data: {
        periodo: { fecha_desde, fecha_hasta },
        servicios: Object.values(servicios)
      }
    });

  } catch (error) {
    logger.error('Error en consumoPorServicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Reporte: Stock Actual y Alertas
 */
const stockActual = async (req, res) => {
  try {
    const query = `
      SELECT 
        i.id_insumo,
        i.nombre as medicamento,
        i.stock_minimo,
        p.nombre as presentacion,
        SUM(l.cantidad_actual) as stock_actual,
        i.stock_minimo - SUM(l.cantidad_actual) as deficit,
        CASE 
          WHEN SUM(l.cantidad_actual) <= i.stock_minimo THEN 'CRÍTICO'
          WHEN SUM(l.cantidad_actual) <= i.stock_minimo * 1.5 THEN 'BAJO'
          ELSE 'NORMAL'
        END as estado_stock
        
      FROM insumo i
      INNER JOIN insumo_presentacion ip ON i.id_insumo = ip.id_insumo
      INNER JOIN presentacion p ON ip.id_presentacion = p.id_presentacion
      LEFT JOIN lote_inventario l ON ip.id_insumo_presentacion = l.id_insumo_presentacion
        AND l.estado = 'disponible'
      
      WHERE i.estado = true
      
      GROUP BY i.id_insumo, i.nombre, i.stock_minimo, p.nombre
      HAVING SUM(l.cantidad_actual) <= i.stock_minimo * 2
      ORDER BY estado_stock DESC, deficit DESC
    `;

    const resultados = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: resultados
    });

  } catch (error) {
    logger.error('Error en stockActual:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  resumenTotalMedicamentos,
  resumenPorServicio,
  consumoPorServicio,
  stockActual
};
