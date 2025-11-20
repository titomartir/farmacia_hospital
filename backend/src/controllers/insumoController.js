const { 
  Insumo, 
  InsumoPresentacion, 
  Presentacion, 
  UnidadMedida, 
  LoteInventario,
  sequelize 
} = require('../models');
const logger = require('../config/logger');
const { Op, QueryTypes } = require('sequelize');

// Listar insumos-presentaciones (para selección en formularios)
const listarInsumosPresentaciones = async (req, res) => {
  try {
    const { activo = 'true' } = req.query;
    
    const where = {};
    if (activo !== undefined) {
      where.estado = activo === 'true';
    }

    const insumosPresentaciones = await InsumoPresentacion.findAll({
      where,
      include: [
        {
          model: Insumo,
          as: 'insumo',
          where: { estado: true },
          attributes: ['id_insumo', 'nombre', 'descripcion']
        },
        {
          model: Presentacion,
          as: 'presentacion',
          attributes: ['id_presentacion', 'nombre']
        },
        {
          model: UnidadMedida,
          as: 'unidadMedida',
          attributes: ['id_unidad_medida', 'nombre', 'abreviatura']
        }
      ],
      order: [[{ model: Insumo, as: 'insumo' }, 'nombre', 'ASC']]
    });

    res.json({
      success: true,
      data: insumosPresentaciones
    });
  } catch (error) {
    logger.error('Error al listar insumos-presentaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener insumos-presentaciones',
      error: error.message
    });
  }
};

