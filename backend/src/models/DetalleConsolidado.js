const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DetalleConsolidado = sequelize.define('detalle_consolidado', {
  id_detalle_consolidado: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_consolidado: {
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
  numero_cama: {
    type: DataTypes.STRING(10)
  },
  nombre_paciente: {
    type: DataTypes.STRING(200)
  },
  numero_registro: {
    type: DataTypes.STRING(50)
  },
  sexo: {
    type: DataTypes.STRING(1),
    allowNull: true,
    validate: {
      isIn: [['M', 'F']]
    }
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
    defaultValue: 0
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
  tableName: 'detalle_consolidado',
  timestamps: false
});

module.exports = DetalleConsolidado;
