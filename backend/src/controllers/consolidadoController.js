const { 
  Consolidado, 
  DetalleConsolidado, 
  Usuario, 
  Personal,
  Servicio, 
  InsumoPresentacion,
  Insumo,
  Presentacion,
  LoteInventario,
  sequelize 
} = require('../models');
const logger = require('../config/logger');

// Listar consolidados con filtros
const listarConsolidados = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      servicio, 
      usuario, 
      fecha_desde, 
      fecha_hasta,
      turno,
      encargado,
      id_encargado,
      estado
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (servicio) where.id_servicio = servicio;
    if (usuario) where.id_usuario = usuario;
    if (turno) where.turno = turno;
    if (estado) where.estado = estado;
    
    // Filtro por encargado: puede ser texto (búsqueda por nombre) o ID (usuario que lo creó)
    if (id_encargado) {
      where.id_usuario = id_encargado;
    } else if (encargado) {
      where.encargado = {
        [sequelize.Sequelize.Op.iLike]: `%${encargado}%`
      };
    }

    if (fecha_desde && fecha_hasta) {
      where.fecha_consolidado = {
        [sequelize.Sequelize.Op.between]: [fecha_desde, fecha_hasta]
      };
    } else if (fecha_desde) {
      where.fecha_consolidado = {
        [sequelize.Sequelize.Op.gte]: fecha_desde
      };
    }

    const { count, rows } = await Consolidado.findAndCountAll({
      where,
      include: [
        {
          model: Usuario,
          as: 'usuario',
          include: [{ model: Personal, as: 'personal' }]
        },
        { model: Servicio, as: 'servicio' }
      ],
      order: [['fecha_consolidado', 'DESC'], ['id_consolidado', 'DESC']],
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
    logger.error('Error al listar consolidados:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener consolidados',
      error: error.message
    });
  }
};

// Obtener consolidado por ID con todos los detalles
const obtenerConsolidadoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const consolidado = await Consolidado.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'usuario',
          include: [{ model: Personal, as: 'personal' }]
        },
        { model: Servicio, as: 'servicio' },
        {
          model: DetalleConsolidado,
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
        }
      ]
    });

    if (!consolidado) {
      return res.status(404).json({
        success: false,
        message: 'Consolidado no encontrado'
      });
    }

    res.json({
      success: true,
      data: consolidado
    });
  } catch (error) {
    logger.error('Error al obtener consolidado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener consolidado',
      error: error.message
    });
  }
};

