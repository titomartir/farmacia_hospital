# 🐳 Arquitectura Docker del Sistema de Farmacia Hospitalaria

## Resumen Ejecutivo

El proyecto está completamente containerizado utilizando Docker Compose con una arquitectura de **3 contenedores separados** que facilitan el desarrollo, mantenimiento y despliegue del sistema.

---

## 🏗️ Arquitectura de Contenedores

### **1. 📦 Contenedor `farmacia_db` (Base de Datos)**

**Configuración:**
- **Imagen**: `postgres:15-alpine` (ligera y optimizada)
- **Nombre**: `farmacia_db`
- **Puerto**: `5432`
- **Reinicio**: `unless-stopped` (recuperación automática)

**Función:**
- Almacena todos los datos del sistema de farmacia
- Base de datos PostgreSQL con encoding UTF-8
- Gestión de usuarios, insumos, stock, requisiciones, consolidados

**Persistencia:**
- **Volume**: `farmacia_postgres_data` - Los datos sobreviven al reinicio de contenedores
- **Bind Mounts**:
  - `./farmacia_sistema_dinamico.sql` → Schema e inicialización
  - `./scripts/init-db.sh` → Scripts de inicialización
  - `./csv` → Datos CSV para importación inicial

**Variables de Entorno:**
```env
POSTGRES_DB=farmacia_dinamica
POSTGRES_USER=postgres
POSTGRES_PASSWORD=tito
POSTGRES_INITDB_ARGS=-E UTF8
```

**Health Check:**
```yaml
test: pg_isready -U postgres -d farmacia_dinamica
interval: 10s
timeout: 5s
retries: 5
```

---

### **2. 🔧 Contenedor `farmacia_backend` (API REST)**

**Configuración:**
- **Tecnología**: Node.js v20 + Express
- **Nombre**: `farmacia_backend`
- **Puerto**: `3000`
- **Dockerfile**: `./backend/Dockerfile`

**Función:**
- API REST con endpoints para todos los módulos
- Lógica de negocio y validaciones
- Autenticación JWT con bcrypt
- Rate limiting (1000 req/min)
- Manejo de errores centralizado

**Hot-Reload (Desarrollo):**
- **Volume**: `./backend/src:/app/src` - Cambios instantáneos sin rebuild
- **Logs**: `./backend/logs:/app/logs` - Persistencia de logs
- **CSV**: `./csv:/app/csv` - Acceso a datos de importación

**Variables de Entorno:**
```env
NODE_ENV=development
PORT=3000
DB_HOST=db
DB_PORT=5432
DB_NAME=farmacia_dinamica
DB_USER=postgres
DB_PASSWORD=tito
JWT_SECRET=farmacia_secret_key_2024
JWT_EXPIRES_IN=24h
```

**Health Check:**
```yaml
test: wget --spider http://localhost:3000/api/health
interval: 30s
timeout: 10s
retries: 3
```

**Dependencias:**
- Espera a que `db` esté healthy antes de iniciar (`condition: service_healthy`)

---

### **3. 🎨 Contenedor `farmacia_frontend` (Interfaz de Usuario)**

**Configuración:**
- **Tecnología**: React 18 + Vite 7.2.2
- **Nombre**: `farmacia_frontend`
- **Puerto**: `5173`
- **Dockerfile**: `./frontend/Dockerfile.dev` (modo desarrollo)

**Función:**
- Interfaz de usuario moderna con Material-UI
- Dashboards interactivos con gráficos
- Formularios de gestión (Insumos, Ingresos, Stock, Requisiciones)
- Redux para gestión de estado
- Autenticación y rutas protegidas

**Hot-Reload (Desarrollo):**
```yaml
volumes:
  - ./frontend/src:/app/src          # Código fuente
  - ./frontend/public:/app/public    # Recursos públicos
  - ./frontend/index.html:/app/index.html
  - ./frontend/vite.config.js:/app/vite.config.js
```

**Variables de Entorno:**
```env
VITE_API_URL=http://localhost:3000/api
```

**Características:**
- Vite Dev Server con HMR (Hot Module Replacement)
- Cambios visibles instantáneamente
- Diseño responsive con gradientes morados
- Theme personalizado de Material-UI

**Dependencias:**
- Depende de que `backend` esté disponible

---

## 🌐 Red y Comunicación

### **Red Docker Bridge**
```
farmacia_network
├── farmacia_db       (accesible como "db" internamente)
├── farmacia_backend  (accesible como "backend" internamente)
└── farmacia_frontend (accesible como "frontend" internamente)
```

