const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TipoDocumento = sequelize.define('tipo_documento', {
  id_tipo_documento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_tipo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  requiere_aprobacion: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
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
  tableName: 'tipo_documento',
  timestamps: false
});

module.exports = TipoDocumento;
