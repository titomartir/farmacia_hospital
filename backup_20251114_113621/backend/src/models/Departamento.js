const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Departamento = sequelize.define('departamento', {
  id_departamento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_departamento: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'departamento',
  timestamps: false
});

module.exports = Departamento;
