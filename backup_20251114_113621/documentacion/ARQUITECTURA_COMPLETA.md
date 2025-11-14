# 🏥 ARQUITECTURA COMPLETA DEL SISTEMA DE FARMACIA
## Basado en Pront.docx + Base de Datos Existente

---

## 📊 RESUMEN EJECUTIVO

Este documento describe la arquitectura completa del sistema de gestión de farmacia que incluye:

✅ **Base de datos PostgreSQL** (ya creada y funcionando en Docker)  
✅ **Backend Node.js + Express** (API REST completa)  
✅ **Frontend React + Redux** (interfaz moderna e intuitiva)  
✅ **Todas las funcionalidades** del documento Pront.docx  
✅ **Reportes en PDF y Excel** (Consolidado y Kardex)  

---

## 🎯 MÓDULOS DEL SISTEMA (Basados en Pront.docx)

### **1. INGRESO DE MEDICAMENTOS**
- ✅ Ingreso directo (compras)
- ✅ Ingreso por devoluciones
- ✅ Registro automático de medicamentos nuevos
- ✅ Control de lotes y vencimientos
- ✅ Registro de proveedor y bodeguero

### **2. STOCK DE 24 HORAS**
- ✅ Configuración de cantidades fijas
- ✅ Reposición diaria desde bodega
- ✅ Control de salidas y entradas
- ✅ Alertas de stock bajo

### **3. DISTRIBUCIÓN POR TURNOS**

**Turno 24 horas (15:00 - 07:00):**
- ✅ Turnista
- ✅ Todos los servicios
- ✅ Exclusivamente desde stock 24h
- ✅ Consolidados con 30 camas

**Turno Diurno (08:00 - 14:00):**
- ✅ Farmacéutico
- ✅ Emergencia General y Observación Adultos
- ✅ Exclusivamente desde bodega
- ✅ Sistema de requisiciones

### **4. CONSOLIDADOS**
- ✅ Formulario con 30 camas máximo
- ✅ Nombre del paciente por cama
- ✅ Número de registro del paciente
- ✅ Medicamentos en columnas
- ✅ Unidad o Dosis por medicamento
- ✅ Totales automáticos
- ✅ **Exportar PDF** (como tu imagen 1)
- ✅ **Imprimir**

### **5. DEVOLUCIONES**
- ✅ Formato similar a consolidado
- ✅ Suma al total de bodega (no resta)
- ✅ Registro de servicio y personal

### **6. CUADRE DE INVENTARIO**
- ✅ Cuadre diario a las 07:00 AM
- ✅ Turnista + Bodeguero
- ✅ Verificación de diferencias
- ✅ Reporte de reposición automático

### **7. REPORTES**

**Reportes de Movimiento:**
- ✅ Ingreso y salida por día/semana/mes/año
- ✅ Fecha de vencimiento por lote
- ✅ Medicamentos próximos a vencer

**Reportes de Costos:**
- ✅ Costo total de salidas por período
- ✅ Costo por medicamento individual

**Reporte Kardex** (como tu imagen 2):
- ✅ Tarjeta de control por producto
- ✅ Número de tarjeta
- ✅ Niveles mínimo y máximo
- ✅ Entradas, salidas y saldos
- ✅ Valores en Quetzales
- ✅ **Exportar Excel**

**Otros Reportes:**
- ✅ Análisis de consumo por servicio
- ✅ Control de personal que manipula medicamentos
- ✅ Alertas de inventario mínimo
- ✅ Existencias actuales

### **8. ALERTAS**
- ✅ Medicamentos próximos a vencer (30 y 15 días)
- ✅ Stock bajo (< 30%)
- ✅ Stock crítico (< 20%)
- ✅ Productos sin rotación

### **9. DASHBOARD**
- ✅ Estadísticas generales
- ✅ Alertas en tiempo real
- ✅ Gráficas de consumo
- ✅ Movimientos recientes
- ✅ Medicamentos más usados

---

## 🗄️ ARQUITECTURA DE BASE DE DATOS

### **Tablas Principales (Ya existen en tu BD):**

