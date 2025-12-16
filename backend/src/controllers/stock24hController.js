const { 
  Stock24Horas,
  ReposicionStock24h,
  DetalleReposicionStock,
  InsumoPresentacion,
  Insumo,
  Presentacion,
  LoteInventario,
  Usuario,
  Personal,
  sequelize 
} = require('../models');
const logger = require('../config/logger');
const { ALERTAS_STOCK } = require('../config/constants');

// Listar stock 24 horas con alertas
const listarStock24h = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50,
      alerta // 'bajo', 'critico', o null para todos
    } = req.query;

    const offset = (page - 1) * limit;

    const stock = await Stock24Horas.findAndCountAll({
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
      order: [['stock_actual', 'ASC']],
      limit: parseInt(limit),
      offset
    });

    // Calcular alertas
    let stockConAlertas = stock.rows.map(item => {
      const porcentaje = item.cantidad_fija > 0 
        ? (item.stock_actual / item.cantidad_fija) 
        : 1;
      
      let nivel_alerta = null;
      if (porcentaje <= ALERTAS_STOCK.STOCK_CRITICO) {
        nivel_alerta = 'critico';
      } else if (porcentaje <= ALERTAS_STOCK.STOCK_BAJO) {
        nivel_alerta = 'bajo';
      }

      return {
        ...item.toJSON(),
        porcentaje_stock: Math.round(porcentaje * 100),
        nivel_alerta
      };
    });

    // Filtrar por alerta si se especifica
    if (alerta) {
      stockConAlertas = stockConAlertas.filter(item => item.nivel_alerta === alerta);
    }

    res.json({
      success: true,
      data: stockConAlertas,
      pagination: {
        total: alerta ? stockConAlertas.length : stock.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil((alerta ? stockConAlertas.length : stock.count) / limit)
      }
    });
  } catch (error) {
    logger.error('Error al listar stock 24h:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener stock 24h',
      error: error.message
    });
  }
};

// Configurar stock fijo para un insumo
const configurarStockFijo = async (req, res) => {
  try {
    const { id_insumo_presentacion, stock_fijo, cantidad_fija } = req.body;
    
    // Aceptar tanto stock_fijo (legacy) como cantidad_fija (correcto)
    const cantidadFinal = cantidad_fija || stock_fijo;

    if (!id_insumo_presentacion || cantidadFinal === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar id_insumo_presentacion y cantidad_fija (o stock_fijo)'
      });
    }

    // Verificar si existe
    let stock = await Stock24Horas.findOne({
      where: { id_insumo_presentacion }
    });

    if (stock) {
      // Actualizar
      await stock.update({ cantidad_fija: cantidadFinal });
      logger.info(`Stock fijo actualizado para insumo ${id_insumo_presentacion}: ${cantidadFinal}`);
    } else {
      // Crear
      stock = await Stock24Horas.create({
        id_insumo_presentacion,
        cantidad_fija: cantidadFinal,
        stock_actual: 0
      });
      logger.info(`Stock 24h creado para insumo ${id_insumo_presentacion}: ${cantidadFinal}`);
    }

    const stockCompleto = await Stock24Horas.findByPk(stock.id_stock_24h, {
      include: [
        {
          model: InsumoPresentacion,
          as: 'insumoPresentacion',
          include: [
            { model: Insumo, as: 'insumo' },
            { model: Presentacion, as: 'presentacion' }
          ]
        }
      ]
    });

    res.json({
      success: true,
      message: 'Stock fijo configurado correctamente',
      data: stockCompleto
    });
  } catch (error) {
    logger.error('Error al configurar stock fijo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al configurar stock fijo',
      error: error.message
    });
  }
};

