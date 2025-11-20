const { 
  Ingreso,
  DetalleIngreso,
  Insumo,
  InsumoPresentacion,
  Presentacion,
  UnidadMedida,
  LoteInventario,
  Proveedor,
  Usuario,
  Personal,
  sequelize 
} = require('../models');
const logger = require('../config/logger');
const { Op } = require('sequelize');

// Listar todos los ingresos con paginación
const listarIngresos = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      tipo_ingreso,
      id_proveedor,
      id_usuario,
      fecha_desde,
      fecha_hasta
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (tipo_ingreso) {
      where.tipo_ingreso = tipo_ingreso;
    }

    if (id_proveedor) {
      where.id_proveedor = id_proveedor;
    }

    if (id_usuario) {
      where.id_usuario = id_usuario;
    }

    if (fecha_desde || fecha_hasta) {
      where.fecha_ingreso = {};
      if (fecha_desde) {
        where.fecha_ingreso[Op.gte] = new Date(fecha_desde);
      }
      if (fecha_hasta) {
        where.fecha_ingreso[Op.lte] = new Date(fecha_hasta);
      }
    }

    const { count, rows } = await Ingreso.findAndCountAll({
      where,
      include: [
        {
          model: Proveedor,
          as: 'proveedor',
          attributes: ['id_proveedor', 'nombre', 'nit', 'telefono']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id_usuario', 'nombre_usuario'],
          include: [{
            model: Personal,
            as: 'personal',
            attributes: ['nombres', 'apellidos']
          }]
        },
        {
          model: DetalleIngreso,
          as: 'detalles',
          include: [{
            model: InsumoPresentacion,
            as: 'insumoPresentacion',
            include: [
              {
                model: Insumo,
                as: 'insumo',
                attributes: ['id_insumo', 'nombre']
              },
              {
                model: Presentacion,
                as: 'presentacion',
                attributes: ['nombre']
              }
            ]
          }]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fecha_ingreso', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      totalRegistros: count,
      paginaActual: parseInt(page),
      totalPaginas: Math.ceil(count / limit)
    });
  } catch (error) {
    logger.error('Error al listar ingresos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los ingresos',
      error: error.message
    });
  }
};

// Obtener ingreso por ID
const obtenerIngresoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const ingreso = await Ingreso.findByPk(id, {
      include: [
        {
          model: Proveedor,
          as: 'proveedor'
        },
        {
          model: Usuario,
          as: 'usuario',
          include: [{
            model: Personal,
            as: 'personal'
          }]
        },
        {
          model: DetalleIngreso,
          as: 'detalles',
          include: [
            {
              model: InsumoPresentacion,
              as: 'insumoPresentacion',
              include: [
                {
                  model: Insumo,
                  as: 'insumo'
                },
                {
                  model: Presentacion,
                  as: 'presentacion'
                }
              ]
            }
          ]
        }
      ]
    });

    if (!ingreso) {
      return res.status(404).json({
        success: false,
        message: 'Ingreso no encontrado'
      });
    }

    res.json({
      success: true,
      data: ingreso
    });
  } catch (error) {
    logger.error('Error al obtener ingreso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el ingreso',
      error: error.message
    });
  }
};

// Crear nuevo ingreso (compra o devolución)
const crearIngreso = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const {
      tipo_ingreso, // 'COMPRA', 'DONACION', 'TRANSFERENCIA' o 'DEVOLUCION'
      id_proveedor,
      numero_factura,
      fecha_ingreso,
      detalles, // Array de medicamentos
      observaciones
    } = req.body;

    const id_usuario = req.usuario.id_usuario;

    // Validaciones
    if (!detalles || detalles.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar al menos un medicamento'
      });
    }

    if (tipo_ingreso === 'COMPRA' && !id_proveedor) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar un proveedor para compras'
      });
    }

    // Crear el ingreso (totales se calcularán luego)
    const nuevoIngreso = await Ingreso.create({
      tipo_ingreso,
      id_proveedor,
      numero_factura,
      fecha_ingreso: fecha_ingreso || new Date(),
      id_usuario,
      observaciones,
      subtotal: 0,
      igv: 0,
      total: 0
    }, { transaction: t });

    // Procesar cada detalle
    let subtotalAcumulado = 0;

    for (const detalle of detalles) {
      const {
        id_insumo_presentacion,
        cantidad,
        precio_unitario,
        lote,
        fecha_vencimiento
      } = detalle;

      const insumoPres = await InsumoPresentacion.findByPk(id_insumo_presentacion, { transaction: t });
      
      if (!insumoPres) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Presentación de insumo no encontrada (ID: ${id_insumo_presentacion})`
        });
      }

      // Crear el detalle del ingreso (el trigger creará/actualizará el lote)
      await DetalleIngreso.create({
        id_ingreso: nuevoIngreso.id_ingreso,
        id_insumo_presentacion,
        cantidad,
        precio_unitario,
        lote,
        fecha_vencimiento
      }, { transaction: t });

      subtotalAcumulado += parseFloat(cantidad) * parseFloat(precio_unitario);
    }

    // Actualizar totales del ingreso (IGV=0 por ahora)
    await nuevoIngreso.update({
      subtotal: subtotalAcumulado,
      igv: 0,
      total: subtotalAcumulado
    }, { transaction: t });

    await t.commit();

  logger.info(`Ingreso creado: ${tipo_ingreso} #${nuevoIngreso.id_ingreso} por usuario ${req.usuario.nombre_usuario}`);

    // Obtener el ingreso completo
    const ingresoCompleto = await Ingreso.findByPk(nuevoIngreso.id_ingreso, {
      include: [
        {
          model: Proveedor,
          as: 'proveedor'
        },
        {
          model: DetalleIngreso,
          as: 'detalles',
          include: [{
            model: InsumoPresentacion,
            as: 'insumoPresentacion',
            include: [
              { model: Insumo, as: 'insumo' },
              { model: Presentacion, as: 'presentacion' }
            ]
          }]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: `${tipo_ingreso === 'COMPRA' ? 'Compra' : 'Devolución'} registrada exitosamente`,
      data: ingresoCompleto
    });

  } catch (error) {
    await t.rollback();
    logger.error('Error al crear ingreso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar el ingreso',
      error: error.message
    });
  }
};

