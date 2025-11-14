module.exports = {
  // Roles del sistema
  ROLES: {
    ADMIN: 1,
    FARMACEUTICO: 2,
    TURNISTA: 3,
    BODEGUERO: 4
  },

  // Estados de documentos
  ESTADOS_DOCUMENTO: {
    PENDIENTE: 'Pendiente',
    APROBADO: 'Aprobado',
    RECHAZADO: 'Rechazado',
    COMPLETADO: 'Completado',
    CANCELADO: 'Cancelado'
  },

  // Tipos de movimiento
  TIPOS_MOVIMIENTO: {
    ENTRADA: 'Entrada',
    SALIDA: 'Salida',
    AJUSTE: 'Ajuste',
    DEVOLUCION: 'Devolución',
    TRANSFERENCIA: 'Transferencia'
  },

  // Turnos
  TURNOS: {
    TURNO_24H: '24 Horas (15:00 - 07:00)',
    TURNO_DIURNO: 'Diurno (08:00 - 14:00)'
  },

  // Niveles de alerta de stock
  ALERTAS_STOCK: {
    STOCK_BAJO: 0.30,    // 30%
    STOCK_CRITICO: 0.20, // 20%
    DIAS_VENCIMIENTO_ALERTA: 30,
    DIAS_VENCIMIENTO_CRITICO: 15
  },

  // Consolidado
  CONSOLIDADO: {
    MAX_CAMAS: 30
  },

  // Paginación
  PAGINACION: {
    LIMITE_DEFAULT: 10,
    LIMITE_MAX: 100
  },

  // Mensajes
  MENSAJES: {
    ERROR_GENERAL: 'Ha ocurrido un error. Por favor intente nuevamente.',
    NO_AUTORIZADO: 'No tiene autorización para realizar esta acción.',
    TOKEN_INVALIDO: 'Token inválido o expirado.',
    DATOS_INVALIDOS: 'Los datos proporcionados son inválidos.',
    REGISTRO_NO_ENCONTRADO: 'Registro no encontrado.',
    OPERACION_EXITOSA: 'Operación realizada exitosamente.',
    LOGIN_EXITOSO: 'Inicio de sesión exitoso.',
    LOGIN_FALLIDO: 'Usuario o contraseña incorrectos.'
  }
};
