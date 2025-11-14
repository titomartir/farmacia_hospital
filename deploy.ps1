# Script de Despliegue del Sistema de Farmacia
# Windows PowerShell

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Sistema de Gestión de Farmacia - Docker    " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que Docker esté instalado
Write-Host "Verificando Docker..." -ForegroundColor Yellow
docker --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}
Write-Host "OK: Docker está instalado" -ForegroundColor Green
Write-Host ""

# Verificar que docker-compose esté disponible
Write-Host "Verificando Docker Compose..." -ForegroundColor Yellow
docker-compose --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: docker-compose no está disponible" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Docker Compose está disponible" -ForegroundColor Green
Write-Host ""

# Verificar archivo .env
if (!(Test-Path ".env")) {
    Write-Host "Archivo .env no encontrado. Creando desde .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "Archivo .env creado. Por favor revisa y ajusta las variables de entorno." -ForegroundColor Green
    } else {
        Write-Host "ERROR: No se encontró .env.example" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
}

# Preguntar qué hacer
Write-Host "¿Qué deseas hacer?" -ForegroundColor Cyan
Write-Host "1. Iniciar contenedores (primera vez o después de cambios)"
Write-Host "2. Detener contenedores"
Write-Host "3. Ver logs"
Write-Host "4. Reiniciar contenedores"
Write-Host "5. Eliminar todo (incluye datos)"
Write-Host "6. Ver estado de contenedores"
Write-Host ""
$opcion = Read-Host "Selecciona una opción (1-6)"

switch ($opcion) {
    "1" {
        Write-Host ""
        Write-Host "Iniciando contenedores..." -ForegroundColor Cyan
        docker-compose up -d --build
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "================================================" -ForegroundColor Green
            Write-Host "   Contenedores iniciados correctamente       " -ForegroundColor Green
            Write-Host "================================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "Accede a la aplicación en:" -ForegroundColor Yellow
            Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
            Write-Host "  Backend:  http://localhost:3000/api" -ForegroundColor White
            Write-Host "  Base de Datos: localhost:5432" -ForegroundColor White
            Write-Host ""
            Write-Host "Ver logs: docker-compose logs -f" -ForegroundColor Gray
        }
    }
    "2" {
        Write-Host ""
        Write-Host "Deteniendo contenedores..." -ForegroundColor Cyan
        docker-compose down
        Write-Host "Contenedores detenidos" -ForegroundColor Green
    }
    "3" {
        Write-Host ""
        Write-Host "Mostrando logs (Ctrl+C para salir)..." -ForegroundColor Cyan
        docker-compose logs -f
    }
    "4" {
        Write-Host ""
        Write-Host "Reiniciando contenedores..." -ForegroundColor Cyan
        docker-compose restart
        Write-Host "Contenedores reiniciados" -ForegroundColor Green
    }
    "5" {
        Write-Host ""
        Write-Host "ADVERTENCIA: Esto eliminará todos los datos" -ForegroundColor Red
        $confirm = Read-Host "¿Estás seguro? (si/no)"
        if ($confirm -eq "si") {
            docker-compose down -v
            Write-Host "Contenedores y volúmenes eliminados" -ForegroundColor Green
        } else {
            Write-Host "Operación cancelada" -ForegroundColor Yellow
        }
    }
    "6" {
        Write-Host ""
        Write-Host "Estado de contenedores:" -ForegroundColor Cyan
        docker-compose ps
    }
    default {
        Write-Host "Opción no válida" -ForegroundColor Red
    }
}

Write-Host ""