// Crear nuevo consolidado con detalles
const crearConsolidado = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { 
      id_servicio, 
      fecha_consolidado, 
      turno,
      observaciones, 
      detalles 
    } = req.body;

    const id_usuario = req.usuario.id_usuario;

    // Validar que haya detalles
    if (!detalles || detalles.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar al menos un detalle de medicamento'
      });
    }

    // Crear consolidado
    const nuevoConsolidado = await Consolidado.create({
      id_usuario,
      id_servicio,
      fecha_consolidado,
      turno,
      observaciones,
      estado: 'activo'
    }, { transaction: t });

    // Crear detalles
    const detallesCreados = [];
    let total_medicamentos = 0;
    let costo_total = 0;

    for (const detalle of detalles) {
      // Verificar stock disponible
      const insumoPresentacion = await InsumoPresentacion.findByPk(
        detalle.id_insumo_presentacion,
        { transaction: t }
      );

      if (!insumoPresentacion) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Insumo con ID ${detalle.id_insumo_presentacion} no encontrado`
        });
      }

      // Crear detalle (los triggers de BD se encargan de actualizar inventario)
      const nuevoDetalle = await DetalleConsolidado.create({
        id_consolidado: nuevoConsolidado.id_consolidado,
        id_insumo_presentacion: detalle.id_insumo_presentacion,
        id_lote: detalle.id_lote || null,
        numero_cama: detalle.numero_cama,
        nombre_paciente: detalle.nombre_paciente,
        numero_registro: detalle.numero_registro,
        cantidad: detalle.cantidad,
        precio_unitario: detalle.precio_unitario || 0,
        observaciones: detalle.observaciones
      }, { transaction: t });

      detallesCreados.push(nuevoDetalle);
      total_medicamentos += 1;
      costo_total += parseFloat(detalle.cantidad) * parseFloat(detalle.precio_unitario || 0);
    }

    // Actualizar totales en consolidado
    await nuevoConsolidado.update({
      total_medicamentos,
      costo_total
    }, { transaction: t });

    await t.commit();

    logger.info(`Consolidado creado: ${nuevoConsolidado.id_consolidado} por usuario ${id_usuario}`);

    // Obtener consolidado completo
    const consolidadoCompleto = await Consolidado.findByPk(nuevoConsolidado.id_consolidado, {
      include: [
        {
          model: Usuario,
          as: 'usuario',
          include: [{ model: Personal, as: 'personal' }]
        },
        { model: Servicio, as: 'servicio' },
        {
          model: DetalleConsolidado,
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
      message: 'Consolidado creado correctamente',
      data: consolidadoCompleto
    });
  } catch (error) {
    await t.rollback();
    logger.error('Error al crear consolidado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear consolidado',
      error: error.message
    });
  }
};

// Aprobar consolidado (cambiar estado de 'activo' a 'aprobado')
const aprobarConsolidado = async (req, res) => {
  try {
    const { id } = req.params;

    const consolidado = await Consolidado.findByPk(id);

    if (!consolidado) {
      return res.status(404).json({
        success: false,
        message: 'Consolidado no encontrado'
      });
    }

    if (consolidado.estado !== 'activo') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden aprobar consolidados en estado activo'
      });
    }

    await consolidado.update({
      estado: 'aprobado'
    });

    logger.info(`Consolidado aprobado: ${id} por usuario ${req.usuario.id_usuario}`);

    res.json({
      success: true,
      message: 'Consolidado aprobado correctamente',
      data: consolidado
    });
  } catch (error) {
    logger.error('Error al aprobar consolidado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al aprobar consolidado',
      error: error.message
    });
  }
};

// Cerrar consolidado (cambiar estado a 'cerrado')
const cerrarConsolidado = async (req, res) => {
  try {
    const { id } = req.params;

    const consolidado = await Consolidado.findByPk(id);

    if (!consolidado) {
      return res.status(404).json({
        success: false,
        message: 'Consolidado no encontrado'
      });
    }

    if (consolidado.estado === 'cerrado') {
      return res.status(400).json({
        success: false,
        message: 'El consolidado ya está cerrado'
      });
    }

    await consolidado.update({
      estado: 'cerrado',
      fecha_cierre: new Date()
    });

    logger.info(`Consolidado cerrado: ${id} por usuario ${req.usuario.id_usuario}`);

    res.json({
      success: true,
      message: 'Consolidado cerrado correctamente',
      data: consolidado
    });
  } catch (error) {
    logger.error('Error al cerrar consolidado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cerrar consolidado',
      error: error.message
    });
  }
};

// Anular consolidado
const anularConsolidado = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const consolidado = await Consolidado.findByPk(id);

    if (!consolidado) {
      return res.status(404).json({
        success: false,
        message: 'Consolidado no encontrado'
      });
    }

    if (consolidado.estado === 'anulado') {
      return res.status(400).json({
        success: false,
        message: 'El consolidado ya está anulado'
      });
    }

    await consolidado.update({
      estado: 'anulado',
      observaciones: (consolidado.observaciones || '') + `\n[ANULADO] ${motivo}`
    });

    logger.info(`Consolidado anulado: ${id} por usuario ${req.usuario.id_usuario}`);

    res.json({
      success: true,
      message: 'Consolidado anulado correctamente',
      data: consolidado
    });
  } catch (error) {
    logger.error('Error al anular consolidado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al anular consolidado',
      error: error.message
    });
  }
};

// Entregar consolidado
const entregarConsolidado = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { detalles_entregados } = req.body;

    const consolidado = await Consolidado.findByPk(id, { transaction: t });

    if (!consolidado) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Consolidado no encontrado'
      });
    }

    if (consolidado.estado !== 'aprobado') {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden entregar consolidados en estado aprobado'
      });
    }

    // Actualizar cantidades entregadas en detalles
    if (detalles_entregados && detalles_entregados.length > 0) {
      for (const detalle of detalles_entregados) {
        await DetalleConsolidado.update(
          { 
            cantidad_entregada: detalle.cantidad_entregada,
            id_lote: detalle.id_lote,
            precio_unitario: detalle.precio_unitario || 0
          },
          { 
            where: { id_detalle_consolidado: detalle.id_detalle_consolidado },
            transaction: t 
          }
        );
      }
    }

    // Actualizar estado del consolidado a cerrado
    await consolidado.update({
      estado: 'cerrado',
      fecha_cierre: new Date()
    }, { transaction: t });

    await t.commit();

    logger.info(`Consolidado entregado: ${id} por usuario ${req.usuario.id_usuario}`);

    const consolidadoActualizado = await Consolidado.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'usuario',
          include: [{ model: Personal, as: 'personal' }]
        },
        { model: Servicio, as: 'servicio' },
        {
          model: DetalleConsolidado,
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
        }
      ]
    });

    res.json({
      success: true,
      message: 'Consolidado entregado correctamente',
      data: consolidadoActualizado
    });
  } catch (error) {
    await t.rollback();
    logger.error('Error al entregar consolidado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al entregar consolidado',
      error: error.message
    });
  }
};

// Actualizar consolidado (solo en estado 'activo')
const actualizarConsolidado = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { id_servicio, fecha_consolidado, turno, observaciones, detalles } = req.body;

    logger.info(`Actualizando consolidado ${id}:`, { id_servicio, turno, detalles_count: detalles?.length });

    const consolidado = await Consolidado.findByPk(id, { transaction: t });

    if (!consolidado) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Consolidado no encontrado' });
    }

    if (consolidado.estado !== 'activo') {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Solo se pueden editar consolidados en estado activo' });
    }

    if (!detalles || detalles.length === 0) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Debe proporcionar al menos un detalle' });
    }

    // Actualizar datos principales
    await consolidado.update({
      id_servicio,
      fecha_consolidado,
      turno,
      observaciones
    }, { transaction: t });

    // Eliminar detalles anteriores
    await DetalleConsolidado.destroy({ where: { id_consolidado: id }, transaction: t });

    // Crear nuevos detalles
    let total_medicamentos = 0;
    let costo_total = 0;

    for (const detalle of detalles) {
      const insumoPresentacion = await InsumoPresentacion.findByPk(
        detalle.id_insumo_presentacion,
        { transaction: t }
      );

      if (!insumoPresentacion) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Insumo no encontrado: ${detalle.id_insumo_presentacion}` });
      }

      await DetalleConsolidado.create({
        id_consolidado: id,
        id_insumo_presentacion: detalle.id_insumo_presentacion,
        numero_cama: detalle.numero_cama,
        nombre_paciente: detalle.nombre_paciente,
        numero_registro: detalle.numero_registro,
        cantidad: detalle.cantidad,
        precio_unitario: detalle.precio_unitario || 0,
        observaciones: detalle.observaciones
      }, { transaction: t });

      total_medicamentos += 1;
      costo_total += parseFloat(detalle.cantidad) * parseFloat(detalle.precio_unitario || 0);
    }

    // Actualizar totales
    await consolidado.update({
      total_medicamentos,
      costo_total
    }, { transaction: t });

    await t.commit();

    const consolidadoActualizado = await Consolidado.findByPk(id, {
      include: [
        { model: Usuario, as: 'usuario', include: [{ model: Personal, as: 'personal' }] },
        { model: Servicio, as: 'servicio' },
        {
          model: DetalleConsolidado,
          as: 'detalles',
          include: [
            { model: InsumoPresentacion, as: 'insumoPresentacion', include: [
              { model: Insumo, as: 'insumo' },
              { model: Presentacion, as: 'presentacion' }
            ]}
          ]
        }
      ]
    });

    logger.info(`Consolidado actualizado: ${id}`);
    res.json({ success: true, message: 'Consolidado actualizado correctamente', data: consolidadoActualizado });
  } catch (error) {
    await t.rollback();
    logger.error('Error al actualizar consolidado:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar consolidado', error: error.message });
  }
};

module.exports = {
  listarConsolidados,
  obtenerConsolidadoPorId,
  crearConsolidado,
  actualizarConsolidado,
  aprobarConsolidado,
  cerrarConsolidado,
  anularConsolidado,
  entregarConsolidado
};