```
📊 GESTIÓN DE MEDICAMENTOS
├── insumo
├── insumo_presentacion
├── presentacion
├── unidad_medida
└── lote_inventario

📦 MOVIMIENTOS
├── ingreso
├── detalle_ingreso
├── consolidado
├── detalle_consolidado
├── requisicion
├── detalle_requisicion
├── salida_directa
├── detalle_salida
└── historial_movimientos

👥 PERSONAL Y USUARIOS
├── usuario
├── rol
├── permisos_rol
└── personal

🏥 SERVICIOS
├── servicio
├── departamento
└── tipo_documento

📊 STOCK 24H
├── stock_24h
├── movimiento_stock_24h
├── cuadre_stock_24h
└── detalle_cuadre_stock_24h

💰 OTROS
├── proveedor
├── costo_promedio_historico
└── alerta_stock
```

### **Funciones Existentes:**
- ✅ `registrar_medicamento_completo()` - Registro inteligente
- ✅ `actualizar_stock_trigger()` - Actualización automática
- ✅ `registrar_movimiento_trigger()` - Historial automático
- ✅ `calcular_costo_promedio()` - Cálculos de costos
- ✅ Y más...

---

## 🔧 STACK TECNOLÓGICO FINAL

### **Backend:**
```javascript
Node.js 18+
├── Express.js 4.18        // Framework web
├── Sequelize 6.35         // ORM para PostgreSQL
├── JWT                    // Autenticación
├── Bcrypt                 // Encriptación
├── PDFKit                 // Generación de PDFs
├── ExcelJS                // Generación de Excel
├── Winston                // Logging
├── Joi                    // Validaciones
├── Helmet                 // Seguridad
├── Morgan                 // HTTP logger
└── Nodemailer             // Emails (opcional)
```

### **Frontend:**
```javascript
React 18.2
├── Redux Toolkit          // Estado global
├── React Router v6        // Navegación
├── Material-UI (MUI)      // Componentes UI
│   ├── @mui/material
│   ├── @mui/icons-material
│   ├── @mui/x-data-grid   // Tablas avanzadas
│   └── @mui/x-date-pickers
├── Formik + Yup           // Formularios y validación
├── Axios                  // HTTP client
├── React Query            // Cache y sincronización
├── React-to-print         // Impresión
├── jsPDF                  // PDFs
├── html2canvas            // Captura HTML
├── ExcelJS                // Excel
├── Recharts               // Gráficas
├── date-fns               // Manejo de fechas
├── React Hot Toast        // Notificaciones
└── Framer Motion          // Animaciones
```

---

## 📱 DISEÑO DE INTERFAZ

### **Paleta de Colores:**
```css
/* Colores Principales */
--primary: #1976D2        /* Azul médico profesional */
--secondary: #388E3C      /* Verde salud */
--accent: #00BCD4         /* Cyan para destacar */

/* Estados */
--success: #4CAF50        /* Verde éxito */
--warning: #FF9800        /* Naranja advertencia */
--error: #F44336          /* Rojo error */
--info: #2196F3           /* Azul información */

/* Neutrales */
--background: #F5F5F5     /* Fondo claro */
--surface: #FFFFFF        /* Superficie blanca */
--text-primary: #212121   /* Texto principal */
--text-secondary: #757575 /* Texto secundario */

/* Alertas Stock 24h */
--critical: #D32F2F       /* Rojo crítico < 20% */
--low: #F57C00            /* Naranja bajo < 30% */
--normal: #388E3C         /* Verde normal >= 50% */
```

### **Tipografía:**
```css
/* Fuentes */
font-family-primary: 'Roboto', sans-serif
font-family-numbers: 'Roboto Mono', monospace
font-family-headings: 'Roboto', sans-serif

/* Tamaños */
h1: 32px (bold)
h2: 24px (bold)
h3: 20px (medium)
h4: 18px (medium)
body: 14px (regular)
small: 12px (regular)
```

---

## 🎨 COMPONENTES PRINCIPALES

