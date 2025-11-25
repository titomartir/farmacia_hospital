const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DetalleRequisicion = sequelize.define('detalle_requisicion', {
  id_detalle_requisicion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_requisicion: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_insumo_presentacion: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_lote: {
    type: DataTypes.INTEGER
  },
  cantidad_solicitada: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  cantidad_autorizada: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  cantidad_entregada: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  numero_cama: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  numero_expediente: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  nombre_paciente: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  sexo: {
    type: DataTypes.CHAR(1),
    allowNull: true,
    validate: {
      isIn: [['M', 'H']]
    }
  },
  observaciones: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'detalle_requisicion',
  timestamps: false
});

module.exports = DetalleRequisicion;
