const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Requisicion = sequelize.define('requisicion', {
  id_requisicion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_servicio: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_usuario_solicita: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_usuario_autoriza: {
    type: DataTypes.INTEGER
  },
  id_usuario_entrega: {
    type: DataTypes.INTEGER
  },
  fecha_solicitud: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Fecha y hora de creación de la requisición'
  },
  fecha_autorizacion: {
    type: DataTypes.DATE,
    comment: 'Fecha y hora de autorización'
  },
  fecha_entrega: {
    type: DataTypes.DATE,
    comment: 'Fecha y hora de entrega'
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'aprobada', 'entregada', 'rechazada', 'cancelada'),
    defaultValue: 'pendiente'
  },
  prioridad: {
    type: DataTypes.ENUM('urgente', 'normal', 'baja'),
    defaultValue: 'normal'
  },
  origen_despacho: {
    type: DataTypes.ENUM('general', 'stock_24h'),
    defaultValue: 'general',
    comment: 'Origen del despacho: general (bodega) o stock_24h (farmacia 24h)'
  },
  numero_cama: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Número o código de cama del paciente'
  },
  nombre_paciente: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Nombre completo del paciente'
  },
  observaciones: {
    type: DataTypes.TEXT
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'requisicion',
  timestamps: false
});

module.exports = Requisicion;
