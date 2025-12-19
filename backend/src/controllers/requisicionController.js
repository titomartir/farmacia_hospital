const { 
  Requisicion, 
  DetalleRequisicion, 
  Usuario, 
  Personal,
  Servicio, 
  InsumoPresentacion,
  Insumo,
  Presentacion,
  sequelize 
} = require('../models');
const { LoteInventario } = require('../models');
const logger = require('../config/logger');

// Listar requisiciones
const listarRequisiciones = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      id_servicio,
      servicio, 
      id_solicitante,
      estado, 
      prioridad,
      fecha_desde, 
      fecha_hasta
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (id_servicio || servicio) where.id_servicio = id_servicio || servicio;
    if (id_solicitante) where.id_usuario_solicita = id_solicitante;
    if (estado) where.estado = estado;
    if (prioridad) where.prioridad = prioridad;

    if (fecha_desde && fecha_hasta) {
      where.fecha_solicitud = {
        [sequelize.Sequelize.Op.between]: [fecha_desde, fecha_hasta]
      };
    }

    const { count, rows } = await Requisicion.findAndCountAll({
      where,
      include: [
        {
          model: Usuario,
          as: 'usuarioSolicita',
          include: [{ model: Personal, as: 'personal' }]
        },
        { model: Servicio, as: 'servicio' }
      ],
      order: [
        ['prioridad', 'ASC'],
        ['fecha_solicitud', 'DESC']
      ],
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
    logger.error('Error al listar requisiciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener requisiciones',
      error: error.message
    });
  }
};

// Obtener requisición por ID
const obtenerRequisicionPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const requisicion = await Requisicion.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'usuarioSolicita',
          include: [{ model: Personal, as: 'personal' }]
        },
        {
          model: Usuario,
          as: 'usuarioAutoriza',
          include: [{ model: Personal, as: 'personal' }]
        },
        {
          model: Usuario,
          as: 'usuarioEntrega',
          include: [{ model: Personal, as: 'personal' }]
        },
        { model: Servicio, as: 'servicio' },
        {
          model: DetalleRequisicion,
          as: 'detalles',
          include: [
            {
              model: InsumoPresentacion,
              as: 'insumoPresentacion',
              include: [
                { model: Insumo, as: 'insumo', attributes: ['id_insumo', 'nombre'] },
                { model: Presentacion, as: 'presentacion', attributes: ['id_presentacion', 'nombre'] }
              ]
            }
          ]
        }
      ]
    });

    if (!requisicion) {
      return res.status(404).json({
        success: false,
        message: 'Requisición no encontrada'
      });
    }

    res.json({
      success: true,
      data: requisicion
    });
  } catch (error) {
    logger.error('Error al obtener requisición:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener requisición',
      error: error.message
    });
  }
};

