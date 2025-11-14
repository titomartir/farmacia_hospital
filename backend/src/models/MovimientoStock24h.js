const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MovimientoStock24h = sequelize.define('movimiento_stock_24h', {
  id_movimiento_stock: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_stock_24h: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tipo_movimiento: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  cantidad: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  cantidad_anterior: {
    type: DataTypes.DECIMAL(10, 2)
  },
  cantidad_nueva: {
    type: DataTypes.DECIMAL(10, 2)
  },
  id_lote: {
    type: DataTypes.INTEGER
  },
  id_personal: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  observaciones: {
    type: DataTypes.TEXT
  },
  fecha_movimiento: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'movimiento_stock_24h',
  timestamps: false
});

module.exports = MovimientoStock24h;
