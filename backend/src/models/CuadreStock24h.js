const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CuadreStock24h = sequelize.define('cuadre_stock_24h', {
  id_cuadre_stock: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_cuadre: {
    type: DataTypes.STRING(100),
    unique: true
  },
  fecha_cuadre: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  id_personal_turnista: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_personal_bodeguero: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  observaciones: {
    type: DataTypes.TEXT
  },
  estado: {
    type: DataTypes.STRING(50),
    defaultValue: 'Completado'
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'cuadre_stock_24h',
  timestamps: false
});

module.exports = CuadreStock24h;