// Agregar nuevo medicamento a stock 24h
const agregarMedicamentoStock24h = async (req, res) => {
  try {
    const { id_insumo_presentacion, cantidad_fija, stock_actual } = req.body;

    if (!id_insumo_presentacion || !cantidad_fija) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar id_insumo_presentacion y cantidad_fija'
      });
    }

    // Verificar que el insumo no esté ya en stock 24h
    const existe = await Stock24Horas.findOne({
      where: { id_insumo_presentacion }
    });

    if (existe) {
      return res.status(400).json({
        success: false,
        message: 'Este medicamento ya está configurado en stock 24h'
      });
    }

    // Verificar que el insumo_presentacion existe
    const insumoPresentacion = await InsumoPresentacion.findByPk(id_insumo_presentacion);
    if (!insumoPresentacion) {
      return res.status(404).json({
        success: false,
        message: 'Insumo presentación no encontrado'
      });
    }

    // Crear registro en stock 24h
    const nuevoStock = await Stock24Horas.create({
      id_insumo_presentacion,
      cantidad_fija: parseFloat(cantidad_fija),
      stock_actual: parseFloat(stock_actual) || 0,
      estado: true
    });

    logger.info(`Nuevo medicamento agregado a stock 24h: ${id_insumo_presentacion} por usuario ${req.usuario?.id_usuario}`);

    // Obtener datos completos
    const stockCompleto = await Stock24Horas.findByPk(nuevoStock.id_stock_24h, {
      include: [
        {
          model: InsumoPresentacion,
          as: 'insumoPresentacion',
          include: [
            { model: Insumo, as: 'insumo' },
            { model: Presentacion, as: 'presentacion' }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Medicamento agregado exitosamente al stock 24h',
      data: stockCompleto
    });
  } catch (error) {
    logger.error('Error al agregar medicamento a stock 24h:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar medicamento',
      error: error.message
    });
  }
};

