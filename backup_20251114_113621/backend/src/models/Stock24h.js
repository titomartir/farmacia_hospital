const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Stock24Horas = sequelize.define('stock_24_horas', {
  id_stock_24h: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_insumo_presentacion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  cantidad_fija: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  stock_actual: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  ultima_reposicion: {
    type: DataTypes.DATE
  },
  observaciones: {
    type: DataTypes.TEXT
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'stock_24_horas',
  timestamps: false
});

module.exports = Stock24Horas;
