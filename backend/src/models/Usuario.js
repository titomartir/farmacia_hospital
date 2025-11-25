const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Usuario = sequelize.define('usuario', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_personal: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  nombre_usuario: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  contrasena: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM('administrador', 'farmaceutico', 'asistente', 'bodeguero', 'turnista'),
    defaultValue: 'asistente'
  },
  tipo_turno: {
    type: DataTypes.ENUM('24_horas', 'diurno', 'nocturno', 'administrativo'),
    allowNull: true
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  ultimo_login: {
    type: DataTypes.DATE
  },
  fecha_actualizacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'usuario',
  timestamps: false,
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.contrasena && !usuario.contrasena.startsWith('$2a$')) {
        usuario.contrasena = await bcrypt.hash(usuario.contrasena, 10);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('contrasena') && !usuario.contrasena.startsWith('$2a$')) {
        usuario.contrasena = await bcrypt.hash(usuario.contrasena, 10);
      }
    }
  }
});

// Método para comparar contraseñas
Usuario.prototype.compararPassword = async function(password) {
  // Si la contraseña en BD no está hasheada (texto plano)
  if (!this.contrasena.startsWith('$2a$')) {
    return password === this.contrasena;
  }
  // Si está hasheada, usar bcrypt
  return await bcrypt.compare(password, this.contrasena);
};

module.exports = Usuario;
