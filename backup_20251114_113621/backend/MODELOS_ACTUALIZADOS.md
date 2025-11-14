# MODELOS ACTUALIZADOS - Esquema Real de Base de Datos

## ✅ Modelos Actualizados (12)

### 1. Usuario.js
- **Cambios**: 
  - Campo `contrasena` (varchar 255) en lugar de `password_hash`
  - Campo `rol` como ENUM (administrador, farmaceutico, asistente, bodeguero, turnista)
  - Campo `tipo_turno` como ENUM (24_horas, diurno, nocturno, administrativo)
  - Método `compararPassword()` maneja contraseñas plain text y hasheadas
  - `id_personal` FK única a tabla personal
  - Campo `estado` boolean en lugar de `activo`

### 2. Personal.js
- **Cambios**:
  - Campos `nombres` y `apellidos` separados (no `nombre_completo`)
  - Campo `dpi` en lugar de `cui`
  - Campo `cargo` en lugar de `puesto`
  - Campo `estado` boolean

### 3. Insumo.js
- **Cambios**:
  - Campo `nombre` único (no `nombre_generico` / `nombre_comercial`)
  - Nuevos campos: `stock_minimo`, `dias_alerta_vencimiento`, `requiere_stock_24h`
  - Campo `tipo_documento` como ENUM ('RECETA', 'REQUISICIÓN')
  - Campo `estado` boolean

### 4. Presentacion.js
- **Cambios**:
  - Campo `nombre` en lugar de `nombre_presentacion`
  - Campo `estado` boolean
  - Agregado `fecha_actualizacion`

### 5. UnidadMedida.js
- **Cambios**:
  - Campo `nombre` en lugar de `nombre_unidad`
  - Campo `abreviatura` único y requerido
  - Campo `estado` boolean
  - Removido campo `tipo`

### 6. InsumoPresentacion.js
- **Cambios**:
  - Campo `cantidad_presentacion` (decimal) requerido
  - Campo `precio_unitario` con default 0
  - Campo `codigo_barras` único
  - Removido campo `concentracion`
  - Index único compuesto: id_insumo + id_presentacion + id_unidad_medida + cantidad_presentacion

### 7. Proveedor.js
- **Cambios**:
  - Campo `nombre` en lugar de `nombre_proveedor`
  - Campo `estado` boolean
  - Agregado `fecha_actualizacion`

### 8. LoteInventario.js
- **Cambios**:
  - Campo `cantidad_actual` en lugar de `cantidad_disponible`
  - Campo `precio_lote` en lugar de `precio_unitario`
  - Campo `numero_lote` NO es único solo (index único compuesto con id_insumo_presentacion)
  - Agregado `id_proveedor` FK
  - Campo `estado` boolean
  - Removido `ubicacion_bodega`

### 9. Stock24h.js (Stock24Horas)
- **Cambios**:
  - Nombre tabla: `stock_24_horas` (no `stock_24h`)
  - Campo `stock_actual` en lugar de `cantidad_actual`
  - Campo `ultima_reposicion` en lugar de `fecha_ultima_reposicion`
  - Campo `estado` boolean
  - Removidos campos `fecha_creacion`, `fecha_actualizacion`

### 10. Servicio.js
- **Cambios**:
  - Campo `nombre_servicio` (varchar 100) único
  - Nuevos campos: `requiere_stock_24h`, `numero_camas`
  - Campo `estado` boolean
  - Agregado `descripcion`, `fecha_actualizacion`
  - Removidos `codigo_servicio`, `id_departamento`

### 11. Ingreso.js
- **Cambios**:
  - Campos requeridos: `id_proveedor`, `id_usuario`, `fecha_ingreso`
  - Campo `tipo_ingreso` como CHECK ('COMPRA', 'DEVOLUCION')
  - Campos calculados: `subtotal`, `igv`, `total`
  - Removidos `id_tipo_documento`, `id_personal_recibe`, `estado`

