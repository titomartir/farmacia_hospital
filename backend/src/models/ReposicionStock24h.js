const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ReposicionStock24h = sequelize.define('reposicion_stock_24h', {
  id_reposicion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_usuario_entrega: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_usuario_recibe: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_reposicion: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Fecha y hora de la reposición'
  },
  observaciones: {
    type: DataTypes.TEXT
  },
  estado: {
    type: DataTypes.STRING(20),
    defaultValue: 'completado'
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'reposicion_stock_24h',
  timestamps: false
});

module.exports = ReposicionStock24h;