// Anular ingreso
const anularIngreso = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { motivo_anulacion } = req.body;

    const ingreso = await Ingreso.findByPk(id, { transaction: t });

    if (!ingreso) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Ingreso no encontrado'
      });
    }

    // Marcar observación de anulación
    await ingreso.update({
      observaciones: `${ingreso.observaciones || ''}\nANULADO: ${motivo_anulacion || 'Sin motivo especificado'}`
    }, { transaction: t });

    // Desactivar los lotes asociados (buscar por combinación insumo_presentacion + lote)
    const detalles = await DetalleIngreso.findAll({
      where: { id_ingreso: id },
      transaction: t
    });

    for (const detalle of detalles) {
      await LoteInventario.update(
        { estado: false },
        { 
          where: { 
            id_insumo_presentacion: detalle.id_insumo_presentacion,
            numero_lote: detalle.lote
          },
          transaction: t 
        }
      );
    }

    await t.commit();

    logger.info(`Ingreso anulado: ${id} por usuario ${req.usuario.nombre_usuario}. Motivo: ${motivo_anulacion}`);

    res.json({
      success: true,
      message: 'Ingreso anulado exitosamente',
      data: ingreso
    });

  } catch (error) {
    await t.rollback();
    logger.error('Error al anular ingreso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al anular el ingreso',
      error: error.message
    });
  }
};

// Obtener estadísticas de ingresos
const obtenerEstadisticas = async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;
    
    const where = {};
    if (fecha_desde || fecha_hasta) {
      where.fecha_ingreso = {};
      if (fecha_desde) {
        where.fecha_ingreso[Op.gte] = new Date(fecha_desde);
      }
      if (fecha_hasta) {
        where.fecha_ingreso[Op.lte] = new Date(fecha_hasta);
      }
    }

    // Total de ingresos
    const totalIngresos = await Ingreso.count({
      where: { ...where, tipo_ingreso: 'COMPRA' }
    });

    // Total de devoluciones
    const totalDevoluciones = await Ingreso.count({
      where: { ...where, tipo_ingreso: 'DEVOLUCION' }
    });

    // Costo total de compras
    const costosCompras = await Ingreso.findAll({
      where: { ...where, tipo_ingreso: 'COMPRA' },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total')), 'total']
      ]
    });

    const costoTotal = costosCompras[0]?.dataValues.total || 0;

    res.json({
      success: true,
      data: {
        totalIngresos,
        totalDevoluciones,
        costoTotal: parseFloat(costoTotal)
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

// Obtener lotes disponibles
const obtenerLotes = async (req, res) => {
  try {
    const { id_insumo_presentacion } = req.query;
    
    const where = {};
    if (id_insumo_presentacion) {
      where.id_insumo_presentacion = id_insumo_presentacion;
    }

    const lotes = await LoteInventario.findAll({
      where,
      include: [
        {
          model: InsumoPresentacion,
          as: 'insumoPresentacion',
          include: [
            { model: Insumo, as: 'insumo' },
            { model: Presentacion, as: 'presentacion' }
          ]
        }
      ],
      order: [['fecha_vencimiento', 'ASC']]
    });

    res.json({
      success: true,
      data: lotes
    });

  } catch (error) {
    logger.error('Error al obtener lotes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener lotes',
      error: error.message
    });
  }
};

module.exports = {
  listarIngresos,
  obtenerIngresoPorId,
  crearIngreso,
  anularIngreso,
  obtenerEstadisticas,
  obtenerLotes
};
