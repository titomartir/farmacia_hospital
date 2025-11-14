# 🏥 Sistema de Farmacia - Guía de Inicio Rápido

## ✅ Estado del Sistema

### Contenedores Activos
- 🗄️ **Base de Datos PostgreSQL** - Puerto 5432 ✓
- 🔧 **Backend API** - Puerto 3000 ✓
- 🌐 **Frontend React** - Puerto 5173 ✓

### Datos Precargados

La base de datos ya tiene los siguientes catálogos cargados:

| Tabla | Registros | Descripción |
|-------|-----------|-------------|
| **Unidades de Medida** | 11 | ml, g, mg, L, etc. |
| **Presentaciones** | 22 | Frasco, Ampolla, Tableta, etc. |
| **Proveedores** | 4 | Proveedores del hospital |
| **Servicios** | 12 | Emergencia, UCI, Pediatría, etc. |
| **Personal** | 25 | Personal del hospital |
| **Usuarios** | 4 | Usuarios del sistema |
| **Insumos** | 0 | ⚠️ **Se registran dinámicamente** |

## 📝 IMPORTANTE: Registro Dinámico de Medicamentos

**Los medicamentos NO están precargados** - esto es intencional y es una de las características principales del sistema.

### ¿Cómo funciona?

1. **Primer Ingreso**: Cuando registras una compra o devolución, si el medicamento no existe, el sistema te permite registrarlo en ese momento.

2. **Datos Requeridos**:
   - Nombre del medicamento
   - Presentación (Frasco, Ampolla, etc.)
   - Unidad de medida (ml, g, mg, etc.)
   - Cantidad de presentación
   - Stock mínimo (opcional)
   - Si requiere stock de 24 horas

3. **Beneficios**:
   - ✅ No necesitas mantener un catálogo gigante
   - ✅ Solo registras lo que realmente usas
   - ✅ Mayor flexibilidad
   - ✅ Menos datos obsoletos

### Ejemplo de Primer Ingreso

```
Paso 1: Ir a "Ingresos" > "Nuevo Ingreso"
Paso 2: Seleccionar proveedor y fecha
Paso 3: Al agregar un medicamento:
   - Si existe → Seleccionas de la lista
   - Si NO existe → Click en "Registrar Nuevo Medicamento"
      • Nombre: Acetaminofén 500mg
      • Presentación: Tableta
      • Unidad: mg
      • Cantidad: 500
      • Stock mínimo: 100
Paso 4: Completar lote, cantidad, precio
Paso 5: Guardar ingreso
```

## 🚀 Acceso al Sistema

### URLs de Acceso

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Base de Datos**: localhost:5432

### Credenciales de Prueba

**Administrador:**
- Usuario: `admin`
- Contraseña: `admin`

**Farmacéutico:**
- Usuario: `ANA LILYAN`
- Contraseña: `usuario`

**Bodeguero:**
- Usuario: `DEYSI NATIVIDAD SUSANA`
- Contraseña: `usuario`

## 🔄 Comandos Útiles

### Ver estado de contenedores
```powershell
docker-compose ps
```

### Ver logs
```powershell
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo base de datos
docker-compose logs -f db
```

### Reiniciar servicios
```powershell
docker-compose restart
```

### Detener todo
```powershell
docker-compose down
```

### Iniciar todo
```powershell
docker-compose up -d
```

## 📊 Verificar Base de Datos

Puedes conectarte directamente a la base de datos:

```powershell
docker-compose exec db psql -U postgres -d farmacia_dinamica
```

Consultas útiles:
```sql
-- Ver estadísticas
SELECT 'Insumos' as tabla, COUNT(*) FROM insumo
UNION ALL SELECT 'Stock 24h', COUNT(*) FROM stock_24_horas
UNION ALL SELECT 'Lotes', COUNT(*) FROM lote_inventario;

-- Ver usuarios
SELECT nombre_usuario, rol, tipo_turno FROM usuario WHERE estado = true;

-- Ver servicios
SELECT nombre_servicio, numero_camas, requiere_stock_24h FROM servicio WHERE estado = true;
```

## 🎯 Próximos Pasos

1. **Accede al sistema**: http://localhost:5173
2. **Inicia sesión** con el usuario admin
3. **Registra tu primer ingreso** de medicamentos
4. **Configura el stock de 24 horas** para los medicamentos de turno nocturno
5. **Crea requisiciones** para los servicios
6. **Genera reportes** de movimientos

## ⚠️ Notas Importantes

- Las contraseñas predeterminadas son `admin` y `usuario` - **cámbialas en producción**
- El sistema está en modo desarrollo
- Los logs se guardan en `backend/logs/`
- Para producción, actualiza las variables en `.env`

## 🐛 Solución de Problemas

### Frontend no carga
```powershell
docker-compose restart frontend
docker-compose logs frontend
```

### Backend no conecta
```powershell
docker-compose restart backend
docker-compose logs backend
```

### Base de datos no responde
```powershell
docker-compose restart db
docker-compose logs db
```

---

**¿Necesitas ayuda?** Revisa los logs con `docker-compose logs -f` para ver errores en tiempo real.
