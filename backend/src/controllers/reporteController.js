const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');
const logger = require('../config/logger');
const Requisicion = require('../models/Requisicion');
const DetalleRequisicion = require('../models/DetalleRequisicion');
const Insumo = require('../models/Insumo');
const InsumoPresentacion = require('../models/InsumoPresentacion');
const Presentacion = require('../models/Presentacion');
const Servicio = require('../models/Servicio');
const { calcularSaldos, calcularTotales, formatearValor } = require('../utils/kardexCalculations');

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
      LEFT JOIN lote_inventario l ON dr.id_lote = l.id_lote
      
      WHERE r.fecha_solicitud BETWEEN :fecha_desde AND :fecha_hasta
        AND r.estado IN ('aprobada', 'entregada')
      
      GROUP BY s.id_servicio, s.nombre_servicio
      ORDER BY s.nombre_servicio ASC
    `;

    const servicios = await sequelize.query(query, {
      replacements: { fecha_desde, fecha_hasta },
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        periodo: { fecha_desde, fecha_hasta },
        servicios: servicios.map(s => ({
          servicio: s.servicio,
          req_unidades: parseFloat(s.req_unidades || 0),
          req_costo: parseFloat(s.req_costo || 0),
          receta_unidades: parseFloat(s.receta_unidades || 0),
          receta_costo: parseFloat(s.receta_costo || 0),
          total_unidades: parseFloat(s.total_unidades || 0),
          total_costo: parseFloat(s.total_costo || 0)
        }))
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

/**
 * Reporte: Kardex de Medicamento
 * Muestra el historial detallado de un medicamento con entradas, salidas y saldos
 */
const generarKardex = async (req, res) => {
  try {
    const { id_insumo } = req.params;
    const { fecha_inicio, fecha_fin } = req.query;

    if (!id_insumo) {
      return res.status(400).json({
        success: false,
        message: 'El ID del medicamento es requerido'
      });
    }

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        success: false,
        message: 'Las fechas desde y hasta son requeridas'
      });
    }

    logger.info(`Generando Kardex para insumo ${id_insumo}: ${fecha_inicio} a ${fecha_fin}`);

    // Obtener información del medicamento
    const insumo = await Insumo.findByPk(id_insumo, {
      include: [
        {
          model: InsumoPresentacion,
          as: 'presentaciones',
          include: [
            { model: Presentacion, as: 'presentacion' },
            { model: sequelize.models.unidad_medida, as: 'unidad_medida' }
          ]
        }
      ]
    });

    if (!insumo) {
      return res.status(404).json({
        success: false,
        message: 'Medicamento no encontrado'
      });
    }

    // Consultar INGRESOS
    const queryIngresos = `
      SELECT 
        di.id_detalle_ingreso,
        i.fecha_ingreso as fecha,
        'I-' || i.id_ingreso::text as correlativo,
        'Ingreso' as descripcion,
        di.cantidad as entrada_cantidad,
        COALESCE(di.precio_unitario, 0) as entrada_costo,
        (di.cantidad * COALESCE(di.precio_unitario, 0)) as entrada_valor,
        0 as salida_cantidad,
        0 as salida_costo,
        0 as salida_valor,
        p.nombre as presentacion_nombre,
        um.nombre as unidad_medida
      FROM detalle_ingreso di
      JOIN ingreso i ON di.id_ingreso = i.id_ingreso
      JOIN insumo_presentacion ip ON di.id_insumo_presentacion = ip.id_insumo_presentacion
      JOIN presentacion p ON ip.id_presentacion = p.id_presentacion
      JOIN unidad_medida um ON ip.id_unidad_medida = um.id_unidad_medida
      WHERE ip.id_insumo = $1
        AND i.fecha_ingreso BETWEEN $2::date AND $3::date
      ORDER BY i.fecha_ingreso ASC, i.id_ingreso ASC
    `;

    const ingresos = await sequelize.query(queryIngresos, {
      replacements: [id_insumo, fecha_inicio, fecha_fin],
      type: QueryTypes.SELECT
    });

    // Consultar CONSOLIDADOS (SALIDAS)
    const queryConsolidados = `
      SELECT 
        dc.id_detalle_consolidado,
        c.fecha_consolidado as fecha,
        'C-' || c.id_consolidado::text as correlativo,
        'Consolidado' as descripcion,
        0 as entrada_cantidad,
        0 as entrada_costo,
        0 as entrada_valor,
        dc.cantidad as salida_cantidad,
        COALESCE(dc.precio_unitario, 0) as salida_costo,
        (dc.cantidad * COALESCE(dc.precio_unitario, 0)) as salida_valor,
        p.nombre as presentacion_nombre,
        um.nombre as unidad_medida
      FROM detalle_consolidado dc
      JOIN consolidado c ON dc.id_consolidado = c.id_consolidado
      JOIN insumo_presentacion ip ON dc.id_insumo_presentacion = ip.id_insumo_presentacion
      JOIN presentacion p ON ip.id_presentacion = p.id_presentacion
      JOIN unidad_medida um ON ip.id_unidad_medida = um.id_unidad_medida
      WHERE ip.id_insumo = $1
        AND c.fecha_consolidado BETWEEN $2::date AND $3::date
      ORDER BY c.fecha_consolidado ASC, c.id_consolidado ASC
    `;

    const consolidados = await sequelize.query(queryConsolidados, {
      replacements: [id_insumo, fecha_inicio, fecha_fin],
      type: QueryTypes.SELECT
    });

    // Combinar y ordenar movimientos por fecha
    let movimientos = [...ingresos, ...consolidados];
    movimientos.sort((a, b) => {
      const dateA = new Date(a.fecha);
      const dateB = new Date(b.fecha);
      return dateA - dateB;
    });

    // Calcular saldos
    movimientos = calcularSaldos(movimientos);

    // Obtener info del medicamento
    const nombreMedicamento = insumo.nombre || 'Medicamento desconocido';
    const presentacion = insumo.presentaciones?.[0];
    const presentacionNombre = presentacion?.presentacion?.nombre || 'Desconocida';
    const unidadMedida = presentacion?.unidad_medida?.nombre || 'ud';

    // Calcular totales
    const totales = calcularTotales(movimientos);

    // Formatear valores
    const movimientosFormateados = movimientos.map(mov => ({
      fecha: mov.fecha ? mov.fecha.toISOString().split('T')[0] : '',
      correlativo: mov.correlativo,
      descripcion: mov.descripcion,
      unidad_medida: unidadMedida,
      entrada_cantidad: formatearValor(mov.entrada_cantidad, 0),
      entrada_costo: formatearValor(mov.entrada_costo, 2),
      entrada_valor: formatearValor(mov.entrada_valor, 2),
      salida_cantidad: formatearValor(mov.salida_cantidad, 0),
      salida_costo: formatearValor(mov.salida_costo, 2),
      salida_valor: formatearValor(mov.salida_valor, 2),
      saldo_cantidad: formatearValor(mov.saldo_cantidad, 0),
      saldo_costo: formatearValor(mov.saldo_costo, 2),
      saldo_valor: formatearValor(mov.saldo_valor, 2)
    }));

    logger.info(`Kardex generado: ${movimientosFormateados.length} movimientos`);

    res.json({
      success: true,
      data: {
        medicamento: nombreMedicamento,
        presentacion: presentacionNombre,
        unidad_medida: unidadMedida,
        periodo: {
          fecha_inicio,
          fecha_fin
        },
        movimientos: movimientosFormateados,
        totales: {
          entrada_cantidad: formatearValor(totales.entrada_cantidad, 0),
          entrada_valor: formatearValor(totales.entrada_valor, 2),
          salida_cantidad: formatearValor(totales.salida_cantidad, 0),
          salida_valor: formatearValor(totales.salida_valor, 2),
          saldo_cantidad: formatearValor(totales.saldo_cantidad, 0),
          saldo_valor: formatearValor(totales.saldo_valor, 2)
        }
      }
    });
  } catch (error) {
    logger.error('Error al generar Kardex:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar Kardex',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  resumenTotalMedicamentos,
  resumenPorServicio,
  consumoPorServicio,
  stockActual,
  generarKardex
};
