const { 
  Presentacion, 
  UnidadMedida, 
  Proveedor, 
  Servicio 
} = require('../models');
const logger = require('../config/logger');

// Obtener todas las presentaciones activas
const listarPresentaciones = async (req, res) => {
  try {
    const presentaciones = await Presentacion.findAll({
      where: { estado: true },
      order: [['nombre', 'ASC']]
    });

    res.json({
      success: true,
      data: presentaciones
    });
  } catch (error) {
    logger.error('Error al listar presentaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener presentaciones',
      error: error.message
    });
  }
};

// Obtener todas las unidades de medida activas
const listarUnidadesMedida = async (req, res) => {
  try {
    const unidades = await UnidadMedida.findAll({
      where: { estado: true },
      order: [['nombre', 'ASC']]
    });

    res.json({
      success: true,
      data: unidades
    });
  } catch (error) {
    logger.error('Error al listar unidades de medida:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener unidades de medida',
      error: error.message
    });
  }
};

// Obtener todos los proveedores activos
const listarProveedores = async (req, res) => {
  try {
    const proveedores = await Proveedor.findAll({
      where: { estado: true },
      order: [['nombre', 'ASC']]
    });

    res.json({
      success: true,
      data: proveedores
    });
  } catch (error) {
    logger.error('Error al listar proveedores:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener proveedores',
      error: error.message
    });
  }
};

// Obtener todos los servicios activos
const listarServicios = async (req, res) => {
  try {
    const servicios = await Servicio.findAll({
      where: { estado: true },
      order: [['nombre_servicio', 'ASC']]
    });

    res.json({
      success: true,
      data: servicios
    });
  } catch (error) {
    logger.error('Error al listar servicios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicios',
      error: error.message
    });
  }
};

module.exports = {
  listarPresentaciones,
  listarUnidadesMedida,
  listarProveedores,
  listarServicios
};