### **1. Layout Principal**
```
┌──────────────────────────────────────────────────┐
│  [Logo] Sistema Farmacia    [Usuario] [🔔] [⚙️]  │
├──────────┬───────────────────────────────────────┤
│          │                                        │
│  SIDEBAR │         CONTENIDO PRINCIPAL           │
│          │                                        │
│  📊 Dash │   ┌──────────────────────────────┐   │
│  💊 Insm │   │                              │   │
│  📥 Ingr │   │   Aquí van los módulos       │   │
│  📤 Sald │   │   y componentes              │   │
│  🏥 Cons │   │                              │   │
│  📋 Reqs │   │                              │   │
│  🔄 Repo │   │                              │   │
│  📊 Repo │   └──────────────────────────────┘   │
│  ⚙️ Conf │                                        │
│          │                                        │
└──────────┴────────────────────────────────────────┘
```

### **2. Dashboard (Página Principal)**
```
┌────────────────────────────────────────────────┐
│  🏥 DASHBOARD                                  │
├────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 📦 245   │ │ 💰 Q45K  │ │ ⚠️ 8     │       │
│  │ Items    │ │ Mes      │ │ Alertas  │       │
│  └──────────┘ └──────────┘ └──────────┘       │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │  📊 CONSUMO MENSUAL                     │  │
│  │  [Gráfica de líneas/barras]            │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  ┌───────────────┐  ┌─────────────────────┐  │
│  │ 🔥 MÁS USADOS │  │ ⏰ VENCEN PRONTO    │  │
│  │ 1. Acetamin.  │  │ • Diclof. (15 días) │  │
│  │ 2. Diclofenac │  │ • Omepr. (22 días)  │  │
│  └───────────────┘  └─────────────────────┘  │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │  🕐 ÚLTIMOS MOVIMIENTOS                 │  │
│  │  • Consolidado M.M - 2h                 │  │
│  │  • Ingreso FACT-001 - 5h                │  │
│  └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### **3. Formulario de Ingreso (Compra)**
```
┌─────────────────────────────────────────────────┐
│  📥 REGISTRO DE INGRESO - COMPRA               │
├─────────────────────────────────────────────────┤
│                                                  │
│  Proveedor:      [Autocomplete ▼]              │
│  Nº Factura:     [____________]                 │
│  Fecha Ingreso:  [📅 DD/MM/YYYY]               │
│  Recibido por:   [Bodeguero Actual]            │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │  MEDICAMENTOS                          │    │
│  │  [+ Agregar medicamento]               │    │
│  │                                        │    │
│  │  ┌──────────────────────────────────┐ │    │
│  │  │ Medicamento 1                    │ │    │
│  │  │ ────────────────────────────────│ │    │
│  │  │ Nombre:      [Autocomplete]     │ │    │
│  │  │              Si no existe,      │ │    │
│  │  │              se registra auto   │ │    │
│  │  │                                  │ │    │
│  │  │ Presentación: [Frasco ▼]       │ │    │
│  │  │ Cant. Pres.: [100] [ml ▼]     │ │    │
│  │  │ Cantidad:    [50] unidades     │ │    │
│  │  │ Precio Unit.: Q [15.50]        │ │    │
│  │  │ Nº Lote:     [L-2024-001]      │ │    │
│  │  │ Vencimiento: [📅 2026-12-31]  │ │    │
│  │  │                                  │ │    │
│  │  │ Subtotal:    Q 775.00          │ │    │
│  │  │              [✖ Eliminar]       │ │    │
│  │  └──────────────────────────────────┘ │    │
│  │                                        │    │
│  │  [+ Agregar otro medicamento]          │    │
│  └────────────────────────────────────────┘    │
│                                                  │
│  TOTAL:  Q 775.00                               │
│                                                  │
│  [💾 Guardar]  [❌ Cancelar]                    │
└──────────────────────────────────────────────────┘
```

### **4. Consolidado (Turno 24h)**
```
┌──────────────────────────────────────────────────┐
│  🏥 CONSOLIDADO - TURNO 24 HORAS                │
├──────────────────────────────────────────────────┤
│                                                   │
│  Servicio:  [Medicina de Mujeres ▼]             │
│  Fecha:     [📅 03/11/2025]                      │
│  Turnista:  [Leonel ▼]                           │
│  Turno:     15:00 - 07:00                        │
│                                                   │
│  ┌────────────────────────────────────────────┐ │
│  │  TABLA DE 30 CAMAS                         │ │
│  │                                            │ │
│  │  [Como tu imagen 1 - tabla interactiva]   │ │
│  │                                            │ │
│  │  Columnas:                                 │ │
│  │  • No. (1-30)                              │ │
│  │  • Paciente (input text)                   │ │
│  │  • Registro (input text)                   │ │
│  │  • Cama (1-30)                             │ │
│  │  • [Medicamentos dinámicos]               │ │
│  │                                            │ │
│  │  Totales automáticos por medicamento       │ │
│  └────────────────────────────────────────────┘ │
│                                                   │
│  [💾 Guardar] [🖨️ Imprimir] [📄 PDF]           │
└───────────────────────────────────────────────────┘
```

### **5. Reporte Kardex**
```
┌──────────────────────────────────────────────────┐
│  📊 TARJETA DE CONTROL (KARDEX)                 │
├──────────────────────────────────────────────────┤
│                                                   │
│  Hospital Regional de El Quiché                  │
│  Producto: ACETAMINOFEN 500mg - Tableta          │
│  Tarjeta: 9171                                    │
│  Niveles: Mín 3 - Máx 6                          │
│                                                   │
│  ┌────────────────────────────────────────────┐ │
│  │ [Como tu imagen 2 - tabla de movimientos] │ │
│  │                                            │ │
│  │ Fecha │ Doc │ Desc │ Entradas │ Salidas  │ │
│  │       │     │      │ U│Q│U│Q  │ U│Q│U│Q  │ │
│  │────────────────────────────────────────────│ │
│  │ ...   │ ... │ ... │...│...│...│...│...  │ │
│  │                                            │ │
│  │ VAN          │ 191│0.05│0│9.55│370│0.05│ │
│  └────────────────────────────────────────────┘ │
│                                                   │
│  [🖨️ Imprimir] [📊 Excel]                       │
└───────────────────────────────────────────────────┘
```

---

## 🔌 ENDPOINTS DE LA API

### **Autenticación:**
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
```

