# 🏥 Sistema de Gestión de Farmacia Hospitalaria

Sistema completo de gestión de farmacia para hospitales con Docker, PostgreSQL, Node.js/Express y React.

## 📋 Características Principales

- ✅ **Gestión de Inventario por Lotes** con control de vencimientos
- ✅ **Stock de 24 Horas** para turnos nocturnos
- ✅ **Consolidados** por servicio con hasta 30 camas
- ✅ **Requisiciones** para farmacia diurna
- ✅ **Reposiciones Automáticas** de stock
- ✅ **Reportes** en PDF y Excel (Kardex, Consolidados)
- ✅ **Alertas** de vencimiento y stock bajo
- ✅ **Multi-usuario** con roles (Admin, Farmacéutico, Bodeguero, Turnista)
- ✅ **Registro Dinámico** de medicamentos al momento del ingreso

## 🚀 Inicio Rápido con Docker

### Prerrequisitos

- Docker Desktop instalado ([Descargar aquí](https://www.docker.com/products/docker-desktop))
- Git (opcional)

### Instalación

1. **Clonar o descargar el proyecto**
```bash
cd farmacia_hospital
```

2. **Configurar variables de entorno**

Copiar el archivo de ejemplo y ajustar si es necesario:
```bash
# En Windows PowerShell
copy .env .env.local

# En Linux/Mac
cp .env .env.local
```

3. **Iniciar los contenedores**

```bash
docker-compose up -d
```

Esto iniciará:
- 🗄️ **PostgreSQL** en puerto `5432`
- 🔧 **Backend API** en puerto `3000`
- 🌐 **Frontend** en puerto `5173`

4. **Verificar que todo funciona**

```bash
docker-compose ps
```

Deberías ver 3 servicios corriendo:
- `farmacia_db`
- `farmacia_backend`
- `farmacia_frontend`

5. **Acceder a la aplicación**

Abrir en el navegador:
```
http://localhost:5173
```

### Credenciales de Acceso

Usuario Administrador:
- **Usuario:** `admin`
- **Contraseña:** `admin` (cambiar en producción)

## 📁 Estructura del Proyecto

```
farmacia_hospital/
├── docker-compose.yml          # Orquestación de contenedores
├── .env                        # Variables de entorno
├── farmacia_sistema_dinamico.sql  # Schema de base de datos
├── scripts/
│   └── init-db.sh             # Script de inicialización de BD
├── csv/                        # Datos iniciales
│   ├── insumo.csv
│   ├── personal.csv
│   ├── usuario.csv
│   └── ...
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── server.js
│       ├── models/
│       ├── controllers/
│       ├── routes/
│       └── config/
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    └── src/
        ├── components/
        ├── pages/
        └── services/
```

## 🛠️ Comandos Útiles

### Ver logs de los servicios

```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo base de datos
docker-compose logs -f db
```

### Detener los contenedores

```bash
docker-compose down
```

### Detener y eliminar volúmenes (⚠️ elimina datos)

```bash
docker-compose down -v
```

### Reconstruir contenedores después de cambios

```bash
docker-compose up -d --build
```

### Acceder a la base de datos

```bash
docker-compose exec db psql -U postgres -d farmacia_dinamica
```

### Ejecutar comandos en el backend

```bash
# Crear usuario administrador
docker-compose exec backend node scripts/crear-usuario-admin.js

# Ver logs de la aplicación
docker-compose exec backend cat logs/app.log
```

## 🔧 Desarrollo

### Modo Desarrollo (con hot-reload)

Para desarrollo local sin Docker:

1. **Backend:**
```bash
cd backend
npm install
npm run dev
```

2. **Frontend:**
```bash
cd frontend
npm install
npm run dev
```

3. **Base de datos:**

Instalar PostgreSQL localmente o usar Docker solo para la BD:
```bash
docker run -d \
  --name postgres_farmacia \
  -e POSTGRES_DB=farmacia_dinamica \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -p 5432:5432 \
  postgres:15-alpine
```

Luego ejecutar el SQL:
```bash
psql -U postgres -d farmacia_dinamica -f farmacia_sistema_dinamico.sql
```

## 📊 Importación de Datos CSV

Los datos iniciales se cargan automáticamente al iniciar el contenedor de base de datos.

Para reimportar manualmente:

```bash
docker-compose exec db /docker-entrypoint-initdb.d/02-init-data.sh
```

## 🔐 Seguridad

⚠️ **IMPORTANTE para Producción:**

1. Cambiar las contraseñas en `.env`:
   - `DB_PASSWORD`
   - `JWT_SECRET`

2. Actualizar contraseñas de usuarios en la BD

3. Configurar HTTPS/SSL

4. Revisar configuración de CORS en backend

## 📖 API Documentation

La API REST está disponible en `http://localhost:3000/api`

Endpoints principales:
- `POST /api/auth/login` - Login
- `GET /api/insumos` - Listar medicamentos
- `POST /api/ingresos` - Registrar ingreso
- `GET /api/consolidados` - Ver consolidados
- `GET /api/dashboard/stats` - Estadísticas

## 🐛 Solución de Problemas

### Error: Puerto ya en uso

```bash
# Cambiar puertos en .env
BACKEND_PORT=3001
FRONTEND_PORT=5174
DB_PORT=5433
```

### Base de datos no se conecta

```bash
# Ver logs
docker-compose logs db

# Reiniciar servicio
docker-compose restart db
```

### Frontend no carga

```bash
# Reconstruir
docker-compose up -d --build frontend
```

## 📝 Licencia

MIT

## 👥 Soporte

Para reportar problemas o solicitar ayuda, crear un issue en el repositorio.

---

**Desarrollado con ❤️ para Hospitales de Guatemala**
