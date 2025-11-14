const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LoteInventario = sequelize.define('lote_inventario', {
  id_lote: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_insumo_presentacion: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  numero_lote: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  fecha_vencimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  cantidad_actual: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  precio_lote: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  fecha_ingreso: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  id_proveedor: {
    type: DataTypes.INTEGER
  },
  observaciones: {
    type: DataTypes.TEXT
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'lote_inventario',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id_insumo_presentacion', 'numero_lote']
    }
  ]
});

module.exports = LoteInventario;
