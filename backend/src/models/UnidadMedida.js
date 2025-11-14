const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UnidadMedida = sequelize.define('unidad_medida', {
  id_unidad_medida: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  abreviatura: {
    type: DataTypes.STRING(10),
    allowNull: false,
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
  tableName: 'unidad_medida',
  timestamps: false
});

module.exports = UnidadMedida;
