const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Insumo = sequelize.define('insumo', {
  id_insumo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  stock_minimo: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  dias_alerta_vencimiento: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  requiere_stock_24h: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  tipo_documento: {
    type: DataTypes.ENUM('RECETA', 'REQUISICIÓN'),
    defaultValue: 'RECETA'
  },
  clasificacion: {
    type: DataTypes.ENUM('vih', 'metodo_anticonceptivo', 'listado_basico'),
    defaultValue: 'listado_basico',
    allowNull: false,
    comment: 'Clasificación principal del medicamento'
  },
  subclasificacion: {
    type: DataTypes.ENUM('requisicion', 'receta'),
    allowNull: true,
    comment: 'Subclasificación del medicamento'
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_actualizacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'insumo',
  timestamps: false
});

module.exports = Insumo;