### 12. DetalleIngreso.js
- **Cambios**:
  - Campo `id_insumo_presentacion` en lugar de `id_lote`
  - Campos `lote` (varchar 50) y `fecha_vencimiento` directos
  - Campo `subtotal` como VIRTUAL calculado
  - Campo `precio_unitario` requerido
  - Removido `costo_unitario`

## 📝 Asociaciones Configuradas

```javascript
// Usuario ↔ Personal (1:1)
Usuario.belongsTo(Personal, { foreignKey: 'id_personal', as: 'personal' });
Personal.hasOne(Usuario, { foreignKey: 'id_personal', as: 'usuario' });

// Insumo → InsumoPresentacion ← Presentacion, UnidadMedida
Insumo.hasMany(InsumoPresentacion, { foreignKey: 'id_insumo', as: 'presentaciones' });
Presentacion.hasMany(InsumoPresentacion, { foreignKey: 'id_presentacion', as: 'insumos' });
UnidadMedida.hasMany(InsumoPresentacion, { foreignKey: 'id_unidad_medida', as: 'insumos' });

// InsumoPresentacion ↔ LoteInventario
InsumoPresentacion.hasMany(LoteInventario, { foreignKey: 'id_insumo_presentacion', as: 'lotes' });

// Proveedor ↔ LoteInventario
Proveedor.hasMany(LoteInventario, { foreignKey: 'id_proveedor', as: 'lotes' });

// InsumoPresentacion ↔ Stock24Horas (1:1)
InsumoPresentacion.hasOne(Stock24Horas, { foreignKey: 'id_insumo_presentacion', as: 'stock24h' });

// Proveedor, Usuario → Ingreso ← DetalleIngreso ← InsumoPresentacion
```

## 🗑️ Archivos Eliminados
- `Rol.js` - No existe tabla separada, `rol` es ENUM en tabla usuario

## ⏭️ Modelos Pendientes (aún no creados/actualizados)
Estos existen en la BD pero no están creados/actualizados:
- Consolidado
- DetalleConsolidado
- Requisicion
- DetalleRequisicion
- ReposicionStock24h
- DetalleReposicionStock
- HistorialMovimientos

## 🔐 Autenticación Actualizada
- `authController.js` ahora usa campo `contrasena`
- Maneja contraseñas plain text existentes ("usuario")
- Hook beforeUpdate/beforeCreate hashea nuevas contraseñas con bcrypt
- Método `compararPassword()` detecta si es plain text o hash

## ✅ Verificación
```bash
$ node -e "const db = require('./src/models'); console.log(Object.keys(db).join(', '));"
# Resultado: Usuario, Personal, Insumo, Presentacion, UnidadMedida, InsumoPresentacion, 
#            Proveedor, LoteInventario, Stock24Horas, Servicio, Ingreso, DetalleIngreso
```

## 📊 Estado Base de Datos
- PostgreSQL 16 en Docker (puerto 5433)
- Database: `farmacia_dinamica`
- Usuario: `farmacia_admin`
- 19 tablas existentes con datos reales
- Usuarios con contraseña plain text: "usuario"

## 🎯 Próximos Pasos
1. ✅ Crear script para hashear contraseñas existentes
2. ✅ Hashear las 21 contraseñas de usuarios
3. ✅ Probar login con nuevo authController - **FUNCIONA PERFECTAMENTE**
4. ⏳ Instalar dependencias frontend (en proceso)
5. ⏳ Crear modelos restantes (Consolidado, Requisicion, ReposicionStock24h, etc.)
6. ⏳ Actualizar `insumoController` y `dashboardController`

## ✅ Prueba de Login Exitosa

```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id_usuario": 1,
      "nombre_usuario": "ANA LILYAN",
      "rol": "farmaceutico",
      "tipo_turno": "diurno",
      "personal": {
        "nombres": "ANA LILYAN",
        "apellidos": "SOTO ARÉVALO DE SAPÓN",
        "email": "liliansoto520@gmail.com",
        "cargo": "AUXILIAR DE FARMACIA"
      }
    }
  }
}
```

**Usuario de prueba**: ANA LILYAN  
**Contraseña**: usuario  
**Estado**: ✅ Autenticación funcionando con JWT