// Listar todos los insumos con paginación
const listarInsumos = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      buscar = '', 
      activo,
      clasificacion,
      subclasificacion
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (buscar) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${buscar}%` } },
        { descripcion: { [Op.iLike]: `%${buscar}%` } }
      ];
    }

    if (activo !== undefined) {
      where.estado = activo === 'true';
    }

    if (clasificacion) {
      where.clasificacion = clasificacion;
    }

    if (subclasificacion) {
      where.subclasificacion = subclasificacion;
    }

    const { count, rows } = await Insumo.findAndCountAll({
      where,
      include: [{
        model: InsumoPresentacion,
        as: 'presentaciones',
        include: [
          { model: Presentacion, as: 'presentacion' },
          { model: UnidadMedida, as: 'unidadMedida' },
          { model: LoteInventario, as: 'lotes' }
        ]
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['nombre', 'ASC']]
    });

    res.json({
      success: true,
      data: rows,
      totalRegistros: count,
      paginaActual: parseInt(page),
      totalPaginas: Math.ceil(count / limit)
    });
  } catch (error) {
    logger.error('Error al listar insumos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los insumos',
      error: error.message
    });
  }
};

// Obtener un insumo por ID
const obtenerInsumoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const insumo = await Insumo.findByPk(id, {
      include: [{
        model: InsumoPresentacion,
        as: 'presentaciones',
        include: [
          { model: Presentacion, as: 'presentacion' },
          { model: UnidadMedida, as: 'unidadMedida' },
          { 
            model: LoteInventario, 
            as: 'lotes',
            where: { estado: true },
            required: false
          }
        ]
      }]
    });

    if (!insumo) {
      return res.status(404).json({
        success: false,
        message: 'Insumo no encontrado'
      });
    }

    res.json({
      success: true,
      data: insumo
    });
  } catch (error) {
    logger.error('Error al obtener insumo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el insumo',
      error: error.message
    });
  }
};

// Crear nuevo insumo
const crearInsumo = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { 
      nombre, 
      descripcion,
      clasificacion,
      subclasificacion,
      stock_minimo,
      estado,
      // Campos para crear la presentación automáticamente
      id_presentacion,
      id_unidad_medida,
      cantidad_presentacion,
      presentaciones 
    } = req.body;

    // Crear insumo
    const nuevoInsumo = await Insumo.create({
      nombre,
      descripcion,
      clasificacion: clasificacion || 'listado_basico',
      subclasificacion,
      stock_minimo: stock_minimo || 0,
      estado: estado !== undefined ? estado : true
    }, { transaction: t });

    // Si se proporciona una presentación directa (desde formulario)
    if (id_presentacion && id_unidad_medida && cantidad_presentacion) {
      await InsumoPresentacion.create({
        id_insumo: nuevoInsumo.id_insumo,
        id_presentacion,
        id_unidad_medida,
        cantidad_presentacion,
        estado: true
      }, { transaction: t });
    }
    // O si se proporcionan múltiples presentaciones (desde API)
    else if (presentaciones && presentaciones.length > 0) {
      for (const pres of presentaciones) {
        await InsumoPresentacion.create({
          id_insumo: nuevoInsumo.id_insumo,
          id_presentacion: pres.id_presentacion,
          id_unidad_medida: pres.id_unidad_medida,
          cantidad_presentacion: pres.cantidad_presentacion || pres.concentracion,
          estado: true
        }, { transaction: t });
      }
    }

    await t.commit();

    logger.info(`Insumo creado: ${nombre} por usuario ${req.usuario.nombre_usuario}`);

    // Obtener insumo completo
    const insumoCompleto = await Insumo.findByPk(nuevoInsumo.id_insumo, {
      include: [{
        model: InsumoPresentacion,
        as: 'presentaciones',
        include: [
          { model: Presentacion, as: 'presentacion' },
          { model: UnidadMedida, as: 'unidadMedida' }
        ]
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Insumo creado correctamente',
      data: insumoCompleto
    });
  } catch (error) {
    await t.rollback();
    logger.error('Error al crear insumo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el insumo',
      error: error.message
    });
  }
};

// Actualizar insumo
const actualizarInsumo = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nombre, 
      descripcion, 
      clasificacion, 
      subclasificacion, 
      stock_minimo, 
      estado 
    } = req.body;

    const insumo = await Insumo.findByPk(id);

    if (!insumo) {
      return res.status(404).json({
        success: false,
        message: 'Insumo no encontrado'
      });
    }

    await insumo.update({
      nombre,
      descripcion,
      clasificacion,
      subclasificacion,
      stock_minimo,
      estado,
      fecha_actualizacion: new Date()
    });

    logger.info(`Insumo actualizado: ${id} por usuario ${req.usuario.nombre_usuario}`);

    res.json({
      success: true,
      message: 'Insumo actualizado correctamente',
      data: insumo
    });
  } catch (error) {
    logger.error('Error al actualizar insumo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el insumo',
      error: error.message
    });
  }
};

// Eliminar (desactivar) insumo
const eliminarInsumo = async (req, res) => {
  try {
    const { id } = req.params;

    const insumo = await Insumo.findByPk(id);

    if (!insumo) {
      return res.status(404).json({
        success: false,
        message: 'Insumo no encontrado'
      });
    }

    await insumo.update({ estado: false });

    logger.info(`Insumo desactivado: ${id} por usuario ${req.usuario.nombre_usuario}`);

    res.json({
      success: true,
      message: 'Insumo desactivado correctamente'
    });
  } catch (error) {
    logger.error('Error al eliminar insumo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el insumo',
      error: error.message
    });
  }
};

// Crear insumo con presentación (REGISTRO DINÁMICO)
const crearInsumoConPresentacion = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const {
      nombre,
      descripcion,
      stock_minimo,
      dias_alerta_vencimiento,
      requiere_stock_24h,
      tipo_documento,
      // Datos de la presentación
      id_presentacion,
      id_unidad_medida,
      cantidad_presentacion,
      precio_unitario,
      codigo_barras
    } = req.body;

    // Verificar si ya existe un insumo con el mismo nombre
    const insumoExistente = await Insumo.findOne({
      where: { nombre: { [Op.iLike]: nombre } },
      transaction: t
    });

    if (insumoExistente) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Ya existe un insumo con ese nombre',
        data: { id_insumo: insumoExistente.id_insumo }
      });
    }

    // Crear el insumo
    const nuevoInsumo = await Insumo.create({
      nombre,
      descripcion,
      stock_minimo: stock_minimo || 0,
      dias_alerta_vencimiento: dias_alerta_vencimiento || 30,
      requiere_stock_24h: requiere_stock_24h || false,
      tipo_documento: tipo_documento || 'RECETA',
      estado: true
    }, { transaction: t });

    // Crear la presentación del insumo
    const nuevaPresentacion = await InsumoPresentacion.create({
      id_insumo: nuevoInsumo.id_insumo,
      id_presentacion,
      id_unidad_medida,
      cantidad_presentacion,
      precio_unitario: precio_unitario || 0,
      codigo_barras,
      estado: true
    }, { transaction: t });

    await t.commit();

    logger.info(`Insumo creado dinámicamente: ${nombre} por usuario ${req.usuario.nombre_usuario}`);

    // Obtener insumo completo con presentación
    const insumoCompleto = await Insumo.findByPk(nuevoInsumo.id_insumo, {
      include: [{
        model: InsumoPresentacion,
        as: 'presentaciones',
        include: [
          { model: Presentacion, as: 'presentacion' },
          { model: UnidadMedida, as: 'unidadMedida' }
        ]
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Insumo y presentación creados exitosamente',
      data: {
        insumo: insumoCompleto,
        id_insumo_presentacion: nuevaPresentacion.id_insumo_presentacion
      }
    });

  } catch (error) {
    await t.rollback();
    logger.error('Error al crear insumo con presentación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el insumo',
      error: error.message
    });
  }
};

// Obtener inventario total consolidado (bodega general + stock 24h)
const obtenerInventarioTotal = async (req, res) => {
  try {
    const { buscar = '' } = req.query;

    // Subconsulta para obtener total en bodega general (suma de todos los lotes)
    const inventarioGeneral = await sequelize.query(`
      SELECT 
        ip.id_insumo_presentacion,
        COALESCE(SUM(li.cantidad_disponible), 0) as stock_general
      FROM insumo_presentacion ip
      LEFT JOIN lote_inventario li ON ip.id_insumo_presentacion = li.id_insumo_presentacion
        AND li.estado = 'disponible'
      GROUP BY ip.id_insumo_presentacion
    `, { type: QueryTypes.SELECT });

    // Subconsulta para stock 24h
    const stock24h = await sequelize.query(`
      SELECT 
        id_insumo_presentacion,
        stock_actual as stock_24h
      FROM stock_24_horas
      WHERE estado = true
    `, { type: QueryTypes.SELECT });

    // Crear mapas para combinar los datos
    const mapaGeneral = new Map(inventarioGeneral.map(item => [item.id_insumo_presentacion, parseInt(item.stock_general)]));
    const mapa24h = new Map(stock24h.map(item => [item.id_insumo_presentacion, item.stock_24h]));

    // Obtener todos los insumos-presentaciones con filtro de búsqueda
    const whereInsumo = buscar ? {
      [Op.or]: [
        { nombre: { [Op.iLike]: `%${buscar}%` } },
        { descripcion: { [Op.iLike]: `%${buscar}%` } }
      ]
    } : {};

    const insumosPresentaciones = await InsumoPresentacion.findAll({
      where: { estado: true },
      include: [
        {
          model: Insumo,
          as: 'insumo',
          where: { estado: true, ...whereInsumo },
          attributes: ['id_insumo', 'nombre', 'descripcion', 'clasificacion', 'subclasificacion']
        },
        {
          model: Presentacion,
          as: 'presentacion',
          attributes: ['id_presentacion', 'nombre']
        },
        {
          model: UnidadMedida,
          as: 'unidadMedida',
          attributes: ['id_unidad_medida', 'nombre', 'abreviatura']
        }
      ],
      order: [[{ model: Insumo, as: 'insumo' }, 'nombre', 'ASC']]
    });

    // Combinar datos
    const inventarioTotal = insumosPresentaciones.map(ip => {
      const stockGeneral = mapaGeneral.get(ip.id_insumo_presentacion) || 0;
      const stock24h = mapa24h.get(ip.id_insumo_presentacion) || 0;
      const stockTotal = stockGeneral + stock24h;

      return {
        id_insumo_presentacion: ip.id_insumo_presentacion,
        insumo: ip.insumo,
        presentacion: ip.presentacion,
        unidadMedida: ip.unidadMedida,
        stock_general: stockGeneral,
        stock_24h: stock24h,
        stock_total: stockTotal,
        tiene_stock_24h: stock24h > 0
      };
    });

    res.json({
      success: true,
      data: inventarioTotal
    });
  } catch (error) {
    logger.error('Error al obtener inventario total:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener inventario total',
      error: error.message
    });
  }
};

module.exports = {
  listarInsumos,
  listarInsumosPresentaciones,
  obtenerInsumoPorId,
  crearInsumo,
  actualizarInsumo,
  eliminarInsumo,
  crearInsumoConPresentacion,
  obtenerInventarioTotal
};

