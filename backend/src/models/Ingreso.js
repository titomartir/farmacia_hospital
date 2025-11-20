const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ingreso = sequelize.define('ingreso', {
  id_ingreso: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_proveedor: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  numero_factura: {
    type: DataTypes.STRING(50)
  },
  fecha_ingreso: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Fecha y hora del ingreso de mercadería'
  },
  tipo_ingreso: {
    type: DataTypes.STRING(20),
    defaultValue: 'COMPRA',
    validate: {
      isIn: [['COMPRA', 'DONACION', 'TRANSFERENCIA', 'DEVOLUCION']]
    }
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  igv: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  observaciones: {
    type: DataTypes.TEXT
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'ingreso',
  timestamps: false
});

module.exports = Ingreso;