### **Insumos (Medicamentos):**
```
GET    /api/insumos
GET    /api/insumos/:id
POST   /api/insumos
PUT    /api/insumos/:id
DELETE /api/insumos/:id
GET    /api/insumos/search?q=...
GET    /api/insumos/stock-bajo
```

### **Ingresos:**
```
GET    /api/ingresos
GET    /api/ingresos/:id
POST   /api/ingresos (tipo: COMPRA)
POST   /api/ingresos/devolucion
PUT    /api/ingresos/:id
DELETE /api/ingresos/:id
```

### **Consolidados:**
```
GET    /api/consolidados
GET    /api/consolidados/:id
POST   /api/consolidados
PUT    /api/consolidados/:id
POST   /api/consolidados/:id/cerrar
DELETE /api/consolidados/:id
```

### **Stock 24 Horas:**
```
GET    /api/stock-24h
GET    /api/stock-24h/estado
POST   /api/stock-24h/configurar
PUT    /api/stock-24h/:id
GET    /api/stock-24h/alertas
```

### **Requisiciones:**
```
GET    /api/requisiciones
GET    /api/requisiciones/:id
POST   /api/requisiciones
PUT    /api/requisiciones/:id/aprobar
PUT    /api/requisiciones/:id/rechazar
POST   /api/requisiciones/:id/entregar
```

### **Cuadre y Reposición:**
```
GET    /api/cuadre-stock
POST   /api/cuadre-stock
GET    /api/cuadre-stock/:id
POST   /api/cuadre-stock/:id/reporte
POST   /api/cuadre-stock/:id/reponer
```

### **Reportes:**
```
GET    /api/reportes/consolidado/:id
POST   /api/reportes/consolidado/:id/pdf
GET    /api/reportes/kardex/:insumo_id
POST   /api/reportes/kardex/:insumo_id/excel
GET    /api/reportes/movimientos
GET    /api/reportes/costos
GET    /api/reportes/vencimientos
GET    /api/reportes/stock-bajo
GET    /api/reportes/consumo-servicio
```

### **Dashboard:**
```
GET    /api/dashboard/stats
GET    /api/dashboard/alertas
GET    /api/dashboard/graficas
GET    /api/dashboard/movimientos-recientes
GET    /api/dashboard/mas-usados
```

