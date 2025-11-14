const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InsumoPresentacion = sequelize.define('insumo_presentacion', {
  id_insumo_presentacion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_insumo: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_presentacion: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_unidad_medida: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cantidad_presentacion: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  codigo_barras: {
    type: DataTypes.STRING(50),
    unique: true
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
  tableName: 'insumo_presentacion',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id_insumo', 'id_presentacion', 'id_unidad_medida', 'cantidad_presentacion']
    }
  ]
});

module.exports = InsumoPresentacion;
