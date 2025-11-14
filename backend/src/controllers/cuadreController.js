const { 
  CuadreStock24h,
  DetalleCuadreStock24h,
  Stock24Horas,
  InsumoPresentacion,
  Insumo,
  Presentacion,
  Personal,
  sequelize 
} = require('../models');
const logger = require('../config/logger');

// Iniciar un nuevo cuadre
const iniciarCuadre = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { 
      id_personal_turnista, 
      id_personal_bodeguero,
      observaciones 
    } = req.body;

    // Generar número de cuadre único
    const fecha = new Date();
    const numero_cuadre = `CUA-${fecha.getFullYear()}${(fecha.getMonth() + 1).toString().padStart(2, '0')}${fecha.getDate().toString().padStart(2, '0')}-${Date.now().toString().slice(-6)}`;

    // Crear registro de cuadre
    const nuevoCuadre = await CuadreStock24h.create({
      numero_cuadre,
      fecha_cuadre: new Date(),
      id_personal_turnista,
      id_personal_bodeguero,
      observaciones,
      estado: 'EN_PROCESO'
    }, { transaction: t });

    // Obtener todos los items del stock 24h
    const stockItems = await Stock24Horas.findAll({
      where: { estado: true },
      include: [{
        model: InsumoPresentacion,
        as: 'insumoPresentacion',
        include: [
          { model: Insumo, as: 'insumo' },
          { model: Presentacion, as: 'presentacion' }
        ]
      }]
    });

    // Crear detalles del cuadre con valores teóricos
    for (const item of stockItems) {
      await DetalleCuadreStock24h.create({
        id_cuadre_stock: nuevoCuadre.id_cuadre_stock,
        id_insumo_presentacion: item.id_insumo_presentacion,
        cantidad_teorica: item.stock_actual,
        cantidad_fisica: null, // Se llenará durante el conteo
        diferencia: null,
        observaciones: null
      }, { transaction: t });
    }

    await t.commit();

    logger.info(`Cuadre iniciado: ${numero_cuadre} por usuario ${req.usuario.id_usuario}`);

    // Obtener cuadre completo con detalles
    const cuadreCompleto = await CuadreStock24h.findByPk(nuevoCuadre.id_cuadre_stock, {
      include: [
        {
          model: Personal,
          as: 'turnista',
          attributes: ['nombres', 'apellidos', 'cargo']
        },
        {
          model: Personal,
          as: 'bodeguero',
          attributes: ['nombres', 'apellidos', 'cargo']
        },
        {
          model: DetalleCuadreStock24h,
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
      message: 'Cuadre iniciado exitosamente',
      data: cuadreCompleto
    });
  } catch (error) {
    await t.rollback();
    logger.error('Error al iniciar cuadre:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar el cuadre',
      error: error.message
    });
  }
};

// Registrar conteo físico para un detalle
const registrarConteo = async (req, res) => {
  try {
    const { id_cuadre_stock, id_detalle_cuadre } = req.params;
    const { cantidad_fisica, observaciones } = req.body;

    // Verificar que el cuadre existe y está en proceso
    const cuadre = await CuadreStock24h.findByPk(id_cuadre_stock);
    if (!cuadre) {
      return res.status(404).json({
        success: false,
        message: 'Cuadre no encontrado'
      });
    }

    if (cuadre.estado !== 'EN_PROCESO') {
      return res.status(400).json({
        success: false,
        message: 'El cuadre ya fue finalizado o cancelado'
      });
    }

    // Obtener el detalle
    const detalle = await DetalleCuadreStock24h.findByPk(id_detalle_cuadre);
    if (!detalle || detalle.id_cuadre_stock !== parseInt(id_cuadre_stock)) {
      return res.status(404).json({
        success: false,
        message: 'Detalle no encontrado'
      });
    }

    // Calcular diferencia
    const diferencia = cantidad_fisica - detalle.cantidad_teorica;

    // Actualizar detalle
    await detalle.update({
      cantidad_fisica,
      diferencia,
      observaciones: observaciones || detalle.observaciones
    });

    const detalleActualizado = await DetalleCuadreStock24h.findByPk(id_detalle_cuadre, {
      include: [{
        model: InsumoPresentacion,
        as: 'insumoPresentacion',
        include: [
          { model: Insumo, as: 'insumo' },
          { model: Presentacion, as: 'presentacion' }
        ]
      }]
    });

    logger.info(`Conteo registrado en cuadre ${id_cuadre_stock}, detalle ${id_detalle_cuadre}`);

    res.json({
      success: true,
      message: 'Conteo registrado exitosamente',
      data: detalleActualizado
    });
  } catch (error) {
    logger.error('Error al registrar conteo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar el conteo',
      error: error.message
    });
  }
};