// Crear nueva requisición
const crearRequisicion = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { 
      id_servicio, 
      fecha_solicitud,
      prioridad = 'normal',
      observaciones,
      origen_despacho = 'general',
      numero_cama,
      nombre_paciente,
      detalles 
    } = req.body;

    logger.info('📥 crearRequisicion - req.body:', JSON.stringify(req.body, null, 2));

    const id_usuario_solicita = req.usuario.id_usuario;

    if (!detalles || detalles.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar al menos un detalle de medicamento'
      });
    }

    // Crear requisición
    const nuevaRequisicion = await Requisicion.create({
      id_servicio,
      id_usuario_solicita,
      fecha_solicitud,
      prioridad,
      observaciones,
      origen_despacho,
      numero_cama,
      nombre_paciente,
      estado: 'pendiente'
    }, { transaction: t });

    // Crear detalles
    for (const detalle of detalles) {
      logger.info(`📝 Guardando detalle: cama=${detalle.numero_cama}, expediente=${detalle.numero_expediente}, paciente=${detalle.nombre_paciente}, sexo=${detalle.sexo}`);
      await DetalleRequisicion.create({
        id_requisicion: nuevaRequisicion.id_requisicion,
        id_insumo_presentacion: detalle.id_insumo_presentacion,
        cantidad_solicitada: detalle.cantidad_solicitada,
        numero_cama: detalle.numero_cama,
        numero_expediente: detalle.numero_expediente,
        nombre_paciente: detalle.nombre_paciente,
        sexo: detalle.sexo,
        observaciones: detalle.observaciones
      }, { transaction: t });
    }

    await t.commit();

    logger.info(`Requisición creada: ${nuevaRequisicion.id_requisicion} por usuario ${id_usuario_solicita}`);

    // Obtener requisición completa
    const requisicionCompleta = await Requisicion.findByPk(nuevaRequisicion.id_requisicion, {
      include: [
        {
          model: Usuario,
          as: 'usuarioSolicita',
          include: [{ model: Personal, as: 'personal' }]
        },
        { model: Servicio, as: 'servicio' },
        {
          model: DetalleRequisicion,
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
      message: 'Requisición creada correctamente',
      data: requisicionCompleta
    });
  } catch (error) {
    await t.rollback();
    logger.error('Error al crear requisición:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear requisición',
      error: error.message
    });
  }
};

