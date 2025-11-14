# Archivos Identificados en el Proyecto

## ✅ Archivos Necesarios

### Backend
- `src/` - Código fuente principal
- `package.json` - Dependencias
- `Dockerfile` - Configuración Docker
- `scripts/crear-usuario-admin.js` - Útil para crear admin
- `scripts/test-connection.js` - Útil para verificar conexión

### Frontend
- `src/` - Código fuente principal
- `package.json` - Dependencias
- `Dockerfile` - Configuración Docker
- `nginx.conf` - Configuración servidor web

### Raíz
- `farmacia_sistema_dinamico.sql` - Schema de BD (NECESARIO)
- `csv/` - Datos iniciales (NECESARIOS)
- `documentacion/` - Documentación (ÚTIL)

## ⚠️ Archivos Redundantes/Temporales

### Backend - Archivos de Prueba
Estos archivos fueron útiles durante el desarrollo pero NO son necesarios en producción:

1. **test-login.js** - Script de prueba de login (puede eliminarse)
2. **test-login-simple.js** - Versión simplificada (puede eliminarse)
3. **test-dashboard.js** - Script de prueba del dashboard (puede eliminarse)
4. **test-api-complete.js** - Pruebas completas de API (puede eliminarse)
5. **hashear-passwords.js** - Script para hashear contraseñas (puede moverse a scripts/)
6. **importar-datos.js** - Script de importación (puede moverse a scripts/)

### Recomendaciones

1. **Mantener para desarrollo local:**
   - Los archivos test-*.js pueden ser útiles para pruebas manuales
   - Considerar moverlos a una carpeta `backend/tests/` o `backend/dev-tools/`

2. **Mover a scripts/:**
   - `hashear-passwords.js` → `backend/scripts/hashear-passwords.js`
   - `importar-datos.js` → `backend/scripts/importar-datos.js`

3. **Excluir de Docker:**
   - Los archivos test-*.js no deben incluirse en la imagen Docker
   - Agregar a `.dockerignore`

## 📝 Acción Sugerida

```bash
# Crear carpeta de tests
mkdir backend/tests

# Mover archivos de prueba
mv backend/test-*.js backend/tests/

# Mover scripts de utilidad
mv backend/hashear-passwords.js backend/scripts/
mv backend/importar-datos.js backend/scripts/
```

## 🐳 Optimización Docker

Los siguientes archivos ya están excluidos del build de Docker mediante `.dockerignore`:
- node_modules/
- logs/
- *.log
- test-*.js
- .env

Esto reduce el tamaño de la imagen y mejora la seguridad.