// Obtener alertas de stock bajo/crítico
const obtenerAlertas = async (req, res) => {
  try {
    const stock = await Stock24Horas.findAll({
      include: [
        {
          model: InsumoPresentacion,
          as: 'insumoPresentacion',
          include: [
            { model: Insumo, as: 'insumo' },
            { model: Presentacion, as: 'presentacion' }
          ]
        }
      ]
    });

    const alertas = {
      critico: [],
      bajo: []
    };

    stock.forEach(item => {
      const porcentaje = item.cantidad_fija > 0 
        ? (item.stock_actual / item.cantidad_fija) 
        : 1;
      
      const data = {
        ...item.toJSON(),
        porcentaje_stock: Math.round(porcentaje * 100),
        faltante: Math.max(0, item.cantidad_fija - item.stock_actual)
      };

      if (porcentaje <= ALERTAS_STOCK.STOCK_CRITICO) {
        alertas.critico.push(data);
      } else if (porcentaje <= ALERTAS_STOCK.STOCK_BAJO) {
        alertas.bajo.push(data);
      }
    });

    res.json({
      success: true,
      data: alertas,
      totales: {
        critico: alertas.critico.length,
        bajo: alertas.bajo.length
      }
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

// Crear reposición de stock 24h
const crearReposicion = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { 
      fecha_reposicion,
      id_usuario_recibe,
      detalles,
      observaciones
    } = req.body;

    const id_usuario_entrega = req.usuario.id_usuario;

    if (!detalles || detalles.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar al menos un detalle'
      });
    }

    // Crear reposición
    const ahora = new Date();
    const horaActual = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}:${ahora.getSeconds().toString().padStart(2, '0')}`;
    
    const nuevaReposicion = await ReposicionStock24h.create({
      id_usuario_entrega,
      id_usuario_recibe,
      fecha_reposicion,
      hora_reposicion: horaActual,
      observaciones,
      estado: 'completado'
    }, { transaction: t });

    // Crear detalles y actualizar stock
    for (const detalle of detalles) {
      await DetalleReposicionStock.create({
        id_reposicion: nuevaReposicion.id_reposicion,
        id_insumo_presentacion: detalle.id_insumo_presentacion,
        id_lote: detalle.id_lote || null,
        cantidad_debe_haber: detalle.cantidad_debe_haber,
        cantidad_actual: detalle.cantidad_actual,
        cantidad_reponer: detalle.cantidad_reponer,
        observaciones: detalle.observaciones
      }, { transaction: t });

      // Actualizar stock_actual y ultima_reposicion en stock_24_horas
      await Stock24Horas.increment(
        { stock_actual: detalle.cantidad_reponer },
        { 
          where: { id_insumo_presentacion: detalle.id_insumo_presentacion },
          transaction: t 
        }
      );

      // Actualizar fecha de última reposición
      await Stock24Horas.update(
        { ultima_reposicion: fecha_reposicion },
        {
          where: { id_insumo_presentacion: detalle.id_insumo_presentacion },
          transaction: t
        }
      );
    }

    await t.commit();

    logger.info(`Reposición creada: ${nuevaReposicion.id_reposicion} por usuario ${id_usuario_entrega}`);

    // Obtener reposición completa
    const reposicionCompleta = await ReposicionStock24h.findByPk(nuevaReposicion.id_reposicion, {
      include: [
        {
          model: Usuario,
          as: 'usuarioEntrega',
          include: [{ model: Personal, as: 'personal' }]
        },
        {
          model: Usuario,
          as: 'usuarioRecibe',
          include: [{ model: Personal, as: 'personal' }]
        },
        {
          model: DetalleReposicionStock,
          as: 'detalles',
          include: [
            {
              model: InsumoPresentacion,
              as: 'insumoPresentacion',
              include: [
                { model: Insumo, as: 'insumo' },
                { model: Presentacion, as: 'presentacion' }
              ]
            }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Reposición creada correctamente',
      data: reposicionCompleta
    });
  } catch (error) {
    await t.rollback();
    logger.error('Error al crear reposición:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear reposición',
      error: error.message
    });
  }
};

// Listar reposiciones
const listarReposiciones = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      fecha_desde,
      fecha_hasta
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (fecha_desde && fecha_hasta) {
      where.fecha_reposicion = {
        [sequelize.Sequelize.Op.between]: [fecha_desde, fecha_hasta]
      };
    }

    const { count, rows } = await ReposicionStock24h.findAndCountAll({
      where,
      include: [
        {
          model: Usuario,
          as: 'usuarioEntrega',
          include: [{ model: Personal, as: 'personal' }]
        },
        {
          model: Usuario,
          as: 'usuarioRecibe',
          include: [{ model: Personal, as: 'personal' }]
        }
      ],
      order: [['fecha_reposicion', 'DESC'], ['hora_reposicion', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Error al listar reposiciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reposiciones',
      error: error.message
    });
  }
};

// Obtener estadísticas del stock 24h
const obtenerEstadisticas = async (req, res) => {
  try {
    // Total de insumos en stock 24h
    const totalInsumos = await Stock24Horas.count();

    // Stock con alertas
    const stockList = await Stock24Horas.findAll({
      attributes: ['stock_actual', 'cantidad_fija']
    });

    let stockBajo = 0;
    let stockCritico = 0;
    let stockNormal = 0;

    stockList.forEach(item => {
      const porcentaje = item.cantidad_fija > 0 
        ? (item.stock_actual / item.cantidad_fija) 
        : 1;
      
      if (porcentaje <= ALERTAS_STOCK.STOCK_CRITICO) {
        stockCritico++;
      } else if (porcentaje <= ALERTAS_STOCK.STOCK_BAJO) {
        stockBajo++;
      } else {
        stockNormal++;
      }
    });

    // Reposiciones del mes actual
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const reposicionesMes = await ReposicionStock24h.count({
      where: {
        fecha_reposicion: {
          [sequelize.Sequelize.Op.gte]: inicioMes
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalInsumos,
        stockBajo,
        stockCritico,
        stockNormal,
        alertasActivas: stockBajo + stockCritico,
        reposicionesMes
      }
    });
  } catch (error) {
    logger.error('Error al obtener estadísticas stock 24h:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

// Obtener una reposición por ID con sus detalles
const obtenerReposicionById = async (req, res) => {
  try {
    const { id } = req.params;

    const reposicion = await ReposicionStock24h.findByPk(id, {
      include: [
        {
          model: DetalleReposicionStock,
          as: 'detalles',
          include: [
            {
              model: InsumoPresentacion,
              as: 'insumoPresentacion',
              include: [
                { model: Insumo, as: 'insumo' },
                { model: Presentacion, as: 'presentacion' }
              ]
            },
            {
              model: LoteInventario,
              as: 'lote'
            }
          ]
        },
        {
          model: Usuario,
          as: 'usuarioEntrega',
          include: [{ model: Personal, as: 'personal' }]
        },
        {
          model: Usuario,
          as: 'usuarioRecibe',
          include: [{ model: Personal, as: 'personal' }]
        }
      ]
    });

    if (!reposicion) {
      return res.status(404).json({
        success: false,
        message: 'Reposición no encontrada'
      });
    }

    res.json({
      success: true,
      data: reposicion
    });
  } catch (error) {
    logger.error('Error al obtener reposición:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reposición',
      error: error.message
    });
  }
};

module.exports = {
  listarStock24h,
  configurarStockFijo,
  agregarMedicamentoStock24h,
  obtenerAlertas,
  crearReposicion,
  listarReposiciones,
  obtenerReposicionById,
  obtenerEstadisticas
};
