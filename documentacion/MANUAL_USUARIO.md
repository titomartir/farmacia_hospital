# 📖 MANUAL DE USUARIO
## Sistema de Farmacia Hospitalaria

**Versión:** 1.0  
**Fecha:** Noviembre 2025  
**Institución:** Hospital Regional

---

## 📑 ÍNDICE

1. [Introducción](#introducción)
2. [Inicio de Sesión](#inicio-de-sesión)
3. [Módulo Dashboard](#módulo-dashboard)
4. [Módulo Insumos](#módulo-insumos)
5. [Módulo Ingresos](#módulo-ingresos)
6. [Módulo Requisiciones](#módulo-requisiciones)
7. [Módulo Consolidados](#módulo-consolidados)
8. [Módulo Stock 24 Horas](#módulo-stock-24-horas)
9. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 🚀 INTRODUCCIÓN

### ¿Qué es el Sistema de Farmacia Hospitalaria?

El Sistema de Farmacia Hospitalaria es una aplicación web diseñada para gestionar de manera integral todos los procesos relacionados con el almacenamiento, distribución y control de medicamentos e insumos médicos en un hospital.

### Características Principales

- ✅ **Control de inventario** en tiempo real
- ✅ **Gestión de ingresos** de mercadería por compras o devoluciones
- ✅ **Requisiciones** de medicamentos por servicios hospitalarios
- ✅ **Consolidados** de administración de medicamentos por paciente
- ✅ **Stock 24 horas** para servicios críticos
- ✅ **Trazabilidad completa** con registro de fecha y hora
- ✅ **Clasificación de medicamentos** (VIH, Anticonceptivos, Listado Básico)
- ✅ **Reportes y estadísticas** en tiempo real

### Requisitos del Sistema

#### Hardware Mínimo
- Procesador: Intel Core i3 o equivalente
- RAM: 4 GB
- Disco: 10 GB de espacio libre
- Conexión a Internet: Requerida

#### Software
- Navegador web moderno:
  - Google Chrome (recomendado)
  - Mozilla Firefox
  - Microsoft Edge
- Sistema operativo: Windows 10/11, Linux, macOS

### Roles de Usuario

El sistema cuenta con tres niveles de acceso:

| Rol | Permisos | Descripción |
|-----|----------|-------------|
| **Administrador** | Acceso completo | Puede crear, editar, eliminar y ver todos los registros |
| **Farmacéutico** | Crear y editar | Puede gestionar ingresos, requisiciones y consolidados |
| **Asistente** | Solo lectura | Puede consultar información pero no modificar |

---

## 🔐 INICIO DE SESIÓN

### Acceder al Sistema

1. **Abrir el navegador web**
2. **Ingresar la URL del sistema:**
   ```
   http://localhost:5174
   ```
   O la dirección proporcionada por su administrador de sistemas.

3. **Pantalla de inicio de sesión:**

   ![Pantalla de Login]

   La pantalla muestra:
   - Campo "Usuario"
   - Campo "Contraseña"
   - Botón "Iniciar Sesión"

### Credenciales de Acceso

Las credenciales son proporcionadas por el administrador del sistema. Ejemplo:

```
Usuario: ANA MERCEDES
Contraseña: usuario
```

> ⚠️ **IMPORTANTE:** 
> - El nombre de usuario distingue entre mayúsculas y minúsculas
> - Después de 3 intentos fallidos, la cuenta puede bloquearse temporalmente
> - Cambie su contraseña en el primer inicio de sesión

### ¿Olvidó su Contraseña?

Contacte al administrador del sistema para restablecer su contraseña.

### Cerrar Sesión

Para cerrar sesión de forma segura:

1. Haga clic en su nombre de usuario (esquina superior derecha)
2. Seleccione "Cerrar Sesión"
3. Será redirigido a la pantalla de inicio de sesión

> 💡 **TIP:** Siempre cierre sesión al terminar, especialmente en computadoras compartidas.

---

## 📊 MÓDULO DASHBOARD

El Dashboard es la página principal del sistema. Muestra un resumen general del estado de la farmacia.

### Vista General

Al iniciar sesión, verá:

1. **Tarjetas de Resumen (Superior)**
   - Total de Insumos
   - Requisiciones Pendientes
   - Ingresos del Mes
   - Alertas de Stock

2. **Gráficos y Estadísticas**
   - Gráfico de movimientos recientes
   - Insumos más solicitados
   - Estado de requisiciones

3. **Menú de Navegación (Lateral Izquierdo)**
   - Dashboard
   - Insumos
   - Ingresos
   - Requisiciones
   - Consolidados
   - Stock 24h
   - Reportes

### Interpretación de Indicadores

#### 📦 Total de Insumos
- Muestra la cantidad total de productos registrados en el sistema
- El número incluye insumos activos e inactivos
- Clic en la tarjeta para ver el detalle

#### 📝 Requisiciones Pendientes
- Cantidad de requisiciones que esperan autorización o entrega
- Estados incluidos: "pendiente", "autorizado"
- **Color rojo:** Indica requisiciones urgentes

#### 📥 Ingresos del Mes
- Total de ingresos de mercadería en el mes actual
- Incluye compras y devoluciones
- Se actualiza en tiempo real

#### ⚠️ Alertas de Stock
- Insumos que están por debajo del stock mínimo
- **Requiere atención inmediata**
- Clic para ver qué insumos necesitan reposición

### Navegación Rápida

Desde el Dashboard puede:
- Hacer clic en cualquier tarjeta para ver más detalles
- Usar el menú lateral para acceder a otros módulos
- Ver notificaciones en tiempo real

---

## 💊 MÓDULO INSUMOS

El módulo de Insumos permite gestionar el catálogo completo de medicamentos y productos médicos.

### ¿Qué son los Insumos?

Los insumos son todos los medicamentos, materiales médicos y productos que maneja la farmacia. Cada insumo tiene:
- Nombre genérico
- Descripción
- Clasificación (VIH, Anticonceptivos, Listado Básico)
- Subclasificación (Requisición, Receta)
- Estado (Activo/Inactivo)

> 💡 **IMPORTANTE:** Los medicamentos se crean en el módulo **INSUMOS**, no en Ingresos. El módulo de Ingresos solo registra la entrada de medicamentos que ya existen en el catálogo.

### Ver Lista de Insumos

1. En el menú lateral, haga clic en **"Insumos"**
2. Se mostrará una tabla con todos los insumos registrados

**Columnas de la tabla:**
- **ID:** Identificador único del insumo
- **Nombre:** Nombre genérico del medicamento
- **Descripción:** Detalles adicionales
- **Clasificación:** Categoría del medicamento (con código de color)
  - 🔴 VIH
  - 🟣 Método Anticonceptivo
  - ⚪ Listado Básico
- **Subclasificación:** Requisición o Receta
- **Estado:** Activo o Inactivo
- **Acciones:** Editar o Eliminar

### Filtrar Insumos

En la sección de filtros puede buscar por múltiples criterios:

1. **Búsqueda por texto:**
   - Escriba el nombre o parte del nombre del insumo
   - La tabla se filtrará automáticamente

2. **Por Clasificación:**
   - Todas
   - Listado Básico
   - VIH
   - Método Anticonceptivo

3. **Por Subclasificación:**
   - Todas
   - Requisición
   - Receta

4. **Por Estado:**
   - Todos
   - Activos
   - Inactivos

5. **Botón Limpiar:** Remueve todos los filtros aplicados

**Ejemplo:**
```
Buscar: "paracetamol"
Clasificación: Listado Básico
Estado: Activos
```

### Crear Nuevo Insumo

1. **Haga clic en el botón "Nuevo Insumo"** (esquina superior derecha)

2. **Complete el formulario:**

   | Campo | Descripción | Requerido |
   |-------|-------------|-----------|
   | **Nombre** | Nombre genérico del medicamento | ✅ Sí |
   | **Descripción** | Detalles, concentración, forma farmacéutica | ❌ No |
   | **Clasificación** | Categoría del medicamento | ✅ Sí |
   | **Subclasificación** | Tipo de distribución | ❌ No |

3. **Seleccione la Clasificación:**
   - **Listado Básico:** Medicamentos de uso general (predeterminado)
   - **VIH:** Antirretrovirales y medicamentos relacionados
   - **Método Anticonceptivo:** Anticonceptivos orales, inyectables, etc.

4. **Seleccione la Subclasificación (opcional):**
   - **Requisición:** Se distribuye mediante requisición de servicios
   - **Receta:** Se entrega con receta médica
   - **Ninguna:** No aplica clasificación especial

5. **Establezca el Estado:**
   - **Activo:** El medicamento está disponible para usar en el sistema
   - **Inactivo:** No aparecerá en formularios (use esto en lugar de eliminar)

6. **Haga clic en "Guardar"**

**Ejemplo de registro:**
```
Nombre: Paracetamol
Descripción: Tableta 500mg
Clasificación: Listado Básico
Subclasificación: Requisición
Estado: Activo
```

> 💡 **TIP:** La clasificación ayuda a generar reportes específicos por programa (VIH, Planificación Familiar, etc.)

> ⚠️ **NOTA:** Una vez creado el insumo aquí, podrá agregarlo en el módulo de Ingresos cuando reciba stock físico.

### Editar un Insumo

1. En la tabla, localice el insumo que desea editar
2. Haga clic en el icono de **lápiz** (✏️) en la columna "Acciones"
3. Aparecerá el mismo formulario con los datos actuales
4. Modifique los campos necesarios (incluyendo el estado)
5. Haga clic en "Guardar"

> ⚠️ **NOTA:** Los cambios en el insumo no afectan los registros históricos de ingresos o requisiciones.

> 💡 **TIP:** Para "eliminar" un medicamento que ya no se usa, cámbielo a estado "Inactivo" en lugar de eliminarlo. Así conserva el historial.

### Eliminar un Insumo

1. En la tabla, localice el insumo que desea eliminar
2. Haga clic en el icono de **papelera** (🗑️)
3. Aparecerá un mensaje de confirmación:
   ```
   ¿Está seguro de eliminar este insumo?
   ```
4. Confirme la acción

> ⚠️ **ADVERTENCIA:** 
> - No se pueden eliminar insumos que tienen movimientos registrados
> - En su lugar, puede desactivar el insumo cambiando su estado a "Inactivo"

### Estados de Insumos

Cada insumo puede estar:
- **Activo:** Disponible para uso en el sistema (aparece en formularios)
- **Inactivo:** No aparece en formularios pero conserva su historial

Para cambiar el estado:
1. Edite el insumo
2. Use el interruptor "Activo/Inactivo"
3. Guarde los cambios

### Imprimir Lista de Insumos

En la esquina superior derecha encontrará el botón **"Imprimir"**:
1. Aplique los filtros que desee
2. Haga clic en "Imprimir"
3. Se abrirá la vista de impresión del navegador
4. Puede imprimir o guardar como PDF

---

## 📥 MÓDULO INGRESOS

El módulo de Ingresos registra todas las entradas de mercadería a la farmacia, ya sea por compras o devoluciones.

### ¿Qué es un Ingreso?

Un ingreso es el registro de entrada de medicamentos o insumos al almacén de la farmacia. Cada ingreso contiene:
- Proveedor
- Tipo de ingreso (Compra o Devolución)
- Fecha y hora
- Número de factura
- Detalle de medicamentos con lotes y cantidades

### Ver Lista de Ingresos

1. En el menú lateral, haga clic en **"Ingresos"**
2. Verá una tabla con todos los ingresos registrados

**Columnas principales:**
- **ID:** Número de ingreso
- **Proveedor:** Empresa proveedora
- **Tipo:** Compra o Devolución
- **Fecha y Hora:** Cuándo se registró el ingreso
- **Factura:** Número de documento
- **Total Items:** Cantidad de productos diferentes
- **Usuario:** Quién registró el ingreso
- **Acciones:** Ver detalle

### Filtrar Ingresos

Puede filtrar los ingresos por:

1. **Fecha:**
   - Seleccione una fecha inicial
   - Seleccione una fecha final
   - Haga clic en "Buscar"

2. **Tipo de ingreso:**
   - Todos
   - Solo compras
   - Solo devoluciones

3. **Proveedor:**
   - Seleccione un proveedor del menú desplegable

### Crear Nuevo Ingreso

#### Paso 1: Información General

1. Haga clic en **"Nuevo Ingreso"**

2. Complete los datos del encabezado:

   | Campo | Descripción | Ejemplo |
   |-------|-------------|---------|
   | **Proveedor** | Seleccione de la lista | Farmacéutica La Paz |
   | **Tipo de Ingreso** | Compra o Devolución | Compra |
   | **Fecha y Hora** | Cuándo se recibió | 12/11/2025 14:30 |
   | **Número de Factura** | Documento del proveedor | FACT-2025-001234 |
   | **Observaciones** | Notas adicionales (opcional) | Entrega completa |

#### Paso 2: Agregar Medicamentos

1. **Haga clic en "Agregar Medicamento"** (botón +)

2. **Busque el medicamento:**
   - Escriba en el campo de búsqueda
   - Seleccione de la lista desplegable
   - Puede buscar por nombre o código

3. **Complete los datos del lote:**

   | Campo | Descripción | Ejemplo |
   |-------|-------------|---------|
   | **Medicamento** | Producto a ingresar | Paracetamol 500mg |
   | **Presentación** | Forma farmacéutica | Tableta x 100 |
   | **Lote** | Número de lote del fabricante | LOTE-2025-PAR-001 |
   | **Fecha Vencimiento** | Cuándo expira el lote | 31/12/2026 |
   | **Cantidad** | Unidades recibidas | 500 |
   | **Precio Unitario** | Costo por unidad | Q 2.50 |

4. **El sistema calcula automáticamente:**
   - Subtotal = Cantidad × Precio Unitario
   - Total general del ingreso

5. **Repita** para cada medicamento recibido

#### Paso 3: Revisar y Guardar

1. **Revise el resumen:**
   - Total de ítems agregados
   - Costo total del ingreso
   - Datos del proveedor

2. **Haga clic en "Guardar Ingreso"**

3. **Confirmación:**
   - El sistema mostrará el número de ingreso asignado
   - El stock se actualizará automáticamente
   - Se creará el registro en el historial

**Ejemplo completo:**
```
Proveedor: Farmacéutica ABC
Tipo: Compra
Fecha: 12/11/2025 14:30
Factura: FACT-001

Detalles:
1. Paracetamol 500mg - Lote PAR-001 - Vence: 31/12/2026 - Cant: 500 - Precio: Q2.50
2. Ibuprofeno 400mg - Lote IBU-001 - Vence: 30/06/2026 - Cant: 300 - Precio: Q3.00

Total: Q 2,150.00
```

### Ver Detalle de un Ingreso

1. En la tabla de ingresos, haga clic en el icono de **ojo** (👁️)
2. Se abrirá un cuadro de diálogo con:
   - Información del proveedor
   - Tipo y fecha del ingreso
   - Factura
   - Usuario que registró
   - Tabla detallada de todos los medicamentos
   - Total del ingreso

### Imprimir Ingreso

Desde el detalle del ingreso:
1. Haga clic en **"Imprimir"**
2. Se abrirá la vista de impresión del navegador
3. Seleccione su impresora
4. Ajuste las opciones de impresión
5. Imprima o guarde como PDF

---

## 📋 MÓDULO REQUISICIONES

Las requisiciones son solicitudes de medicamentos que realizan enfermeras y médicos de los diferentes servicios del hospital a la farmacia.

> 💡 **IMPORTANTE:** Este módulo está diseñado para personal de enfermería y médicos de los servicios, permitiendo solicitar medicamentos para múltiples pacientes de forma organizada.

### Flujo de una Requisición

```
1. Solicitud → 2. Autorización → 3. Preparación → 4. Entrega → 5. Cerrada
```

**Estados posibles:**
- **Pendiente:** Recién creada, esperando autorización de farmacia
- **Autorizada:** Aprobada por farmacéutico, lista para preparar
- **Entregada:** Medicamentos entregados al servicio
- **Rechazada:** No autorizada
- **Cancelada:** Anulada antes de ser entregada

### Ver Lista de Requisiciones

1. En el menú lateral, haga clic en **"Requisiciones"**
2. Verá todas las requisiciones ordenadas por fecha

**Columnas de la tabla:**
- **ID:** Número de requisición
- **Servicio:** Departamento solicitante (Ej: Emergencia, Pediatría)
- **Paciente:** Número de cama y nombre del paciente
- **Fecha y Hora Solicitud:** Cuándo se creó
- **Prioridad:** Normal o Urgente
- **Estado:** Pendiente, Autorizada, Entregada, etc.
- **Usuario Solicita:** Quién la creó (enfermera/médico)
- **Total Items:** Cantidad de medicamentos
- **Acciones:** Ver, Aprobar, Entregar, Anular

### Filtrar Requisiciones

Use los filtros en la parte superior:

1. **Por Servicio:**
   - Seleccione un servicio específico
   - O "Todos" para ver todas

2. **Por Estado:**
   - Pendiente
   - Autorizada
   - Entregada
   - Todos

3. **Por Fecha:**
   - Fecha desde
   - Fecha hasta
   - Haga clic en "Buscar"

**Ejemplo de filtro:**
```
Servicio: Emergencia
Estado: Pendiente
Fecha: 01/11/2025 a 12/11/2025
```

### Crear Nueva Requisición (Formato Matriz)

El módulo de requisiciones utiliza un formato de **matriz similar al de consolidados**, diseñado específicamente para que enfermeras y médicos puedan solicitar medicamentos para múltiples pacientes de forma eficiente.

#### Paso 1: Datos Generales

1. Haga clic en **"Nueva Requisición"**

2. Complete el encabezado:

   | Campo | Descripción | Ejemplo |
   |-------|-------------|---------|
   | **Servicio** | Departamento que solicita | Encamamiento General |
   | **Fecha y Hora** | Cuándo se solicita | 19/11/2025 09:00 |
   | **Prioridad** | Normal o Urgente | Normal |
   | **Origen de Despacho** | De dónde se entregarán los medicamentos | General o Stock 24h |
   | **Observaciones** | Notas adicionales | Requisición turno matutino |

3. **Prioridad:**
   - **Normal:** Entrega en horario regular
   - **Urgente:** Requiere atención inmediata (aparece en rojo)

4. **Origen de Despacho:**
   - **General:** Los medicamentos se entregarán desde el almacén general de farmacia
   - **Stock 24h:** Solo para personal turnista - se entregarán desde el stock 24 horas del servicio

#### Paso 2: Agregar Medicamentos (Columnas)

Antes de registrar los pacientes, debe definir qué medicamentos van a solicitar:

1. **Use el buscador de medicamentos** en la parte superior

2. **Escriba el nombre del medicamento:**
   - Ejemplo: "Paracetamol"
   - Aparecerá una lista de opciones con presentaciones

3. **Seleccione el medicamento con su presentación:**
   ```
   Paracetamol 500mg Tableta x100
   ```

4. **El medicamento se agrega como una columna** en la tabla matriz

5. **Repita** para cada medicamento diferente que necesite solicitar

6. **Puede eliminar medicamentos** haciendo clic en la X de cada chip

**Ejemplo de medicamentos agregados:**
```
Columna 1: Paracetamol 500mg Tableta
Columna 2: Ibuprofeno 400mg Tableta
Columna 3: Omeprazol 20mg Cápsula
```

#### Paso 3: Agregar Pacientes y Cantidades (Filas)

Ahora verá una **tabla tipo matriz** donde:
- Cada **fila** es un paciente
- Cada **columna** es un medicamento
- Cada **celda** es la cantidad solicitada

Para cada paciente:

1. **Haga clic en "+ Agregar Paciente"**

2. **Complete los datos del paciente:**

   | Campo | Descripción | Ejemplo |
   |-------|-------------|---------|
   | **Número de Cama** | Cama del paciente | 101, 205A, UCI-3 |
   | **Nombre del Paciente** | Nombre completo | María López Pérez |

3. **Ingrese las cantidades** en cada celda:
   - Haga clic en la celda del medicamento
   - Ingrese la cantidad solicitada
   - Si no necesita ese medicamento, deje en 0 o vacío

4. **Puede eliminar pacientes** haciendo clic en el icono de papelera

**Ejemplo de matriz completa:**

| Cama | Paciente | Paracetamol | Ibuprofeno | Omeprazol |
|------|----------|-------------|------------|-----------|
| 101 | Juan Pérez | 3 | 2 | 0 |
| 102 | María López | 2 | 0 | 1 |
| 205A | Carlos Ruiz | 4 | 1 | 1 |

#### Paso 4: Revisar Totales

El sistema calcula automáticamente:
- **Total por medicamento** (suma de todos los pacientes)
- **Total general de unidades solicitadas**

Estos totales aparecen en la **última fila de la tabla** para que pueda verificar las cantidades antes de enviar.

**Ejemplo de totales:**
```
Paracetamol: 9 unidades (3+2+4)
Ibuprofeno: 3 unidades (2+0+1)
Omeprazol: 2 unidades (0+1+1)
Total general: 14 unidades
```

#### Paso 5: Guardar Requisición

1. **Revise todos los datos:**
   - Servicio correcto
   - Datos de pacientes completos
   - Cantidades correctas
   - Origen de despacho seleccionado

2. **Haga clic en "Guardar Requisición"**

**El sistema automáticamente:**
- Crea **UNA requisición POR CADA paciente** (no una sola)
- Cada requisición incluye:
  - Número de cama del paciente
  - Nombre del paciente
  - Lista de medicamentos con cantidades
  - Todos los datos del encabezado
- Todas quedan en estado "Pendiente"
- Se notifica a farmacia

**Resultado del ejemplo anterior:**
```
Se crearán 3 requisiciones:

REQ-001: Cama 101 - Juan Pérez
  - Paracetamol: 3
  - Ibuprofeno: 2

REQ-002: Cama 102 - María López
  - Paracetamol: 2
  - Omeprazol: 1

REQ-003: Cama 205A - Carlos Ruiz
  - Paracetamol: 4
  - Ibuprofeno: 1
  - Omeprazol: 1
```

> 💡 **VENTAJA:** Este formato permite a enfermeras y médicos solicitar medicamentos para todos sus pacientes en una sola operación, ahorrando tiempo y reduciendo errores.

### Ventajas del Formato Matriz

**Para enfermeras y médicos:**
- ✅ Solicitar para múltiples pacientes a la vez
- ✅ Vista clara de qué medicamentos necesita cada paciente
- ✅ Totales calculados automáticamente
- ✅ Menos tiempo en solicitudes

**Para farmacia:**
- ✅ Requisiciones organizadas por paciente
- ✅ Trazabilidad completa (cama + nombre)
- ✅ Preparación más eficiente
- ✅ Auditoría por paciente

### Aprobar una Requisición

**Rol requerido:** Farmacéutico o Administrador

1. En la lista de requisiciones, identifique una con estado "Pendiente"
2. Haga clic en el icono de **check** (✓) "Aprobar"
3. Revise los medicamentos solicitados
4. Puede modificar las cantidades autorizadas si es necesario
5. Agregue observaciones de autorización
6. Haga clic en "Autorizar"

**La requisición cambia a estado "Autorizada"**

### Entregar una Requisición

**Requisito:** La requisición debe estar "Autorizada"

1. Haga clic en el icono de **camión** (🚚) "Entregar"
2. Se abrirá el formulario de entrega
3. **Para cada medicamento:**
   - Seleccione el lote a entregar
   - Ingrese la cantidad entregada
   - El sistema valida que haya stock disponible

4. **Complete los datos de entrega:**
   - Fecha y hora de entrega (automática)
   - Observaciones de entrega
   - Quien recibe (opcional)

5. **Haga clic en "Confirmar Entrega"**

**El sistema automáticamente:**
- Descuenta del stock disponible
- Cambia el estado a "Entregada"
- Registra la fecha y hora de entrega
- Actualiza el kardex de movimientos

### Anular una Requisición

**Cuándo anular:** Si ya no se necesita o se creó por error

1. Haga clic en el icono de **X** "Anular"
2. Ingrese el motivo de anulación:
   ```
   "Paciente dado de alta - ya no necesita medicación"
   ```
3. Confirme la acción

> ⚠️ **NOTA:** Solo se pueden anular requisiciones en estado "Pendiente" o "Autorizada"

### Ver Detalle de una Requisición

1. Haga clic en el icono de **ojo** (👁️)
2. Se mostrará:
   - **Información General:**
     - Servicio solicitante
     - Datos del paciente (Cama y Nombre)
     - Fechas (solicitud, autorización, entrega)
     - Prioridad
     - Origen de despacho
     - Estados
   - **Personal Involucrado:**
     - Quién solicitó
     - Quién autorizó
     - Quién entregó
   - **Detalle de Medicamentos:**
     - Lista completa
     - Cantidades solicitadas vs entregadas
     - Lotes utilizados
   - **Observaciones:**
     - De solicitud
     - De autorización
     - De entrega

### Imprimir Requisición

Desde el detalle:
1. Haga clic en "Imprimir"
2. Se genera un documento con:
   - Datos completos de la requisición
   - Información del paciente (cama y nombre)
   - Lista de medicamentos
   - Firmas de responsables
   - Fecha y hora de impresión

---

## 🏥 MÓDULO CONSOLIDADOS

El módulo de Consolidados registra la administración de medicamentos a pacientes internados, organizados por cama. Este módulo es usado principalmente por personal de farmacia para llevar control detallado del consumo.

> 📝 **NOTA:** A diferencia del módulo de Requisiciones (usado por enfermeras/médicos para solicitar), el módulo de Consolidados es para registrar lo que realmente se administró a cada paciente durante un turno.

### ¿Qué es un Consolidado?

Un consolidado es un registro detallado de todos los medicamentos administrados a pacientes en un servicio durante un turno específico. Se utiliza para:
- Control de consumo por paciente
- Facturación de medicamentos
- Estadísticas de uso
- Auditoría de administraciones

**Características:**
- Organizado en forma de matriz (30 camas × N medicamentos)
- Registra fecha, hora y turno exacto
- Identifica cada paciente por cama
- Totaliza consumo por medicamento

### Ver Lista de Consolidados

1. En el menú lateral, haga clic en **"Consolidados"**
2. Verá todos los consolidados registrados

**Columnas de la tabla:**
- **ID:** Número de consolidado
- **Servicio:** Departamento (Ej: Encamamiento, Maternidad)
- **Fecha y Hora:** Cuándo se realizó el consolidado
- **Turno:** Diurno o Nocturno
- **Total Medicamentos:** Cantidad total administrada
- **Estado:** Activo, Cerrado, Anulado
- **Acciones:** Ver detalle, Cerrar, Anular

### Filtrar Consolidados

Use los filtros disponibles:

1. **Por Servicio:**
   - Seleccione el servicio hospitalario

2. **Por Fecha:**
   - Fecha desde
   - Fecha hasta

3. **Por Estado:**
   - Activo
   - Cerrado
   - Anulado

4. **Por Turno:**
   - Diurno (6:00 AM - 6:00 PM)
   - Nocturno (6:00 PM - 6:00 AM)

### Crear Nuevo Consolidado

#### Paso 1: Información del Consolidado

1. Haga clic en **"Nuevo Consolidado"**

2. Complete el encabezado:

   | Campo | Descripción | Ejemplo |
   |-------|-------------|---------|
   | **Servicio** | Departamento | Encamamiento General |
   | **Fecha y Hora** | Momento del consolidado | 12/11/2025 14:00 |
   | **Turno** | Diurno o Nocturno | Diurno |
   | **Encargado** | Nombre del responsable | Ana García |
   | **Observaciones** | Notas adicionales | Consolidado turno matutino |

#### Paso 2: Agregar Medicamentos (Columnas)

Antes de llenar las camas, debe definir qué medicamentos se van a registrar:

1. **Haga clic en "+ Agregar Medicamento"**
2. **Busque y seleccione el medicamento:**
   - Escriba el nombre
   - Seleccione de la lista
   - Ejemplo: "Paracetamol 500mg Tableta"

3. **El medicamento se agrega como una columna** en la tabla

4. **Repita** para cada medicamento diferente que se administró

**Ejemplo de medicamentos:**
```
Columna 1: Paracetamol 500mg
Columna 2: Ibuprofeno 400mg
Columna 3: Omeprazol 20mg
```

#### Paso 3: Llenar Datos por Cama

Ahora verá una tabla con:
- **30 filas** (una por cada cama)
- **Columnas** para cada medicamento agregado

Para cada cama ocupada:

1. **Número de Cama:** Ya viene numerado (1-30)

2. **Nombre del Paciente:**
   ```
   Ejemplo: María López
   ```

3. **Registro Médico:**
   ```
   Ejemplo: REG-2025-1234
   ```

4. **Cantidades por Medicamento:**
   - Ingrese cuántas unidades se administraron de cada medicamento
   - Si no se administró, deje en blanco o 0
   - Puede usar decimales: 0.5, 1.5, etc.

**Ejemplo de fila:**
```
Cama 1 | Juan Pérez | REG-001 | Paracetamol: 2 | Ibuprofeno: 1 | Omeprazol: 0
Cama 2 | María López | REG-002 | Paracetamol: 3 | Ibuprofeno: 0 | Omeprazol: 1
Cama 3 | Vacía | - | - | - | -
```

#### Paso 4: Revisar Totales

El sistema calcula automáticamente:
- **Total por medicamento** (suma de todas las camas)
- **Total general de unidades administradas**
- **Costo total estimado** (si hay precios registrados)

Estos totales aparecen en la última fila de la tabla.

#### Paso 5: Guardar Consolidado

1. **Revise todos los datos**
2. **Verifique que no haya errores en las cantidades**
3. **Haga clic en "Guardar Consolidado"**

El sistema:
- Guarda el consolidado en estado "Activo"
- Descuenta del stock 24h (si aplica)
- Registra fecha y hora exacta
- Asigna un número de consolidado

### Ver Detalle de un Consolidado

1. En la lista, haga clic en el icono de **ojo** (👁️)
2. Se mostrará:
   - **Información del Consolidado:**
     - Servicio
     - Fecha y hora exacta
     - Turno
     - Usuario que lo creó
     - Estado actual
   - **Matriz de Administraciones:**
     - Tabla completa cama por cama
     - Pacientes identificados
     - Cantidades por medicamento
   - **Totales:**
     - Total por medicamento
     - Total de unidades
     - Costo total
     - Camas ocupadas

### Cerrar un Consolidado

**¿Cuándo cerrar?** Cuando ya no se van a hacer más modificaciones

1. En la lista, localice el consolidado en estado "Activo"
2. Haga clic en el icono de **candado** (🔒) "Cerrar"
3. Confirme la acción

**Efectos:**
- El consolidado cambia a estado "Cerrado"
- Ya no se puede editar
- Queda registrado para auditoría
- Se registra fecha y hora de cierre

### Anular un Consolidado

**¿Cuándo anular?** Si se cometió un error y necesita rehacerlo

1. Haga clic en el icono de **X** "Anular"
2. Ingrese el motivo:
   ```
   "Error en cantidades - se volverá a registrar"
   ```
3. Confirme

**Efectos:**
- El consolidado cambia a "Anulado"
- Reversa los descuentos de stock
- Queda en el historial con el motivo

### Imprimir Consolidado

Desde el detalle:
1. Haga clic en "Imprimir"
2. Se genera un documento con:
   - Encabezado del consolidado
   - Tabla completa de administraciones
   - Totales
   - Firmas de responsables

---

## ⏰ MÓDULO STOCK 24 HORAS

El Stock 24 Horas es un sistema especial para servicios críticos que requieren medicamentos disponibles de forma inmediata.

### ¿Qué es el Stock 24h?

Es un inventario exclusivo que se mantiene en ciertos servicios (Emergencia, UCI, Quirófano) para garantizar disponibilidad inmediata de medicamentos críticos sin necesitar requisiciones.

**Características:**
- Stock separado del almacén general
- Reposición diaria o cuando sea necesario
- Control estricto de entrada y salida
- Cuadre de turnos

### Servicios con Stock 24h

Solo algunos servicios cuentan con este sistema:
- ✅ Emergencia
- ✅ UCI (Unidad de Cuidados Intensivos)
- ✅ Quirófano
- ✅ Sala de Partos

### Ver Stock Actual

1. En el menú lateral, haga clic en **"Stock 24h"**
2. Seleccione el servicio
3. Verá una tabla con:
   - Medicamento
   - Presentación
   - Cantidad actual
   - Stock mínimo
   - Stock máximo
   - Estado (Normal, Bajo, Crítico)

**Colores de alerta:**
- 🟢 **Verde:** Stock normal (entre mínimo y máximo)
- 🟡 **Amarillo:** Stock bajo (cerca del mínimo)
- 🔴 **Rojo:** Stock crítico (por debajo del mínimo)

### Registrar Reposición de Stock

**¿Cuándo hacer una reposición?** 
- Al inicio de turno
- Cuando se detecta stock bajo
- Según protocolo del servicio

#### Proceso de Reposición:

1. **Haga clic en "Nueva Reposición"**

2. **Complete los datos:**

   | Campo | Descripción | Ejemplo |
   |-------|-------------|---------|
   | **Servicio** | Automático según selección | Emergencia |
   | **Fecha y Hora** | Momento de la reposición | 12/11/2025 06:00 |
   | **Usuario Entrega** | Quién entrega desde farmacia | Farmacéutico |
   | **Usuario Recibe** | Quién recibe en el servicio | Enfermera |
   | **Observaciones** | Notas | Reposición de turno |

3. **Agregar Medicamentos:**
   - Para cada medicamento:
     - Seleccione el medicamento
     - Seleccione el lote
     - Ingrese cantidad entregada
     - El sistema valida stock disponible

4. **Guardar Reposición**

**El sistema automáticamente:**
- Descuenta del almacén general
- Suma al stock 24h del servicio
- Registra el movimiento
- Actualiza totales

### Cuadre de Turno

El cuadre es un conteo físico que se realiza al cambio de turno para verificar que el stock registrado coincida con el stock real.

#### Realizar un Cuadre:

1. **Haga clic en "Nuevo Cuadre"**

2. **Datos del cuadre:**
   - Servicio
   - Fecha y hora
   - Turno saliente
   - Turno entrante
   - Usuarios responsables

3. **Para cada medicamento del stock 24h:**
   - **Stock Sistema:** Cantidad según sistema
   - **Stock Físico:** Cantidad real contada
   - **Diferencia:** Se calcula automáticamente
   - **Observaciones:** Explicar diferencias

4. **Tipos de diferencia:**
   - **Sobrante (+):** Hay más de lo registrado (revisar ingresos no registrados)
   - **Faltante (-):** Hay menos de lo registrado (revisar consumos no registrados)
   - **Sin diferencia (0):** Coincide perfectamente ✅

5. **Ajustes:**
   - Si hay diferencias, indique el motivo
   - El sistema ajustará el stock al valor físico
   - Se genera un registro de ajuste

6. **Firmas:**
   - Usuario que entrega turno
   - Usuario que recibe turno
   - Supervisor (si aplica)

7. **Guardar Cuadre**

### Ver Historial de Movimientos

Para auditar el stock 24h:

1. Seleccione el servicio
2. Haga clic en "Historial"
3. Filtre por:
   - Tipo de movimiento (Reposición, Consumo, Ajuste)
   - Fecha
   - Medicamento

4. Exportar a Excel o PDF para reportes

---

## ❓ PREGUNTAS FRECUENTES

### General

**P: ¿Puedo usar el sistema desde mi celular?**  
R: Sí, el sistema es responsive y se adapta a dispositivos móviles. Sin embargo, para crear registros complejos (consolidados, ingresos) se recomienda usar una computadora.

**P: ¿El sistema funciona sin internet?**  
R: No, el sistema requiere conexión a internet o a la red interna del hospital.

**P: ¿Cómo cambio mi contraseña?**  
R: Contacte al administrador del sistema. Por seguridad, los usuarios no pueden cambiar sus propias contraseñas.

### Insumos

**P: ¿Cuál es la diferencia entre clasificación y subclasificación?**  
R: La **clasificación** es la categoría general (VIH, Anticonceptivos, Básico) y la **subclasificación** indica cómo se distribuye (Requisición o Receta).

**P: ¿Puedo tener un medicamento sin clasificación?**  
R: No, todos los medicamentos deben tener una clasificación. Por defecto se asigna "Listado Básico".

### Ingresos

**P: ¿Qué hago si me equivoqué en un ingreso?**  
R: Los ingresos guardados no se pueden editar. Debe crear un ingreso de tipo "Devolución" para corregir.

**P: ¿Puedo ingresar medicamentos vencidos?**  
R: El sistema permite ingresar lotes con cualquier fecha de vencimiento, pero mostrará alertas para lotes próximos a vencer o vencidos.

**P: ¿Qué pasa si ingreso con precio 0?**  
R: Es válido para donaciones o muestras médicas. El reporte de costos mostrará Q0.00.

### Requisiciones

**P: ¿Cuál es la diferencia entre Requisiciones y Consolidados?**  
R: Las **Requisiciones** son solicitudes de medicamentos que hacen enfermeras/médicos ANTES de administrar (formato matriz para múltiples pacientes). Los **Consolidados** son registros de lo que YA se administró, usados por farmacia para control y facturación.

**P: ¿Por qué el sistema crea una requisición por cada paciente?**  
R: Aunque uses el formato matriz para agilizar el proceso, cada paciente necesita su propia requisición para trazabilidad, autorización individual y control de stock por paciente.

**P: ¿Puedo modificar una requisición después de crearla?**  
R: Las requisiciones en estado "Pendiente" pueden ser anuladas y creadas nuevamente. Las que ya fueron autorizadas o entregadas no se pueden modificar.

**P: ¿Qué diferencia hay entre "Urgente" y "Normal"?**  
R: Es solo visual para priorizar. Las requisiciones urgentes aparecen destacadas en rojo y deben atenderse primero.

**P: ¿Puedo entregar menos cantidad de la solicitada?**  
R: Sí, al momento de entregar puede modificar las cantidades según disponibilidad de stock.

**P: ¿Qué pasa si dejo celdas vacías en la matriz?**  
R: Solo se incluirán en la requisición los medicamentos con cantidad mayor a 0. Las celdas vacías o con 0 se ignoran automáticamente.

**P: ¿Debo llenar "Número de Cama" obligatoriamente?**  
R: No es obligatorio, pero es altamente recomendado para trazabilidad. Al menos uno de los dos (cama o nombre) debe estar presente.

**P: ¿Cuándo uso "General" vs "Stock 24h" en origen de despacho?**  
R: **General**: para medicamentos del almacén principal (disponible para todos). **Stock 24h**: solo para personal turnista, medicamentos del stock local del servicio (Emergencia, UCI, etc.).

### Consolidados

**P: ¿Qué pasa si una cama está vacía?**  
R: Simplemente deje la fila en blanco. Solo llene las camas ocupadas.

**P: ¿Puedo usar decimales en las cantidades?**  
R: Sí, puede ingresar 0.5, 1.5, 2.25, etc. para tabletas partidas o ampollas parciales.

**P: ¿Cómo corrijo un error en un consolidado cerrado?**  
R: Los consolidados cerrados no se pueden editar. Debe anularlo y crear uno nuevo.

**P: ¿El consolidado descuenta del stock general?**  
R: Solo descuenta del stock 24h si el servicio tiene stock propio. Si no, es solo un registro de administración.

### Stock 24h

**P: ¿Qué hago si encuentro diferencias en el cuadre?**  
R: Investigue la causa (administraciones no registradas, robos, derrames), documente en observaciones y ajuste al stock físico real.

**P: ¿Con qué frecuencia debo hacer cuadres?**  
R: Se recomienda al menos dos veces al día (cambio de turno). En servicios críticos puede ser más frecuente.

**P: ¿Puedo hacer una reposición parcial?**  
R: Sí, no es necesario reponer todo al stock máximo. Puede reponer solo lo que necesite o lo que esté disponible.

---

## 📞 SOPORTE TÉCNICO

### ¿Necesita Ayuda?

**Administrador del Sistema:**
- Nombre: [Configurar]
- Teléfono: [Configurar]
- Email: [Configurar]
- Horario: Lunes a Viernes, 8:00 AM - 5:00 PM

### Reportar un Problema

Si encuentra un error en el sistema:

1. **Tome una captura de pantalla** del error
2. **Anote los pasos** que realizó antes del error
3. **Contacte al administrador** con:
   - Descripción del problema
   - Capturas de pantalla
   - Fecha y hora del incidente
   - Su nombre de usuario

### Solicitar Capacitación

Para capacitación adicional o repaso de módulos específicos, contacte al departamento de TI del hospital.

---

## 📋 ANEXOS

### Glosario de Términos

| Término | Definición |
|---------|------------|
| **Insumo** | Medicamento o material médico |
| **Lote** | Conjunto de productos fabricados en la misma fecha |
| **Stock** | Cantidad disponible en inventario |
| **Requisición** | Solicitud de medicamentos de un servicio |
| **Consolidado** | Registro de administración de medicamentos |
| **Cuadre** | Conteo físico del inventario |

### Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl + S` | Guardar formulario (algunos navegadores) |
| `Esc` | Cerrar diálogo |
| `Tab` | Navegar entre campos |
| `Ctrl + P` | Imprimir |

---

**Fin del Manual de Usuario**

*Versión 1.0 - Noviembre 2025*  
*Sistema de Farmacia Hospitalaria*

---

> 💡 **NOTA:** Este manual se actualiza periódicamente. Consulte con el administrador del sistema para obtener la versión más reciente.
