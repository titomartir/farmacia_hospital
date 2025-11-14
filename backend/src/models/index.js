const { sequelize } = require('../config/database');

// Importar modelos
const Usuario = require('./Usuario');
const Personal = require('./Personal');
const Insumo = require('./Insumo');
const Presentacion = require('./Presentacion');
const UnidadMedida = require('./UnidadMedida');
const InsumoPresentacion = require('./InsumoPresentacion');
const Proveedor = require('./Proveedor');
const LoteInventario = require('./LoteInventario');
const Stock24Horas = require('./Stock24h');
const Servicio = require('./Servicio');
const Ingreso = require('./Ingreso');
const DetalleIngreso = require('./DetalleIngreso');
const Consolidado = require('./Consolidado');
const DetalleConsolidado = require('./DetalleConsolidado');
const Requisicion = require('./Requisicion');
const DetalleRequisicion = require('./DetalleRequisicion');
const ReposicionStock24h = require('./ReposicionStock24h');
const DetalleReposicionStock = require('./DetalleReposicionStock');
const CuadreStock24h = require('./CuadreStock24h');
const DetalleCuadreStock24h = require('./DetalleCuadreStock24h');
const HistorialMovimientos = require('./HistorialMovimientos');

// Usuario - Personal
Usuario.belongsTo(Personal, { foreignKey: 'id_personal', as: 'personal' });
Personal.hasOne(Usuario, { foreignKey: 'id_personal', as: 'usuario' });

// Insumo - Presentación
Insumo.hasMany(InsumoPresentacion, { foreignKey: 'id_insumo', as: 'presentaciones' });
InsumoPresentacion.belongsTo(Insumo, { foreignKey: 'id_insumo', as: 'insumo' });

Presentacion.hasMany(InsumoPresentacion, { foreignKey: 'id_presentacion', as: 'insumos' });
InsumoPresentacion.belongsTo(Presentacion, { foreignKey: 'id_presentacion', as: 'presentacion' });

UnidadMedida.hasMany(InsumoPresentacion, { foreignKey: 'id_unidad_medida', as: 'insumos' });
InsumoPresentacion.belongsTo(UnidadMedida, { foreignKey: 'id_unidad_medida', as: 'unidadMedida' });

// Lotes
InsumoPresentacion.hasMany(LoteInventario, { foreignKey: 'id_insumo_presentacion', as: 'lotes' });
LoteInventario.belongsTo(InsumoPresentacion, { foreignKey: 'id_insumo_presentacion', as: 'insumoPresentacion' });

Proveedor.hasMany(LoteInventario, { foreignKey: 'id_proveedor', as: 'lotes' });
LoteInventario.belongsTo(Proveedor, { foreignKey: 'id_proveedor', as: 'proveedor' });

// Stock 24h
InsumoPresentacion.hasOne(Stock24Horas, { foreignKey: 'id_insumo_presentacion', as: 'stock24h' });
Stock24Horas.belongsTo(InsumoPresentacion, { foreignKey: 'id_insumo_presentacion', as: 'insumoPresentacion' });

// Ingreso
Proveedor.hasMany(Ingreso, { foreignKey: 'id_proveedor', as: 'ingresos' });
Ingreso.belongsTo(Proveedor, { foreignKey: 'id_proveedor', as: 'proveedor' });

Usuario.hasMany(Ingreso, { foreignKey: 'id_usuario', as: 'ingresos' });
Ingreso.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

Ingreso.hasMany(DetalleIngreso, { foreignKey: 'id_ingreso', as: 'detalles' });
DetalleIngreso.belongsTo(Ingreso, { foreignKey: 'id_ingreso', as: 'ingreso' });

InsumoPresentacion.hasMany(DetalleIngreso, { foreignKey: 'id_insumo_presentacion', as: 'detallesIngreso' });
DetalleIngreso.belongsTo(InsumoPresentacion, { foreignKey: 'id_insumo_presentacion', as: 'insumoPresentacion' });

// Consolidado
Usuario.hasMany(Consolidado, { foreignKey: 'id_usuario', as: 'consolidados' });
Consolidado.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

Servicio.hasMany(Consolidado, { foreignKey: 'id_servicio', as: 'consolidados' });
Consolidado.belongsTo(Servicio, { foreignKey: 'id_servicio', as: 'servicio' });

Consolidado.hasMany(DetalleConsolidado, { foreignKey: 'id_consolidado', as: 'detalles' });
DetalleConsolidado.belongsTo(Consolidado, { foreignKey: 'id_consolidado', as: 'consolidado' });

InsumoPresentacion.hasMany(DetalleConsolidado, { foreignKey: 'id_insumo_presentacion', as: 'detallesConsolidado' });
DetalleConsolidado.belongsTo(InsumoPresentacion, { foreignKey: 'id_insumo_presentacion', as: 'insumoPresentacion' });

LoteInventario.hasMany(DetalleConsolidado, { foreignKey: 'id_lote', as: 'detallesConsolidado' });
DetalleConsolidado.belongsTo(LoteInventario, { foreignKey: 'id_lote', as: 'lote' });

// Requisicion
Servicio.hasMany(Requisicion, { foreignKey: 'id_servicio', as: 'requisiciones' });
Requisicion.belongsTo(Servicio, { foreignKey: 'id_servicio', as: 'servicio' });

Usuario.hasMany(Requisicion, { foreignKey: 'id_usuario_solicita', as: 'requisicionesSolicitadas' });
Requisicion.belongsTo(Usuario, { foreignKey: 'id_usuario_solicita', as: 'usuarioSolicita' });

