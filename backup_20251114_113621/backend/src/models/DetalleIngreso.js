const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DetalleIngreso = sequelize.define('detalle_ingreso', {
  id_detalle_ingreso: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_ingreso: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_insumo_presentacion: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  lote: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  fecha_vencimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  subtotal: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.cantidad * this.precio_unitario;
    }
  },
  observaciones: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'detalle_ingreso',
  timestamps: false
});

module.exports = DetalleIngreso;