// Finalizar cuadre y ajustar inventario
const finalizarCuadre = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const cuadre = await CuadreStock24h.findByPk(id, {
      include: [{
        model: DetalleCuadreStock24h,
        as: 'detalles'
      }]
    });

    if (!cuadre) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Cuadre no encontrado'
      });
    }

    if (cuadre.estado !== 'EN_PROCESO') {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'El cuadre ya fue finalizado'
      });
    }

    // Verificar que todos los conteos estén registrados
    const detallesSinContar = cuadre.detalles.filter(d => d.cantidad_fisica === null);
    if (detallesSinContar.length > 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: `Faltan ${detallesSinContar.length} items por contar`,
        pendientes: detallesSinContar.length
      });
    }

    // Ajustar stock según diferencias
    for (const detalle of cuadre.detalles) {
      if (detalle.diferencia !== 0) {
        // Actualizar stock_actual con la cantidad física contada
        await Stock24Horas.update(
          { stock_actual: detalle.cantidad_fisica },
          {
            where: { id_insumo_presentacion: detalle.id_insumo_presentacion },
            transaction: t
          }
        );
      }
    }

    // Marcar cuadre como completado
    await cuadre.update({ 
      estado: 'COMPLETADO' 
    }, { transaction: t });

    await t.commit();

    logger.info(`Cuadre finalizado: ${id} por usuario ${req.usuario.id_usuario}`);

    // Obtener cuadre completo
    const cuadreCompleto = await CuadreStock24h.findByPk(id, {
      include: [
        {
          model: Personal,
          as: 'turnista',
          attributes: ['nombres', 'apellidos']
        },
        {
          model: Personal,
          as: 'bodeguero',
          attributes: ['nombres', 'apellidos']
        },
        {
          model: DetalleCuadreStock24h,
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

    res.json({
      success: true,
      message: 'Cuadre finalizado exitosamente',
      data: cuadreCompleto
    });
  } catch (error) {
    await t.rollback();
    logger.error('Error al finalizar cuadre:', error);
    res.status(500).json({
      success: false,
      message: 'Error al finalizar el cuadre',
      error: error.message
    });
  }
};

// Listar cuadres con filtros
const listarCuadres = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      estado // 'EN_PROCESO', 'COMPLETADO', 'CANCELADO'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (estado) {
      where.estado = estado;
    }

    const { count, rows } = await CuadreStock24h.findAndCountAll({
      where,
      include: [
        {
          model: Personal,
          as: 'turnista',
          attributes: ['nombres', 'apellidos', 'cargo']
        },
        {
          model: Personal,
          as: 'bodeguero',
          attributes: ['nombres', 'apellidos', 'cargo']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fecha_cuadre', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      totalRegistros: count,
      paginaActual: parseInt(page),
      totalPaginas: Math.ceil(count / limit)
    });
  } catch (error) {
    logger.error('Error al listar cuadres:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los cuadres',
      error: error.message
    });
  }
};

// Obtener detalle completo de un cuadre
const obtenerCuadrePorId = async (req, res) => {
  try {
    const { id } = req.params;

    const cuadre = await CuadreStock24h.findByPk(id, {
      include: [
        {
          model: Personal,
          as: 'turnista',
          attributes: ['nombres', 'apellidos', 'cargo']
        },
        {
          model: Personal,
          as: 'bodeguero',
          attributes: ['nombres', 'apellidos', 'cargo']
        },
        {
          model: DetalleCuadreStock24h,
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

    if (!cuadre) {
      return res.status(404).json({
        success: false,
        message: 'Cuadre no encontrado'
      });
    }

    // Calcular estadísticas
    const totalItems = cuadre.detalles.length;
    const itemsContados = cuadre.detalles.filter(d => d.cantidad_fisica !== null).length;
    const itemsConDiferencia = cuadre.detalles.filter(d => d.diferencia !== 0 && d.diferencia !== null).length;

    res.json({
      success: true,
      data: {
        ...cuadre.toJSON(),
        estadisticas: {
          totalItems,
          itemsContados,
          itemsPendientes: totalItems - itemsContados,
          itemsConDiferencia,
          porcentajeAvance: totalItems > 0 ? Math.round((itemsContados / totalItems) * 100) : 0
        }
      }
    });
  } catch (error) {
    logger.error('Error al obtener cuadre:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el cuadre',
      error: error.message
    });
  }
};

module.exports = {
  iniciarCuadre,
  registrarConteo,
  finalizarCuadre,
  listarCuadres,
  obtenerCuadrePorId
};