**Características:**
- Red aislada `farmacia_network` tipo bridge
- Los contenedores se comunican por nombres de servicio
- Puertos expuestos al host: 5432 (DB), 3000 (API), 5173 (Frontend)

---

## 💾 Persistencia de Datos

### **Volumes (Datos permanentes)**
```yaml
volumes:
  postgres_data:
    name: farmacia_postgres_data
```
- Los datos de PostgreSQL permanecen aunque se eliminen los contenedores

### **Bind Mounts (Desarrollo)**
| Ruta Local | Ruta Contenedor | Propósito |
|------------|----------------|-----------|
| `./backend/src` | `/app/src` | Hot-reload backend |
| `./frontend/src` | `/app/src` | Hot-reload frontend |
| `./backend/logs` | `/app/logs` | Logs del sistema |
| `./csv` | `/csv` o `/app/csv` | Datos CSV |

---

## ✅ Ventajas de la Arquitectura

### **1. Separación de Responsabilidades**
- Cada contenedor tiene un propósito único y específico
- Frontend, Backend y Database completamente independientes

### **2. Escalabilidad**
- Escalar cada servicio independientemente según necesidad
- Agregar réplicas de backend/frontend sin modificar DB

### **3. Portabilidad**
- Funciona igual en Windows, Linux, Mac
- Un solo comando para levantar todo: `docker-compose up -d`

### **4. Mantenimiento Fácil**
- Actualizar un servicio no afecta a los demás
- Rollback instantáneo a versiones anteriores
- Logs centralizados por contenedor

### **5. Desarrollo Ágil**
- Hot-reload en backend y frontend
- Cambios visibles sin reiniciar contenedores
- Ambiente de desarrollo idéntico al de producción

### **6. Confiabilidad**
- Health checks automáticos
- Reinicio automático en caso de fallos (`restart: unless-stopped`)
- Dependencias ordenadas (db → backend → frontend)

### **7. Seguridad**
- Red aislada
- Contenedores no privilegiados
- Variables de entorno para credenciales

---

## 🎯 Comandos Útiles

### **Iniciar el Sistema**
```powershell
docker-compose up -d
```

### **Ver Estado de Contenedores**
```powershell
docker-compose ps
```

### **Ver Logs**
```powershell
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker logs farmacia_backend --tail 50
docker logs farmacia_frontend --tail 50
docker logs farmacia_db --tail 50
```

### **Reiniciar Servicios**
```powershell
# Reiniciar todos
docker-compose restart

# Reiniciar uno específico
docker-compose restart backend
docker-compose restart frontend
```

### **Detener el Sistema**
```powershell
docker-compose down
```

### **Detener y Eliminar Volumes**
```powershell
docker-compose down -v
```

### **Reconstruir Contenedores**
```powershell
# Reconstruir todos
docker-compose up -d --build

# Reconstruir uno específico
docker-compose up -d --build backend
```

### **Acceso a Contenedores**
```powershell
# Shell del backend
docker exec -it farmacia_backend sh

# PostgreSQL CLI
docker exec -it farmacia_db psql -U postgres -d farmacia_dinamica

# Shell del frontend
docker exec -it farmacia_frontend sh
```

### **Verificar Salud de Servicios**
```powershell
docker inspect farmacia_backend | Select-String health
docker inspect farmacia_db | Select-String health
```

---

## 📊 Flujo de Datos

```
Usuario (Navegador)
    ↓
    ↓ HTTP (puerto 5173)
    ↓
[farmacia_frontend - React/Vite]
    ↓
    ↓ API REST (puerto 3000)
    ↓
[farmacia_backend - Node.js/Express]
    ↓
    ↓ PostgreSQL (puerto 5432)
    ↓
[farmacia_db - PostgreSQL 15]
```

---

## 🚀 Listo para Producción

### **Para Producción, modificar:**

1. **Frontend**: Cambiar a Dockerfile de producción (build estático con Nginx)
```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile  # En lugar de Dockerfile.dev
```

2. **Variables de entorno**: Usar archivo `.env` con credenciales seguras

3. **Volumes**: Remover bind mounts de desarrollo (solo para hot-reload)

4. **Secrets**: Usar Docker Secrets o variables de entorno encriptadas

5. **Reverse Proxy**: Agregar Nginx/Traefik para HTTPS y balanceo de carga

---

## 📝 Notas Técnicas

- **Versión Docker Compose**: 3.x
- **Node.js**: v20.19.5
- **PostgreSQL**: 15-alpine
- **React**: 18.x
- **Vite**: 7.2.2
- **Material-UI**: v5

---

**Documentación creada**: Noviembre 17, 2025
**Última actualización**: Noviembre 17, 2025