// Actualizar requisición
const actualizarRequisicion = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { id_servicio, fecha_solicitud, prioridad, observaciones, detalles } = req.body;

    logger.info(`Actualizando requisición ${id}:`, { id_servicio, prioridad, detalles_count: detalles?.length });

    const requisicion = await Requisicion.findByPk(id, { transaction: t });

    if (!requisicion) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Requisición no encontrada' });
    }

    if (requisicion.estado !== 'pendiente') {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Solo se pueden editar requisiciones en estado pendiente' });
    }

    if (!detalles || detalles.length === 0) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Debe proporcionar al menos un detalle' });
    }

    // Actualizar datos principales
    await requisicion.update({
      id_servicio,
      fecha_solicitud,
      prioridad,
      observaciones
    }, { transaction: t });

    // Eliminar detalles anteriores
    await DetalleRequisicion.destroy({ where: { id_requisicion: id }, transaction: t });

    // Crear nuevos detalles
    for (const detalle of detalles) {
      const insumoPresentacion = await InsumoPresentacion.findByPk(
        detalle.id_insumo_presentacion,
        { transaction: t }
      );

      if (!insumoPresentacion) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Insumo no encontrado: ${detalle.id_insumo_presentacion}` });
      }

      logger.info(`📝 Guardando detalle en actualización: cama=${detalle.numero_cama}, expediente=${detalle.numero_expediente}, paciente=${detalle.nombre_paciente}, sexo=${detalle.sexo}`);

      await DetalleRequisicion.create({
        id_requisicion: id,
        id_insumo_presentacion: detalle.id_insumo_presentacion,
        cantidad_solicitada: detalle.cantidad_solicitada,
        numero_cama: detalle.numero_cama,
        numero_expediente: detalle.numero_expediente,
        nombre_paciente: detalle.nombre_paciente,
        sexo: detalle.sexo,
        observaciones: detalle.observaciones
      }, { transaction: t });
    }

    await t.commit();

    const requisicionActualizada = await Requisicion.findByPk(id, {
      include: [
        { model: Usuario, as: 'usuarioSolicita', include: [{ model: Personal, as: 'personal' }] },
        { model: Servicio, as: 'servicio' },
        {
          model: DetalleRequisicion,
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

    logger.info(`Requisición actualizada: ${id}`);
    res.json({ success: true, message: 'Requisición actualizada correctamente', data: requisicionActualizada });
  } catch (error) {
    await t.rollback();
    logger.error('Error al actualizar requisición:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar requisición',
      error: error.message
    });
  }
};

// Aprobar requisición
const aprobarRequisicion = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { detalles_autorizados } = req.body;

    const requisicion = await Requisicion.findByPk(id, { transaction: t });

    if (!requisicion) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Requisición no encontrada'
      });
    }

    if (requisicion.estado !== 'pendiente') {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'La requisición no está pendiente'
      });
    }

    // Actualizar estado y usuario autorizador
    await requisicion.update({
      estado: 'aprobada',
      id_usuario_autoriza: req.usuario.id_usuario,
      fecha_autorizacion: new Date()
    }, { transaction: t });


    // Actualizar cantidades autorizadas en detalles
    if (detalles_autorizados && detalles_autorizados.length > 0) {
      for (const detalle of detalles_autorizados) {
        await DetalleRequisicion.update(
          { cantidad_autorizada: detalle.cantidad_autorizada },
          { 
            where: { id_detalle_requisicion: detalle.id_detalle_requisicion },
            transaction: t 
          }
        );
      }
    }

    // Asignar lote automáticamente a detalles de receta sin lote
    const detalles = await DetalleRequisicion.findAll({
      where: { id_requisicion: id },
      transaction: t,
      include: [{
        model: InsumoPresentacion,
        as: 'insumoPresentacion',
        include: [{ model: Insumo, as: 'insumo' }]
      }]
    });

    for (const detalle of detalles) {
      const insumo = detalle.insumoPresentacion?.insumo;
      if (insumo && (insumo.subclasificacion === 'receta') && (!detalle.id_lote || detalle.id_lote === 0)) {
        // Buscar lote disponible con stock
        const lote = await LoteInventario.findOne({
          where: {
            id_insumo_presentacion: detalle.id_insumo_presentacion,
            estado: true,
            cantidad_actual: { [sequelize.Sequelize.Op.gt]: 0 }
          },
          order: [['fecha_vencimiento', 'ASC']],
          transaction: t
        });
        if (lote) {
          await detalle.update({ id_lote: lote.id_lote }, { transaction: t });
        }
      }
    }

    await t.commit();

    logger.info(`Requisición aprobada: ${id} por usuario ${req.usuario.id_usuario}`);

    const requisicionActualizada = await Requisicion.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'usuarioSolicita',
          include: [{ model: Personal, as: 'personal' }]
        },
        {
          model: Usuario,
          as: 'usuarioAutoriza',
          include: [{ model: Personal, as: 'personal' }]
        },
        { model: Servicio, as: 'servicio' },
        {
          model: DetalleRequisicion,
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

    res.json({
      success: true,
      message: 'Requisición aprobada correctamente',
      data: requisicionActualizada
    });
  } catch (error) {
    await t.rollback();
    logger.error('Error al aprobar requisición:', error);
    res.status(500).json({
      success: false,
      message: 'Error al aprobar requisición',
      error: error.message
    });
  }
};

// Entregar requisición
const entregarRequisicion = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { detalles_entregados } = req.body;

    const requisicion = await Requisicion.findByPk(id, { transaction: t });

    if (!requisicion) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Requisición no encontrada'
      });
    }

    if (requisicion.estado !== 'aprobada') {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'La requisición no está aprobada'
      });
    }

    // Actualizar estado y usuario entregador
    await requisicion.update({
      estado: 'entregada',
      id_usuario_entrega: req.usuario.id_usuario,
      fecha_entrega: new Date()
    }, { transaction: t });

    // Actualizar cantidades entregadas en detalles
    if (detalles_entregados && detalles_entregados.length > 0) {
      for (const detalle of detalles_entregados) {
        // FIX: Obtener el precio del lote automáticamente
        let precio_unitario_lote = 0;
        if (detalle.id_lote) {
          const LoteInventario = require('../models/LoteInventario');
          const lote = await LoteInventario.findByPk(detalle.id_lote, { transaction: t });
          if (lote) {
            precio_unitario_lote = lote.precio_lote;
          }
        }
        await DetalleRequisicion.update(
          { 
            cantidad_entregada: detalle.cantidad_entregada,
            id_lote: detalle.id_lote,
            precio_unitario: precio_unitario_lote
          },
          { 
            where: { id_detalle_requisicion: detalle.id_detalle_requisicion },
            transaction: t 
          }
        );

        // NUEVO: Si la requisición es de stock_24h, descontar automáticamente
        if (requisicion.origen_despacho === 'stock_24h') {
          const detalleCompleto = await DetalleRequisicion.findByPk(detalle.id_detalle_requisicion);
          
          if (detalleCompleto) {
            // Descontar del stock 24h
            const Stock24Horas = require('../models').Stock24Horas;
            await Stock24Horas.decrement(
              { stock_actual: detalle.cantidad_entregada },
              { 
                where: { id_insumo_presentacion: detalleCompleto.id_insumo_presentacion },
                transaction: t 
              }
            );

            // Registrar movimiento
            const MovimientoStock24h = require('../models').MovimientoStock24h;
            const Personal = require('../models').Personal;
            
            // Obtener id_personal del usuario
            const usuario = await Usuario.findByPk(req.usuario.id_usuario, {
              include: [{ model: Personal, as: 'personal' }]
            });

            if (usuario && usuario.id_personal) {
              await MovimientoStock24h.create({
                id_stock_24h: detalleCompleto.id_insumo_presentacion, // Se necesita obtener el id_stock_24h
                tipo_movimiento: 'consumo_requisicion',
                cantidad: detalle.cantidad_entregada,
                id_personal: usuario.id_personal,
                observaciones: `Requisición #${id} - ${requisicion.servicio || 'N/A'}`
              }, { transaction: t });
            }

            logger.info(`Stock 24h decrementado: ${detalleCompleto.id_insumo_presentacion} cantidad: ${detalle.cantidad_entregada}`);
          }
        }
      }
    }

    await t.commit();

    logger.info(`Requisición entregada: ${id} por usuario ${req.usuario.id_usuario}`);

    const requisicionActualizada = await Requisicion.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'usuarioSolicita',
          include: [{ model: Personal, as: 'personal' }]
        },
        {
          model: Usuario,
          as: 'usuarioAutoriza',
          include: [{ model: Personal, as: 'personal' }]
        },
        {
          model: Usuario,
          as: 'usuarioEntrega',
          include: [{ model: Personal, as: 'personal' }]
        },
        { model: Servicio, as: 'servicio' },
        {
          model: DetalleRequisicion,
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

    res.json({
      success: true,
      message: 'Requisición entregada correctamente',
      data: requisicionActualizada
    });
  } catch (error) {
    await t.rollback();
    logger.error('Error al entregar requisición:', error);
    res.status(500).json({
      success: false,
      message: 'Error al entregar requisición',
      error: error.message
    });
  }
};

// Rechazar requisición
const rechazarRequisicion = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const requisicion = await Requisicion.findByPk(id);

    if (!requisicion) {
      return res.status(404).json({
        success: false,
        message: 'Requisición no encontrada'
      });
    }

    if (requisicion.estado !== 'pendiente') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden rechazar requisiciones pendientes'
      });
    }

    await requisicion.update({
      estado: 'rechazada',
      id_usuario_autoriza: req.usuario.id_usuario,
      fecha_autorizacion: new Date(),
      observaciones: (requisicion.observaciones || '') + `\n[RECHAZADA] ${motivo}`
    });

    logger.info(`Requisición rechazada: ${id} por usuario ${req.usuario.id_usuario}`);

    res.json({
      success: true,
      message: 'Requisición rechazada',
      data: requisicion
    });
  } catch (error) {
    logger.error('Error al rechazar requisición:', error);
    res.status(500).json({
      success: false,
      message: 'Error al rechazar requisición',
      error: error.message
    });
  }
};

module.exports = {
  listarRequisiciones,
  obtenerRequisicionPorId,
  crearRequisicion,
  actualizarRequisicion,
  aprobarRequisicion,
  entregarRequisicion,
  rechazarRequisicion
};
