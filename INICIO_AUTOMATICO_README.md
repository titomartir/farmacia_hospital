# 🏥 Sistema de Farmacia Hospitalaria - Inicio Automático

## 📋 Descripción

Scripts para automatizar completamente el inicio y detención del Sistema de Farmacia Hospitalaria.

## 🚀 Configuración Inicial (Una sola vez)

### Paso 1: Ejecutar configuración

Haga doble clic en el archivo:
```
configurar-inicio-automatico.ps1
```

**O** ejecute desde PowerShell:
```powershell
cd C:\farmacia_hospital
.\configurar-inicio-automatico.ps1
```

### Paso 2: Configurar Docker Desktop

Para que el sistema funcione automáticamente al iniciar Windows:

1. Abrir **Docker Desktop**
2. Ir a **Settings** (⚙️ esquina superior derecha)
3. En la sección **General**, activar:
   - ☑️ **Start Docker Desktop when you log in**
4. Clic en **Apply & Restart**

## 📦 Archivos Creados

Después de ejecutar la configuración, tendrás:

### En el Escritorio:
- 🟢 **Farmacia Hospital - Iniciar Sistema.lnk** → Inicia todos los servicios
- 🔴 **Farmacia Hospital - Detener Sistema.lnk** → Detiene todos los servicios

### En C:\farmacia_hospital:
- `iniciar-sistema.ps1` → Script principal de inicio
- `detener-sistema.ps1` → Script para detener servicios
- `configurar-inicio-automatico.ps1` → Configurador
- `tarea-inicio-automatico.xml` → Definición de tarea programada

### En el Programador de Tareas de Windows:
- **FarmaciaHospital_AutoInicio** → Tarea que se ejecuta al iniciar sesión

## 🎯 Uso Diario

### Opción 1: Inicio Automático (Recomendado)
Si configuraste la tarea programada como Administrador:
1. Iniciar sesión en Windows
2. Esperar 30 segundos
3. ✅ El sistema se inicia automáticamente

### Opción 2: Inicio Manual
Doble clic en el acceso directo del escritorio:
- 🟢 **Farmacia Hospital - Iniciar Sistema**

### Detener el Sistema
Doble clic en:
- 🔴 **Farmacia Hospital - Detener Sistema**

## 📊 ¿Qué Inicia Automáticamente?

El script `iniciar-sistema.ps1` realiza:

1. ✅ **Verifica Docker** (Desktop debe estar corriendo)
2. ✅ **Inicia PostgreSQL** (contenedor Docker)
3. ✅ **Inicia Backend API** (contenedor Docker, puerto 3000)
4. ✅ **Espera a que servicios estén saludables**
5. ✅ **Inicia Frontend** (Vite dev server, puerto 5173/5174)

### Servicios Disponibles:
- 🗄️ **PostgreSQL**: `localhost:5432`
- 🔌 **Backend API**: `http://localhost:3000`
- 🌐 **Frontend**: `http://localhost:5173` o `http://localhost:5174`

### Credenciales de Prueba:
```
Usuario: ANA MERCEDES
Contraseña: usuario
```

## 🔧 Solución de Problemas

### El sistema no inicia automáticamente

1. **Verificar Docker Desktop**:
   ```powershell
   docker --version
   docker ps
   ```

2. **Verificar tarea programada**:
   - Presionar `Win + R`
   - Escribir: `taskschd.msc`
   - Buscar: `FarmaciaHospital_AutoInicio`
   - Verificar que esté **Habilitada**

3. **Ver logs de la tarea**:
   - En Programador de tareas → Clic derecho en la tarea → Historial

### Error "No se puede ejecutar scripts"

Si aparece error de política de ejecución:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Puerto en uso

Si el frontend no inicia por puerto ocupado:
```powershell
# Ver qué proceso usa el puerto 5174
Get-NetTCPConnection -LocalPort 5174 | Select-Object OwningProcess

# Matar el proceso (reemplazar XXXX con el PID)
Stop-Process -Id XXXX -Force
```

### Reiniciar servicios manualmente

```powershell
# Detener
cd C:\farmacia_hospital
.\detener-sistema.ps1

# Esperar 10 segundos

# Iniciar
.\iniciar-sistema.ps1
```

## 🛑 Deshabilitar Inicio Automático

### Método 1: Desde Programador de Tareas
1. `Win + R` → `taskschd.msc`
2. Buscar: `FarmaciaHospital_AutoInicio`
3. Clic derecho → **Deshabilitar** o **Eliminar**

### Método 2: Desde PowerShell (como Admin)
```powershell
Unregister-ScheduledTask -TaskName "FarmaciaHospital_AutoInicio" -Confirm:$false
```

## 📝 Notas Importantes

- ⚠️ **Docker Desktop debe estar configurado para inicio automático**
- ⚠️ El frontend se abrirá en una **nueva ventana de PowerShell**
- ⚠️ No cerrar la ventana del frontend mientras uses el sistema
- ✅ Los contenedores Docker se mantienen corriendo en segundo plano
- ✅ Puedes cerrar y reabrir el navegador sin afectar los servicios

## 🔄 Actualizar Scripts

Si se actualizan los scripts, solo necesitas:

1. Copiar los nuevos archivos `.ps1`
2. Si cambiaste la ubicación, ejecutar de nuevo:
   ```powershell
   .\configurar-inicio-automatico.ps1
   ```

## 📚 Scripts Disponibles

| Script | Descripción | Requiere Admin |
|--------|-------------|----------------|
| `iniciar-sistema.ps1` | Inicia todos los servicios | No |
| `detener-sistema.ps1` | Detiene todos los servicios | No |
| `configurar-inicio-automatico.ps1` | Configura inicio automático | Sí (para tarea programada) |

## ✅ Checklist de Configuración

- [ ] Docker Desktop instalado
- [ ] Docker configurado para inicio automático
- [ ] Ejecutado `configurar-inicio-automatico.ps1` como Admin
- [ ] Accesos directos creados en el escritorio
- [ ] Tarea programada creada y habilitada
- [ ] Sistema probado al menos una vez manualmente

## 🆘 Soporte

Si tienes problemas:

1. Ejecutar `.\iniciar-sistema.ps1` manualmente
2. Revisar mensajes de error en la ventana
3. Verificar que Docker Desktop esté corriendo
4. Reiniciar la computadora y probar de nuevo

---

**Versión**: 1.0  
**Fecha**: Noviembre 2025  
**Sistema**: Farmacia Hospitalaria
