# Guía de Despliegue en Windows Server

## Requisitos Previos
- Windows Server con Docker Desktop instalado
- Git instalado
- Acceso de administrador

## Pasos para Despliegue

### 1. Obtener la IP del Servidor

Abre PowerShell como administrador y ejecuta:
```powershell
ipconfig
```

Busca la IP en la sección "Adaptador de Ethernet" o "Adaptador de red inalámbrica":
```
IPv4 Address. . . . . . . . . . . : 192.168.X.X
```

Anota esta IP, la necesitarás para la configuración.

### 2. Clonar el Repositorio

```bash
cd C:\
git clone [URL_DEL_REPOSITORIO] farmacia_hospital
cd farmacia_hospital
```

### 3. Configurar Variables de Entorno

Copia el archivo de ejemplo:
```bash
copy .env.example .env
```

Edita el archivo `.env` con un editor de texto (Notepad, VSCode, etc.)

**CONFIGURACIÓN CRÍTICA - VITE_API_URL:**

Elige UNO de estos escenarios según tus necesidades:

#### Escenario A: Solo acceso desde el servidor
```env
VITE_API_URL=http://localhost:3000/api
```
✅ Usa esto si SOLO accederás desde el navegador del servidor
❌ NO funcionará desde otros equipos de la red

#### Escenario B: Acceso desde la red local (RECOMENDADO)
```env
VITE_API_URL=http://192.168.X.X:3000/api
```
Reemplaza `192.168.X.X` con la IP que obtuviste en el paso 1

✅ Funciona desde cualquier equipo de la red
✅ También funciona desde el servidor usando su IP
⚠️ Requiere que el firewall permita conexiones al puerto 3000 y 5173

### 4. Actualizar CORS en el Backend

El archivo `backend/src/server.js` ya tiene configurado CORS para múltiples IPs.
Si necesitas agregar más IPs, edita las líneas 26-37:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://192.168.X.X:5173',  // Agrega la IP de tu servidor aquí
    // Agrega más IPs según necesites
  ],
  credentials: true
}));
```

### 5. Configurar Firewall de Windows

Si elegiste el Escenario B (acceso desde red), debes abrir los puertos:

**Opción 1: PowerShell (recomendado)**
```powershell
# Abrir puerto 3000 (Backend)
New-NetFirewallRule -DisplayName "Farmacia Backend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# Abrir puerto 5173 (Frontend)
New-NetFirewallRule -DisplayName "Farmacia Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow

# Abrir puerto 5432 (PostgreSQL - solo si necesitas acceso externo)
New-NetFirewallRule -DisplayName "Farmacia Database" -Direction Inbound -LocalPort 5432 -Protocol TCP -Action Allow
```

**Opción 2: GUI de Windows**
1. Abrir "Windows Defender Firewall con seguridad avanzada"
2. Reglas de entrada → Nueva regla
3. Tipo: Puerto → TCP → Puertos específicos: 3000, 5173
4. Acción: Permitir la conexión
5. Perfil: Marcar todos
6. Nombre: "Farmacia Hospital"

### 6. Iniciar los Servicios

```bash
docker-compose up -d
```

Espera unos minutos mientras se descargan las imágenes y se inician los servicios.

### 7. Verificar el Estado

```bash
docker-compose ps
```

Deberías ver todos los servicios con estado "Up" y "healthy":
```
NAME                STATUS
farmacia_backend    Up (healthy)
farmacia_db         Up (healthy)
farmacia_frontend   Up
farmacia_pgadmin    Up
```

### 8. Acceder a la Aplicación

**Desde el servidor:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api

**Desde otro equipo en la red:**
- Frontend: http://192.168.X.X:5173
- Backend API: http://192.168.X.X:3000/api

(Reemplaza `192.168.X.X` con la IP del servidor)

### 9. Credenciales por Defecto

**Usuario del sistema:**
- Usuario: ERNESTO ABINADAB (o el configurado en la base de datos)
- Contraseña: (la que hayas configurado)

**pgAdmin (administración de base de datos):**
- URL: http://localhost:5050
- Email: admin@farmacia.com
- Password: admin123

## Problemas Comunes

### Error: "Network Error" o "ERR_CONNECTION_TIMED_OUT"

**Causa:** La configuración de `VITE_API_URL` no coincide con tu escenario de acceso.

**Solución:**
1. Verifica que el `.env` tenga la IP correcta
2. Reinicia los contenedores:
   ```bash
   docker-compose down
   docker-compose up -d
   ```
3. Limpia el caché del navegador (Ctrl + Shift + R)

### Error: "Failed to load resource" desde otro equipo

**Causa:** El firewall está bloqueando las conexiones.

**Solución:**
1. Verifica que los puertos 3000 y 5173 estén abiertos en el firewall
2. Prueba desde el servidor: `curl http://localhost:3000/api/health`
3. Prueba desde otro equipo: `curl http://IP_SERVIDOR:3000/api/health`

### Los contenedores no inician

**Causa:** Puertos en uso o Docker no tiene permisos.

**Solución:**
1. Verifica que los puertos no estén en uso:
   ```powershell
   netstat -ano | findstr ":3000"
   netstat -ano | findstr ":5173"
   netstat -ano | findstr ":5432"
   ```
2. Si hay procesos usando esos puertos, detenerlos o cambiar los puertos en `.env`

## Mantenimiento

### Detener los servicios
```bash
docker-compose down
```

### Ver logs
```bash
# Todos los servicios
docker-compose logs -f

# Solo un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Actualizar el código
```bash
git pull
docker-compose down
docker-compose up -d --build
```

### Backup de la base de datos
```bash
docker exec farmacia_db pg_dump -U postgres farmacia_dinamica > backup_$(date +%Y%m%d).sql
```

## Notas de Seguridad

⚠️ **IMPORTANTE PARA PRODUCCIÓN:**
1. Cambia las contraseñas en el archivo `.env`
2. Cambia `JWT_SECRET` por una cadena aleatoria segura
3. Usa HTTPS en producción (configura un reverse proxy con Nginx)
4. No expongas el puerto 5432 (PostgreSQL) a internet
5. Cambia la contraseña de pgAdmin

## Soporte

Si encuentras problemas:
1. Revisa los logs: `docker-compose logs -f`
2. Verifica la configuración: `docker-compose config`
3. Consulta la documentación de Docker
