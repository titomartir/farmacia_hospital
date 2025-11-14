const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HistorialMovimientos = sequelize.define('historial_movimientos', {
  id_movimiento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_insumo_presentacion: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_lote: {
    type: DataTypes.INTEGER
  },
  tipo_movimiento: {
    type: DataTypes.ENUM('entrada', 'salida', 'ajuste', 'traslado'),
    allowNull: false
  },
  origen_movimiento: {
    type: DataTypes.ENUM(
      'ingreso_compra',
      'ingreso_devolucion',
      'salida_consolidado',
      'salida_requisicion',
      'reposicion_stock',
      'ajuste_inventario',
      'transferencia'
    ),
    allowNull: false
  },
  cantidad: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_servicio: {
    type: DataTypes.INTEGER
  },
  referencia_id: {
    type: DataTypes.INTEGER
  },
  referencia_tabla: {
    type: DataTypes.STRING(50)
  },
  observaciones: {
    type: DataTypes.TEXT
  },
  fecha_movimiento: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'historial_movimientos',
  timestamps: false
});

module.exports = HistorialMovimientos;
