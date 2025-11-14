const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AlertaStock = sequelize.define('alerta_stock', {
  id_alerta: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo_alerta: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  id_lote: {
    type: DataTypes.INTEGER
  },
  id_insumo_presentacion: {
    type: DataTypes.INTEGER
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  nivel_criticidad: {
    type: DataTypes.STRING(20),
    defaultValue: 'Media'
  },
  leida: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_lectura: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'alerta_stock',
  timestamps: false
});

module.exports = AlertaStock;
