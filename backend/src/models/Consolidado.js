const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Consolidado = sequelize.define('consolidado', {
  id_consolidado: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_servicio: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_consolidado: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Fecha y hora del consolidado (turno específico)'
  },
  turno: {
    type: DataTypes.ENUM('24_horas', 'diurno', 'nocturno', 'administrativo'),
    allowNull: false
  },
  total_medicamentos: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  costo_total: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  observaciones: {
    type: DataTypes.TEXT
  },
  estado: {
    type: DataTypes.STRING(20),
    defaultValue: 'activo',
    validate: {
      isIn: [['activo', 'cerrado', 'anulado']]
    }
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_cierre: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'consolidado',
  timestamps: false
});

module.exports = Consolidado;
