const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DetalleReposicionStock = sequelize.define('detalle_reposicion_stock', {
  id_detalle_reposicion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_reposicion: {
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
  cantidad_debe_haber: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  cantidad_actual: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  cantidad_salio: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.cantidad_debe_haber - this.cantidad_actual;
    }
  },
  cantidad_reponer: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  observaciones: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'detalle_reposicion_stock',
  timestamps: false
});

module.exports = DetalleReposicionStock;