Usuario.hasMany(Requisicion, { foreignKey: 'id_usuario_autoriza', as: 'requisicionesAutorizadas' });
Requisicion.belongsTo(Usuario, { foreignKey: 'id_usuario_autoriza', as: 'usuarioAutoriza' });

Usuario.hasMany(Requisicion, { foreignKey: 'id_usuario_entrega', as: 'requisicionesEntregadas' });
Requisicion.belongsTo(Usuario, { foreignKey: 'id_usuario_entrega', as: 'usuarioEntrega' });

Requisicion.hasMany(DetalleRequisicion, { foreignKey: 'id_requisicion', as: 'detalles' });
DetalleRequisicion.belongsTo(Requisicion, { foreignKey: 'id_requisicion', as: 'requisicion' });

InsumoPresentacion.hasMany(DetalleRequisicion, { foreignKey: 'id_insumo_presentacion', as: 'detallesRequisicion' });
DetalleRequisicion.belongsTo(InsumoPresentacion, { foreignKey: 'id_insumo_presentacion', as: 'insumoPresentacion' });

LoteInventario.hasMany(DetalleRequisicion, { foreignKey: 'id_lote', as: 'detallesRequisicion' });
DetalleRequisicion.belongsTo(LoteInventario, { foreignKey: 'id_lote', as: 'lote' });

// Reposicion Stock 24h
Usuario.hasMany(ReposicionStock24h, { foreignKey: 'id_usuario_entrega', as: 'reposicionesEntregadas' });
ReposicionStock24h.belongsTo(Usuario, { foreignKey: 'id_usuario_entrega', as: 'usuarioEntrega' });

Usuario.hasMany(ReposicionStock24h, { foreignKey: 'id_usuario_recibe', as: 'reposicionesRecibidas' });
ReposicionStock24h.belongsTo(Usuario, { foreignKey: 'id_usuario_recibe', as: 'usuarioRecibe' });

ReposicionStock24h.hasMany(DetalleReposicionStock, { foreignKey: 'id_reposicion', as: 'detalles' });
DetalleReposicionStock.belongsTo(ReposicionStock24h, { foreignKey: 'id_reposicion', as: 'reposicion' });

InsumoPresentacion.hasMany(DetalleReposicionStock, { foreignKey: 'id_insumo_presentacion', as: 'detallesReposicion' });
DetalleReposicionStock.belongsTo(InsumoPresentacion, { foreignKey: 'id_insumo_presentacion', as: 'insumoPresentacion' });

LoteInventario.hasMany(DetalleReposicionStock, { foreignKey: 'id_lote', as: 'detallesReposicion' });
DetalleReposicionStock.belongsTo(LoteInventario, { foreignKey: 'id_lote', as: 'lote' });

// Historial Movimientos
InsumoPresentacion.hasMany(HistorialMovimientos, { foreignKey: 'id_insumo_presentacion', as: 'movimientos' });
HistorialMovimientos.belongsTo(InsumoPresentacion, { foreignKey: 'id_insumo_presentacion', as: 'insumoPresentacion' });

LoteInventario.hasMany(HistorialMovimientos, { foreignKey: 'id_lote', as: 'movimientos' });
HistorialMovimientos.belongsTo(LoteInventario, { foreignKey: 'id_lote', as: 'lote' });

Usuario.hasMany(HistorialMovimientos, { foreignKey: 'id_usuario', as: 'movimientos' });
HistorialMovimientos.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

Servicio.hasMany(HistorialMovimientos, { foreignKey: 'id_servicio', as: 'movimientos' });
HistorialMovimientos.belongsTo(Servicio, { foreignKey: 'id_servicio', as: 'servicio' });

// Cuadre Stock 24h
Personal.hasMany(CuadreStock24h, { foreignKey: 'id_personal_turnista', as: 'cuadresComTurnista' });
CuadreStock24h.belongsTo(Personal, { foreignKey: 'id_personal_turnista', as: 'turnista' });

Personal.hasMany(CuadreStock24h, { foreignKey: 'id_personal_bodeguero', as: 'cuadresComoBodeguero' });
CuadreStock24h.belongsTo(Personal, { foreignKey: 'id_personal_bodeguero', as: 'bodeguero' });

CuadreStock24h.hasMany(DetalleCuadreStock24h, { foreignKey: 'id_cuadre_stock', as: 'detalles' });
DetalleCuadreStock24h.belongsTo(CuadreStock24h, { foreignKey: 'id_cuadre_stock', as: 'cuadre' });

InsumoPresentacion.hasMany(DetalleCuadreStock24h, { foreignKey: 'id_insumo_presentacion', as: 'detallesCuadre' });
DetalleCuadreStock24h.belongsTo(InsumoPresentacion, { foreignKey: 'id_insumo_presentacion', as: 'insumoPresentacion' });

module.exports = {
  sequelize,
  Usuario,
  Personal,
  Insumo,
  Presentacion,
  UnidadMedida,
  InsumoPresentacion,
  Proveedor,
  LoteInventario,
  Stock24Horas,
  Servicio,
  Ingreso,
  DetalleIngreso,
  Consolidado,
  DetalleConsolidado,
  Requisicion,
  DetalleRequisicion,
  ReposicionStock24h,
  DetalleReposicionStock,
  CuadreStock24h,
  DetalleCuadreStock24h,
  HistorialMovimientos
};