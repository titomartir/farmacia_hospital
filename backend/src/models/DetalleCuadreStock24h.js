const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DetalleCuadreStock24h = sequelize.define('detalle_cuadre_stock_24h', {
  id_detalle_cuadre: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_cuadre_stock: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_insumo_presentacion: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cantidad_teorica: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  cantidad_fisica: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true // Permitir null hasta que se registre el conteo
  },
  diferencia: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true // Permitir null hasta que se registre el conteo
  },
  observaciones: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'detalle_cuadre_stock_24h',
  timestamps: false
});

module.exports = DetalleCuadreStock24h;
