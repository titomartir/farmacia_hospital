const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Servicio = sequelize.define('servicio', {
  id_servicio: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_servicio: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  requiere_stock_24h: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  numero_camas: {
    type: DataTypes.INTEGER,
    defaultValue: 0
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
  tableName: 'servicio',
  timestamps: false
});

module.exports = Servicio;