---

## 📊 FLUJO DE DATOS PRINCIPAL

### **1. Ingreso de Medicamento (Primera Vez):**
```
Usuario ingresa datos
       ↓
Backend valida
       ↓
¿Medicamento existe?
   NO → Ejecuta registrar_medicamento_completo()
         ├── Crea insumo
         ├── Crea insumo_presentacion
         ├── Crea presentacion (si no existe)
         └── Crea unidad_medida (si no existe)
   SÍ → Usa medicamento existente
       ↓
Crea ingreso
       ↓
Crea detalle_ingreso
       ↓
TRIGGER: actualizar_stock_trigger()
       ├── Crea/actualiza lote_inventario
       └── Actualiza cantidades
       ↓
TRIGGER: registrar_movimiento_trigger()
       └── Registra en historial_movimientos
       ↓
Frontend actualiza vista
```

### **2. Consolidado (Salida Turno 24h):**
```
Turnista abre formulario
       ↓
Selecciona servicio, fecha
       ↓
Llena tabla 30 camas:
  • Nombre paciente
  • Registro
  • Cantidades por medicamento
       ↓
Sistema calcula totales
       ↓
Al guardar:
  ├── Crea consolidado
  ├── Crea detalle_consolidado (por cada medicamento)
  ├── TRIGGER: Descuenta de stock_24h
  ├── TRIGGER: Registra historial_movimientos
  └── Actualiza lote_inventario
       ↓
Frontend muestra resumen
```

### **3. Cuadre Diario (07:00 AM):**
```
Sistema a las 07:00 AM
       ↓
Calcula diferencias:
  Stock debe haber - Stock actual
       ↓
Genera reporte de reposición
       ↓
Turnista y Bodeguero revisan
       ↓
Bodeguero aprueba reposición
       ↓
Sistema:
  ├── Crea movimiento_reposicion
  ├── Actualiza stock_24h
  └── Registra en historial
       ↓
Stock 24h listo para nuevo turno
```

---

## 🚀 ORDEN DE IMPLEMENTACIÓN

### **FASE 1: Backend Base** ✅ (EN PROGRESO)
- ✅ Configuración servidor
- ✅ Conexión a base de datos
- ⏳ Modelos Sequelize
- ⏳ Middleware de autenticación
- ⏳ Controladores básicos

### **FASE 2: APIs Core**
- ⏳ CRUD de insumos
- ⏳ Ingresos (compra y devolución)
- ⏳ Consolidados
- ⏳ Stock 24h
- ⏳ Requisiciones

### **FASE 3: Frontend Base**
- ⏳ Configuración React + Vite
- ⏳ Redux store
- ⏳ Sistema de login
- ⏳ Layout principal
- ⏳ Navegación

### **FASE 4: Módulos Principales**
- ⏳ Dashboard
- ⏳ Registro de medicamentos
- ⏳ Ingresos
- ⏳ Consolidados
- ⏳ Stock 24h

### **FASE 5: Reportes**
- ⏳ Consolidado PDF
- ⏳ Kardex Excel
- ⏳ Reportes de movimientos
- ⏳ Reportes de costos
- ⏳ Alertas

### **FASE 6: Refinamiento**
- ⏳ Optimización
- ⏳ Testing
- ⏳ Documentación
- ⏳ Deploy

---

## 📦 ARCHIVOS YA CREADOS

```
backend/
├── package.json                ✅
├── .env                        ✅
└── src/
    └── config/
        ├── database.js         ✅
        └── logger.js           ✅
```

---

## 🎯 PRÓXIMO PASO

Voy a continuar creando:

1. ✅ **Todos los modelos Sequelize** (mapeo completo de tu BD)
2. ✅ **Todos los controladores** (lógica de negocio)
3. ✅ **Todas las rutas** (endpoints)
4. ✅ **Middleware completo** (auth, validación, errores)
5. ✅ **Servicios de reportes** (PDF y Excel)
6. ✅ **Servidor principal** (todo integrado)

Luego continuaré con el frontend completo.

---

**¿Continúo con los modelos Sequelize? 🚀**
