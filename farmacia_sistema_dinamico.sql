--
-- Sistema de Gestión de Farmacia - Versión con Ingreso Dinámico de Medicamentos
-- PostgreSQL Database
-- Modificado para permitir registro de medicamentos en el momento del ingreso
--

-- ============================================================================
-- CONFIGURACIÓN INICIAL
-- ============================================================================

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;
COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';

-- ============================================================================
-- TIPOS ENUMERADOS
-- ============================================================================

CREATE TYPE rol_usuario AS ENUM (
    'administrador',
    'farmaceutico',
    'asistente',
    'bodeguero',
    'turnista'
);

CREATE TYPE tipo_movimiento AS ENUM (
    'entrada',
    'salida',
    'ajuste',
    'traslado'
);

CREATE TYPE tipo_turno AS ENUM (
    '24_horas',
    'diurno',
    'bodega',
    'administrativo'
);

CREATE TYPE estado_requisicion AS ENUM (
    'pendiente',
    'aprobada',
    'entregada',
    'rechazada',
    'cancelada'
);

CREATE TYPE prioridad_requisicion AS ENUM (
    'urgente',
    'normal',
    'baja'
);

CREATE TYPE origen_movimiento AS ENUM (
    'ingreso_compra',
    'ingreso_devolucion',
    'salida_consolidado',
    'salida_requisicion',
    'reposicion_stock',
    'ajuste_inventario',
    'transferencia'
);

CREATE TYPE tipo_documento_enum AS ENUM (
    'RECETA',
    'REQUISICIÓN'
);

-- ============================================================================
-- TABLAS CATÁLOGO (Precargar datos básicos)
-- ============================================================================

-- Tabla: unidad_medida
CREATE TABLE unidad_medida (
    id_unidad_medida SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    abreviatura VARCHAR(10) NOT NULL UNIQUE,
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE unidad_medida IS 'Catálogo de unidades de medida (ml, g, mg, etc.)';

-- Tabla: presentacion
CREATE TABLE presentacion (
    id_presentacion SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE presentacion IS 'Catálogo de presentaciones (frasco, ampolla, tableta, etc.)';

-- ============================================================================
-- TABLAS PRINCIPALES - MEDICAMENTOS/INSUMOS
-- ============================================================================

-- Tabla: insumo (Medicamentos - SE REGISTRAN DINÁMICAMENTE)
CREATE TABLE insumo (
    id_insumo SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    stock_minimo NUMERIC(10,2) DEFAULT 0,
    dias_alerta_vencimiento INTEGER DEFAULT 30,
    requiere_stock_24h BOOLEAN DEFAULT FALSE,
    tipo_documento tipo_documento_enum DEFAULT 'RECETA',
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_nombre_insumo UNIQUE (nombre)
);

COMMENT ON TABLE insumo IS 'Tabla de medicamentos/insumos - Se registran al momento del primer ingreso';
COMMENT ON COLUMN insumo.nombre IS 'Nombre del medicamento (ej: Acetaminofén (Paracetamol))';
COMMENT ON COLUMN insumo.requiere_stock_24h IS 'Indica si el medicamento debe estar en el stock de 24 horas';
COMMENT ON COLUMN insumo.tipo_documento IS 'Tipo de documento requerido para dispensar: RECETA o REQUISICIÓN';

-- Tabla: insumo_presentacion
CREATE TABLE insumo_presentacion (
    id_insumo_presentacion SERIAL PRIMARY KEY,
    id_insumo INTEGER NOT NULL REFERENCES insumo(id_insumo) ON UPDATE CASCADE ON DELETE RESTRICT,
    id_presentacion INTEGER NOT NULL REFERENCES presentacion(id_presentacion) ON UPDATE CASCADE ON DELETE RESTRICT,
    id_unidad_medida INTEGER NOT NULL REFERENCES unidad_medida(id_unidad_medida) ON UPDATE CASCADE ON DELETE RESTRICT,
    cantidad_presentacion NUMERIC(10,2) NOT NULL CHECK (cantidad_presentacion > 0),
    precio_unitario NUMERIC(10,2) DEFAULT 0 CHECK (precio_unitario >= 0),
    codigo_barras VARCHAR(50) UNIQUE,
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_insumo_presentacion UNIQUE (id_insumo, id_presentacion, id_unidad_medida, cantidad_presentacion)
);

COMMENT ON TABLE insumo_presentacion IS 'Combinaciones de medicamento + presentación + unidad de medida';
COMMENT ON COLUMN insumo_presentacion.cantidad_presentacion IS 'Cantidad de unidades en la presentación (ej: 100 ml en un frasco)';
COMMENT ON COLUMN insumo_presentacion.precio_unitario IS 'Precio por unidad de presentación';

-- ============================================================================
-- TABLAS DE PERSONAL Y USUARIOS
-- ============================================================================

-- Tabla: personal
CREATE TABLE personal (
    id_personal SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    dpi VARCHAR(20) UNIQUE,
    cargo VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    direccion TEXT,
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE personal IS 'Personal del hospital';

-- Tabla: usuario
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    id_personal INTEGER NOT NULL UNIQUE REFERENCES personal(id_personal) ON UPDATE CASCADE ON DELETE CASCADE,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol rol_usuario DEFAULT 'asistente',
    tipo_turno tipo_turno,
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_login TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE usuario IS 'Usuarios del sistema con credenciales de acceso';

-- ============================================================================
-- TABLAS DE PROVEEDORES Y SERVICIOS
-- ============================================================================

-- Tabla: proveedor
CREATE TABLE proveedor (
    id_proveedor SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    nit VARCHAR(20) UNIQUE,
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT,
    contacto_principal VARCHAR(200),
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE proveedor IS 'Proveedores de medicamentos e insumos';

-- Tabla: servicio
CREATE TABLE servicio (
    id_servicio SERIAL PRIMARY KEY,
    nombre_servicio VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    requiere_stock_24h BOOLEAN DEFAULT FALSE,
    numero_camas INTEGER DEFAULT 0,
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE servicio IS 'Servicios médicos del hospital';

-- ============================================================================
-- TABLAS DE INVENTARIO Y STOCK
-- ============================================================================

-- Tabla: lote_inventario
CREATE TABLE lote_inventario (
    id_lote SERIAL PRIMARY KEY,
    id_insumo_presentacion INTEGER NOT NULL REFERENCES insumo_presentacion(id_insumo_presentacion) ON UPDATE CASCADE ON DELETE RESTRICT,
    numero_lote VARCHAR(50) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    cantidad_actual NUMERIC(10,2) DEFAULT 0 CHECK (cantidad_actual >= 0),
    precio_lote NUMERIC(10,2) NOT NULL CHECK (precio_lote >= 0),
    fecha_ingreso DATE NOT NULL,
    id_proveedor INTEGER REFERENCES proveedor(id_proveedor) ON UPDATE CASCADE ON DELETE RESTRICT,
    observaciones TEXT,
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_lote_insumo UNIQUE (id_insumo_presentacion, numero_lote)
);

COMMENT ON TABLE lote_inventario IS 'Control de inventario por lote, vencimiento y precio';
COMMENT ON COLUMN lote_inventario.cantidad_actual IS 'Cantidad disponible actual del lote';
COMMENT ON COLUMN lote_inventario.precio_lote IS 'Precio de compra del medicamento en este lote';

-- Índices para búsqueda eficiente
CREATE INDEX idx_lote_vencimiento ON lote_inventario(fecha_vencimiento) WHERE estado = TRUE;
CREATE INDEX idx_lote_insumo ON lote_inventario(id_insumo_presentacion) WHERE estado = TRUE;

-- Tabla: stock_24_horas
CREATE TABLE stock_24_horas (
    id_stock_24h SERIAL PRIMARY KEY,
    id_insumo_presentacion INTEGER NOT NULL REFERENCES insumo_presentacion(id_insumo_presentacion) ON UPDATE CASCADE ON DELETE RESTRICT,
    cantidad_fija NUMERIC(10,2) NOT NULL CHECK (cantidad_fija > 0),
    stock_actual NUMERIC(10,2) DEFAULT 0 CHECK (stock_actual >= 0),
    ultima_reposicion TIMESTAMP,
    observaciones TEXT,
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_stock_24h_insumo UNIQUE (id_insumo_presentacion)
);

COMMENT ON TABLE stock_24_horas IS 'Stock de 24 horas - Medicamentos para turno nocturno';
COMMENT ON COLUMN stock_24_horas.cantidad_fija IS 'Cantidad que debe mantenerse en stock';
COMMENT ON COLUMN stock_24_horas.stock_actual IS 'Cantidad disponible actualmente';

-- ============================================================================
-- TABLAS DE INGRESO (COMPRAS Y DEVOLUCIONES)
-- ============================================================================

-- Tabla: ingreso
CREATE TABLE ingreso (
    id_ingreso SERIAL PRIMARY KEY,
    id_proveedor INTEGER NOT NULL REFERENCES proveedor(id_proveedor) ON UPDATE CASCADE ON DELETE RESTRICT,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT,
    numero_factura VARCHAR(50),
    fecha_ingreso DATE NOT NULL,
    tipo_ingreso VARCHAR(20) DEFAULT 'COMPRA' CHECK (tipo_ingreso IN ('COMPRA', 'DEVOLUCION')),
    subtotal NUMERIC(10,2) DEFAULT 0,
    igv NUMERIC(10,2) DEFAULT 0,
    total NUMERIC(10,2) DEFAULT 0,
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE ingreso IS 'Ingresos de medicamentos por compra o devolución';
COMMENT ON COLUMN ingreso.tipo_ingreso IS 'COMPRA: ingreso por proveedor, DEVOLUCION: retorno desde servicios';

-- Tabla: detalle_ingreso
CREATE TABLE detalle_ingreso (
    id_detalle_ingreso SERIAL PRIMARY KEY,
    id_ingreso INTEGER NOT NULL REFERENCES ingreso(id_ingreso) ON UPDATE CASCADE ON DELETE CASCADE,
    id_insumo_presentacion INTEGER NOT NULL REFERENCES insumo_presentacion(id_insumo_presentacion) ON UPDATE CASCADE ON DELETE RESTRICT,
    cantidad NUMERIC(10,2) NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0),
    lote VARCHAR(50) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    subtotal NUMERIC(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    observaciones TEXT
);

COMMENT ON TABLE detalle_ingreso IS 'Detalle de cada medicamento ingresado con su lote y vencimiento';

-- ============================================================================
-- TABLAS DE SALIDAS Y DISTRIBUCIÓN
-- ============================================================================

-- Tabla: consolidado (Boleta de turnista 24h)
CREATE TABLE consolidado (
    id_consolidado SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT,
    id_servicio INTEGER NOT NULL REFERENCES servicio(id_servicio) ON UPDATE CASCADE ON DELETE RESTRICT,
    fecha_consolidado DATE NOT NULL,
    turno tipo_turno NOT NULL,
    total_medicamentos INTEGER DEFAULT 0,
    costo_total NUMERIC(10,2) DEFAULT 0,
    observaciones TEXT,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'cerrado', 'anulado')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMP
);

COMMENT ON TABLE consolidado IS 'Boletas de distribución de medicamentos por turno';

-- Tabla: detalle_consolidado
CREATE TABLE detalle_consolidado (
    id_detalle_consolidado SERIAL PRIMARY KEY,
    id_consolidado INTEGER NOT NULL REFERENCES consolidado(id_consolidado) ON UPDATE CASCADE ON DELETE CASCADE,
    id_insumo_presentacion INTEGER NOT NULL REFERENCES insumo_presentacion(id_insumo_presentacion) ON UPDATE CASCADE ON DELETE RESTRICT,
    id_lote INTEGER REFERENCES lote_inventario(id_lote) ON UPDATE CASCADE ON DELETE RESTRICT,
    numero_cama VARCHAR(10),
    nombre_paciente VARCHAR(200),
    numero_registro VARCHAR(50),
    cantidad NUMERIC(10,2) NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) DEFAULT 0,
    subtotal NUMERIC(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    observaciones TEXT
);

COMMENT ON TABLE detalle_consolidado IS 'Detalle de medicamentos distribuidos por paciente y cama';

-- Tabla: requisicion (Solicitudes de farmacéutico diurno)
CREATE TABLE requisicion (
    id_requisicion SERIAL PRIMARY KEY,
    id_servicio INTEGER NOT NULL REFERENCES servicio(id_servicio) ON UPDATE CASCADE ON DELETE RESTRICT,
    id_usuario_solicita INTEGER NOT NULL REFERENCES usuario(id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT,
    id_usuario_autoriza INTEGER REFERENCES usuario(id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT,
    id_usuario_entrega INTEGER REFERENCES usuario(id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT,
    fecha_solicitud DATE NOT NULL,
    fecha_autorizacion DATE,
    fecha_entrega DATE,
    estado estado_requisicion DEFAULT 'pendiente',
    prioridad prioridad_requisicion DEFAULT 'normal',
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE requisicion IS 'Requisiciones de medicamentos de servicios a farmacia';

-- Tabla: detalle_requisicion
CREATE TABLE detalle_requisicion (
    id_detalle_requisicion SERIAL PRIMARY KEY,
    id_requisicion INTEGER NOT NULL REFERENCES requisicion(id_requisicion) ON UPDATE CASCADE ON DELETE CASCADE,
    id_insumo_presentacion INTEGER NOT NULL REFERENCES insumo_presentacion(id_insumo_presentacion) ON UPDATE CASCADE ON DELETE RESTRICT,
    id_lote INTEGER REFERENCES lote_inventario(id_lote) ON UPDATE CASCADE ON DELETE RESTRICT,
    cantidad_solicitada NUMERIC(10,2) NOT NULL CHECK (cantidad_solicitada > 0),
    cantidad_autorizada NUMERIC(10,2) DEFAULT 0 CHECK (cantidad_autorizada >= 0),
    cantidad_entregada NUMERIC(10,2) DEFAULT 0 CHECK (cantidad_entregada >= 0),
    precio_unitario NUMERIC(10,2) DEFAULT 0,
    observaciones TEXT
);

-- ============================================================================
-- TABLA DE REPOSICIÓN DE STOCK 24H
-- ============================================================================

CREATE TABLE reposicion_stock_24h (
    id_reposicion SERIAL PRIMARY KEY,
    id_usuario_entrega INTEGER NOT NULL REFERENCES usuario(id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT,
    id_usuario_recibe INTEGER NOT NULL REFERENCES usuario(id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT,
    fecha_reposicion DATE NOT NULL,
    hora_reposicion TIME DEFAULT CURRENT_TIME,
    observaciones TEXT,
    estado VARCHAR(20) DEFAULT 'completado',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE reposicion_stock_24h IS 'Registro de reposiciones diarias del stock de 24 horas';

CREATE TABLE detalle_reposicion_stock (
    id_detalle_reposicion SERIAL PRIMARY KEY,
    id_reposicion INTEGER NOT NULL REFERENCES reposicion_stock_24h(id_reposicion) ON UPDATE CASCADE ON DELETE CASCADE,
    id_insumo_presentacion INTEGER NOT NULL REFERENCES insumo_presentacion(id_insumo_presentacion) ON UPDATE CASCADE ON DELETE RESTRICT,
    id_lote INTEGER REFERENCES lote_inventario(id_lote) ON UPDATE CASCADE ON DELETE RESTRICT,
    cantidad_debe_haber NUMERIC(10,2) NOT NULL,
    cantidad_actual NUMERIC(10,2) NOT NULL,
    cantidad_salio NUMERIC(10,2) GENERATED ALWAYS AS (cantidad_debe_haber - cantidad_actual) STORED,
    cantidad_reponer NUMERIC(10,2) NOT NULL,
    observaciones TEXT
);

COMMENT ON TABLE detalle_reposicion_stock IS 'Detalle de cada medicamento repuesto en el stock de 24h';

-- ============================================================================
-- TABLA DE HISTORIAL DE MOVIMIENTOS
-- ============================================================================

CREATE TABLE historial_movimientos (
    id_movimiento SERIAL PRIMARY KEY,
    id_insumo_presentacion INTEGER NOT NULL REFERENCES insumo_presentacion(id_insumo_presentacion) ON UPDATE CASCADE ON DELETE RESTRICT,
    id_lote INTEGER REFERENCES lote_inventario(id_lote) ON UPDATE CASCADE ON DELETE RESTRICT,
    tipo_movimiento tipo_movimiento NOT NULL,
    origen_movimiento origen_movimiento NOT NULL,
    cantidad NUMERIC(10,2) NOT NULL,
    precio_unitario NUMERIC(10,2) DEFAULT 0,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT,
    id_servicio INTEGER REFERENCES servicio(id_servicio) ON UPDATE CASCADE ON DELETE RESTRICT,
    referencia_id INTEGER,
    referencia_tabla VARCHAR(50),
    observaciones TEXT,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE historial_movimientos IS 'Registro histórico de todos los movimientos de inventario';

CREATE INDEX idx_movimientos_fecha ON historial_movimientos(fecha_movimiento);
CREATE INDEX idx_movimientos_insumo ON historial_movimientos(id_insumo_presentacion);
CREATE INDEX idx_movimientos_tipo ON historial_movimientos(tipo_movimiento);

-- ============================================================================
-- VISTAS PARA REPORTES Y CONSULTAS
-- ============================================================================

-- Vista: Inventario actual por medicamento
CREATE VIEW vista_inventario_actual AS
SELECT 
    i.id_insumo,
    i.nombre AS medicamento,
    p.nombre AS presentacion,
    ip.cantidad_presentacion,
    um.nombre AS unidad_medida,
    COALESCE(SUM(li.cantidad_actual), 0) AS stock_total,
    i.stock_minimo,
    CASE 
        WHEN COALESCE(SUM(li.cantidad_actual), 0) <= i.stock_minimo THEN 'CRÍTICO'
        WHEN COALESCE(SUM(li.cantidad_actual), 0) <= (i.stock_minimo * 1.5) THEN 'BAJO'
        ELSE 'NORMAL'
    END AS estado_stock,
    i.requiere_stock_24h,
    i.tipo_documento
FROM insumo i
INNER JOIN insumo_presentacion ip ON i.id_insumo = ip.id_insumo
INNER JOIN presentacion p ON ip.id_presentacion = p.id_presentacion
INNER JOIN unidad_medida um ON ip.id_unidad_medida = um.id_unidad_medida
LEFT JOIN lote_inventario li ON ip.id_insumo_presentacion = li.id_insumo_presentacion 
    AND li.estado = TRUE
WHERE i.estado = TRUE AND ip.estado = TRUE
GROUP BY i.id_insumo, i.nombre, p.nombre, ip.cantidad_presentacion, 
         um.nombre, i.stock_minimo, i.requiere_stock_24h, i.tipo_documento;

-- Vista: Lotes próximos a vencer
CREATE VIEW vista_lotes_proximos_vencer AS
SELECT 
    i.nombre AS medicamento,
    p.nombre AS presentacion,
    li.numero_lote,
    li.fecha_vencimiento,
    li.cantidad_actual,
    li.fecha_vencimiento - CURRENT_DATE AS dias_para_vencer,
    CASE 
        WHEN li.fecha_vencimiento < CURRENT_DATE THEN 'VENCIDO'
        WHEN li.fecha_vencimiento - CURRENT_DATE <= 30 THEN 'CRÍTICO'
        WHEN li.fecha_vencimiento - CURRENT_DATE <= 60 THEN 'ALERTA'
        ELSE 'NORMAL'
    END AS estado_vencimiento
FROM lote_inventario li
INNER JOIN insumo_presentacion ip ON li.id_insumo_presentacion = ip.id_insumo_presentacion
INNER JOIN insumo i ON ip.id_insumo = i.id_insumo
INNER JOIN presentacion p ON ip.id_presentacion = p.id_presentacion
WHERE li.estado = TRUE 
  AND li.cantidad_actual > 0
  AND li.fecha_vencimiento <= CURRENT_DATE + INTERVAL '90 days'
ORDER BY li.fecha_vencimiento;

-- Vista: Stock de 24 horas
CREATE VIEW vista_stock_24h AS
SELECT 
    i.nombre AS medicamento,
    p.nombre AS presentacion,
    s.cantidad_fija,
    s.stock_actual,
    s.cantidad_fija - s.stock_actual AS cantidad_a_reponer,
    CASE 
        WHEN s.stock_actual = 0 THEN 'AGOTADO'
        WHEN s.stock_actual < (s.cantidad_fija * 0.3) THEN 'CRÍTICO'
        WHEN s.stock_actual < (s.cantidad_fija * 0.5) THEN 'BAJO'
        ELSE 'NORMAL'
    END AS estado_stock,
    s.ultima_reposicion
FROM stock_24_horas s
INNER JOIN insumo_presentacion ip ON s.id_insumo_presentacion = ip.id_insumo_presentacion
INNER JOIN insumo i ON ip.id_insumo = i.id_insumo
INNER JOIN presentacion p ON ip.id_presentacion = p.id_presentacion
WHERE s.estado = TRUE;

-- Vista: Movimientos del día
CREATE VIEW vista_movimientos_dia AS
SELECT 
    DATE(hm.fecha_movimiento) AS fecha,
    i.nombre AS medicamento,
    p.nombre AS presentacion,
    hm.tipo_movimiento,
    hm.origen_movimiento,
    hm.cantidad,
    hm.precio_unitario,
    hm.cantidad * hm.precio_unitario AS costo_total,
    per.nombres || ' ' || per.apellidos AS usuario,
    s.nombre_servicio AS servicio
FROM historial_movimientos hm
INNER JOIN insumo_presentacion ip ON hm.id_insumo_presentacion = ip.id_insumo_presentacion
INNER JOIN insumo i ON ip.id_insumo = i.id_insumo
INNER JOIN presentacion p ON ip.id_presentacion = p.id_presentacion
INNER JOIN usuario u ON hm.id_usuario = u.id_usuario
INNER JOIN personal per ON u.id_personal = per.id_personal
LEFT JOIN servicio s ON hm.id_servicio = s.id_servicio
WHERE DATE(hm.fecha_movimiento) = CURRENT_DATE;

-- ============================================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================================

-- Función: Actualizar timestamps
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas principales
CREATE TRIGGER trigger_actualizar_insumo
    BEFORE UPDATE ON insumo
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_actualizar_presentacion
    BEFORE UPDATE ON presentacion
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_actualizar_unidad_medida
    BEFORE UPDATE ON unidad_medida
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_actualizar_personal
    BEFORE UPDATE ON personal
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_actualizar_usuario
    BEFORE UPDATE ON usuario
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

-- Función: Actualizar inventario al registrar ingreso
CREATE OR REPLACE FUNCTION actualizar_inventario_ingreso()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar o actualizar lote en inventario
    INSERT INTO lote_inventario (
        id_insumo_presentacion, 
        numero_lote, 
        fecha_vencimiento,
        cantidad_actual,
        precio_lote,
        fecha_ingreso,
        id_proveedor
    )
    SELECT 
        NEW.id_insumo_presentacion,
        NEW.lote,
        NEW.fecha_vencimiento,
        NEW.cantidad,
        NEW.precio_unitario,
        i.fecha_ingreso,
        i.id_proveedor
    FROM ingreso i
    WHERE i.id_ingreso = NEW.id_ingreso
    ON CONFLICT (id_insumo_presentacion, numero_lote) 
    DO UPDATE SET 
        cantidad_actual = lote_inventario.cantidad_actual + EXCLUDED.cantidad_actual;

    -- Registrar movimiento
    INSERT INTO historial_movimientos (
        id_insumo_presentacion,
        id_lote,
        tipo_movimiento,
        origen_movimiento,
        cantidad,
        precio_unitario,
        id_usuario,
        referencia_id,
        referencia_tabla
    )
    SELECT 
        NEW.id_insumo_presentacion,
        li.id_lote,
        'entrada'::tipo_movimiento,
        CASE 
            WHEN i.tipo_ingreso = 'DEVOLUCION' THEN 'ingreso_devolucion'::origen_movimiento
            ELSE 'ingreso_compra'::origen_movimiento
        END,
        NEW.cantidad,
        NEW.precio_unitario,
        i.id_usuario,
        NEW.id_ingreso,
        'detalle_ingreso'
    FROM ingreso i
    INNER JOIN lote_inventario li ON li.id_insumo_presentacion = NEW.id_insumo_presentacion 
        AND li.numero_lote = NEW.lote
    WHERE i.id_ingreso = NEW.id_ingreso;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_inventario_ingreso
    AFTER INSERT ON detalle_ingreso
    FOR EACH ROW EXECUTE FUNCTION actualizar_inventario_ingreso();

-- Función: Actualizar inventario al registrar salida (consolidado)
CREATE OR REPLACE FUNCTION actualizar_inventario_consolidado()
RETURNS TRIGGER AS $$
DECLARE
    v_lote_id INTEGER;
BEGIN
    -- Obtener lote con FIFO (First In, First Out)
    SELECT id_lote INTO v_lote_id
    FROM lote_inventario
    WHERE id_insumo_presentacion = NEW.id_insumo_presentacion
      AND cantidad_actual >= NEW.cantidad
      AND estado = TRUE
    ORDER BY fecha_vencimiento, fecha_ingreso
    LIMIT 1;

    IF v_lote_id IS NULL THEN
        RAISE EXCEPTION 'No hay stock suficiente para el medicamento';
    END IF;

    -- Actualizar cantidad en lote
    UPDATE lote_inventario
    SET cantidad_actual = cantidad_actual - NEW.cantidad
    WHERE id_lote = v_lote_id;

    -- Actualizar el detalle con el lote asignado
    UPDATE detalle_consolidado
    SET id_lote = v_lote_id
    WHERE id_detalle_consolidado = NEW.id_detalle_consolidado;

    -- Si es del stock de 24h, actualizar
    IF EXISTS (
        SELECT 1 FROM consolidado c
        INNER JOIN usuario u ON c.id_usuario = u.id_usuario
        WHERE c.id_consolidado = NEW.id_consolidado
          AND u.tipo_turno = '24_horas'
    ) THEN
        UPDATE stock_24_horas
        SET stock_actual = stock_actual - NEW.cantidad
        WHERE id_insumo_presentacion = NEW.id_insumo_presentacion;
    END IF;

    -- Registrar movimiento
    INSERT INTO historial_movimientos (
        id_insumo_presentacion,
        id_lote,
        tipo_movimiento,
        origen_movimiento,
        cantidad,
        precio_unitario,
        id_usuario,
        id_servicio,
        referencia_id,
        referencia_tabla
    )
    SELECT 
        NEW.id_insumo_presentacion,
        v_lote_id,
        'salida'::tipo_movimiento,
        'salida_consolidado'::origen_movimiento,
        NEW.cantidad,
        NEW.precio_unitario,
        c.id_usuario,
        c.id_servicio,
        NEW.id_consolidado,
        'detalle_consolidado'
    FROM consolidado c
    WHERE c.id_consolidado = NEW.id_consolidado;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_inventario_consolidado
    AFTER INSERT ON detalle_consolidado
    FOR EACH ROW EXECUTE FUNCTION actualizar_inventario_consolidado();

-- Función: Actualizar totales del consolidado
CREATE OR REPLACE FUNCTION actualizar_totales_consolidado()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE consolidado
    SET total_medicamentos = (
        SELECT COALESCE(SUM(cantidad), 0)
        FROM detalle_consolidado
        WHERE id_consolidado = NEW.id_consolidado
    ),
    costo_total = (
        SELECT COALESCE(SUM(subtotal), 0)
        FROM detalle_consolidado
        WHERE id_consolidado = NEW.id_consolidado
    )
    WHERE id_consolidado = NEW.id_consolidado;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_totales_consolidado
    AFTER INSERT OR UPDATE ON detalle_consolidado
    FOR EACH ROW EXECUTE FUNCTION actualizar_totales_consolidado();

-- ============================================================================
-- FUNCIÓN AUXILIAR: Registrar medicamento nuevo dinámicamente
-- ============================================================================

CREATE OR REPLACE FUNCTION registrar_medicamento_completo(
    p_nombre_medicamento VARCHAR,
    p_nombre_presentacion VARCHAR,
    p_cantidad_presentacion NUMERIC,
    p_nombre_unidad VARCHAR,
    p_abrev_unidad VARCHAR,
    p_stock_minimo NUMERIC DEFAULT 5,
    p_dias_alerta INTEGER DEFAULT 30,
    p_requiere_stock_24h BOOLEAN DEFAULT FALSE,
    p_tipo_documento VARCHAR DEFAULT 'RECETA',
    p_descripcion_presentacion TEXT DEFAULT NULL
) RETURNS TABLE (
    id_insumo_nuevo INTEGER,
    id_presentacion_nuevo INTEGER,
    id_unidad_nuevo INTEGER,
    id_insumo_presentacion_nuevo INTEGER
) AS $$
DECLARE
    v_id_insumo INTEGER;
    v_id_presentacion INTEGER;
    v_id_unidad INTEGER;
    v_id_insumo_presentacion INTEGER;
BEGIN
    -- 1. Verificar/crear unidad de medida
    INSERT INTO unidad_medida (nombre, abreviatura)
    VALUES (p_nombre_unidad, p_abrev_unidad)
    ON CONFLICT (nombre) DO NOTHING
    RETURNING id_unidad_medida INTO v_id_unidad;

    IF v_id_unidad IS NULL THEN
        SELECT id_unidad_medida INTO v_id_unidad
        FROM unidad_medida WHERE nombre = p_nombre_unidad;
    END IF;

    -- 2. Verificar/crear presentación
    INSERT INTO presentacion (nombre, descripcion)
    VALUES (p_nombre_presentacion, p_descripcion_presentacion)
    ON CONFLICT (nombre) DO NOTHING
    RETURNING id_presentacion INTO v_id_presentacion;

    IF v_id_presentacion IS NULL THEN
        SELECT id_presentacion INTO v_id_presentacion
        FROM presentacion WHERE nombre = p_nombre_presentacion;
    END IF;

    -- 3. Crear insumo (medicamento)
    INSERT INTO insumo (
        nombre, 
        stock_minimo, 
        dias_alerta_vencimiento,
        requiere_stock_24h,
        tipo_documento
    )
    VALUES (
        p_nombre_medicamento,
        p_stock_minimo,
        p_dias_alerta,
        p_requiere_stock_24h,
        p_tipo_documento::tipo_documento_enum
    )
    ON CONFLICT (nombre) DO NOTHING
    RETURNING id_insumo INTO v_id_insumo;

    IF v_id_insumo IS NULL THEN
        SELECT id_insumo INTO v_id_insumo
        FROM insumo WHERE nombre = p_nombre_medicamento;
    END IF;

    -- 4. Crear relación insumo-presentación
    INSERT INTO insumo_presentacion (
        id_insumo,
        id_presentacion,
        id_unidad_medida,
        cantidad_presentacion
    )
    VALUES (
        v_id_insumo,
        v_id_presentacion,
        v_id_unidad,
        p_cantidad_presentacion
    )
    ON CONFLICT ON CONSTRAINT unique_insumo_presentacion DO NOTHING
    RETURNING id_insumo_presentacion INTO v_id_insumo_presentacion;

    IF v_id_insumo_presentacion IS NULL THEN
        SELECT ip.id_insumo_presentacion INTO v_id_insumo_presentacion
        FROM insumo_presentacion ip
        WHERE ip.id_insumo = v_id_insumo
          AND ip.id_presentacion = v_id_presentacion
          AND ip.id_unidad_medida = v_id_unidad
          AND ip.cantidad_presentacion = p_cantidad_presentacion;
    END IF;

    RETURN QUERY SELECT v_id_insumo, v_id_presentacion, v_id_unidad, v_id_insumo_presentacion;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION registrar_medicamento_completo IS 
'Función para registrar un medicamento completo con su presentación y unidad de medida de forma dinámica';

-- ============================================================================
-- FUNCIONES DE REPORTE
-- ============================================================================

-- Función: Reporte de movimientos por período
CREATE OR REPLACE FUNCTION reporte_movimientos_periodo(
    p_fecha_inicio DATE,
    p_fecha_fin DATE,
    p_tipo_movimiento tipo_movimiento DEFAULT NULL
) RETURNS TABLE (
    fecha DATE,
    medicamento VARCHAR,
    presentacion VARCHAR,
    tipo_movimiento tipo_movimiento,
    origen origen_movimiento,
    cantidad NUMERIC,
    costo_unitario NUMERIC,
    costo_total NUMERIC,
    usuario VARCHAR,
    servicio VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(hm.fecha_movimiento),
        i.nombre,
        p.nombre,
        hm.tipo_movimiento,
        hm.origen_movimiento,
        hm.cantidad,
        hm.precio_unitario,
        hm.cantidad * hm.precio_unitario,
        per.nombres || ' ' || per.apellidos,
        COALESCE(s.nombre_servicio, 'N/A')
    FROM historial_movimientos hm
    INNER JOIN insumo_presentacion ip ON hm.id_insumo_presentacion = ip.id_insumo_presentacion
    INNER JOIN insumo i ON ip.id_insumo = i.id_insumo
    INNER JOIN presentacion p ON ip.id_presentacion = p.id_presentacion
    INNER JOIN usuario u ON hm.id_usuario = u.id_usuario
    INNER JOIN personal per ON u.id_personal = per.id_personal
    LEFT JOIN servicio s ON hm.id_servicio = s.id_servicio
    WHERE DATE(hm.fecha_movimiento) BETWEEN p_fecha_inicio AND p_fecha_fin
      AND (p_tipo_movimiento IS NULL OR hm.tipo_movimiento = p_tipo_movimiento)
    ORDER BY hm.fecha_movimiento DESC;
END;
$$ LANGUAGE plpgsql;

-- Función: Reporte de costos por período
CREATE OR REPLACE FUNCTION reporte_costos_periodo(
    p_fecha_inicio DATE,
    p_fecha_fin DATE
) RETURNS TABLE (
    medicamento VARCHAR,
    presentacion VARCHAR,
    total_entradas NUMERIC,
    total_salidas NUMERIC,
    costo_total_entradas NUMERIC,
    costo_total_salidas NUMERIC,
    stock_actual NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.nombre,
        p.nombre,
        COALESCE(SUM(CASE WHEN hm.tipo_movimiento = 'entrada' THEN hm.cantidad ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN hm.tipo_movimiento = 'salida' THEN hm.cantidad ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN hm.tipo_movimiento = 'entrada' THEN hm.cantidad * hm.precio_unitario ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN hm.tipo_movimiento = 'salida' THEN hm.cantidad * hm.precio_unitario ELSE 0 END), 0),
        (SELECT COALESCE(SUM(li.cantidad_actual), 0)
         FROM lote_inventario li
         WHERE li.id_insumo_presentacion = ip.id_insumo_presentacion
           AND li.estado = TRUE)
    FROM historial_movimientos hm
    INNER JOIN insumo_presentacion ip ON hm.id_insumo_presentacion = ip.id_insumo_presentacion
    INNER JOIN insumo i ON ip.id_insumo = i.id_insumo
    INNER JOIN presentacion p ON ip.id_presentacion = p.id_presentacion
    WHERE DATE(hm.fecha_movimiento) BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY i.nombre, p.nombre, ip.id_insumo_presentacion
    ORDER BY i.nombre;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DATOS INICIALES BÁSICOS
-- ============================================================================

-- Unidades de medida comunes
INSERT INTO unidad_medida (nombre, abreviatura) VALUES
('Mililitros', 'ml'),
('Gramos', 'g'),
('Miligramos', 'mg'),
('Microgramos', 'mcg'),
('Unidades Internacionales', 'UI'),
('Litros', 'L'),
('Kilogramos', 'kg'),
('Tabletas', 'tab'),
('Cápsulas', 'cap'),
('Unidades', 'u');

-- Presentaciones comunes
INSERT INTO presentacion (nombre, descripcion) VALUES
('Frasco', 'Frasco de vidrio o plástico'),
('Ampolla', 'Ampolla inyectable'),
('Tableta', 'Tableta oral'),
('Cápsula', 'Cápsula oral'),
('Bolsa', 'Bolsa de solución intravenosa'),
('Vial', 'Vial de medicamento'),
('Gotero', 'Frasco con gotero'),
('Jeringa prellenada', 'Jeringa precargada'),
('Tubo', 'Tubo de ungüento o crema'),
('Sobre', 'Sobre individual'),
('Galón', 'Galón de solución'),
('Tarro', 'Tarro de medicamento'),
('Supositorio', 'Supositorio'),
('Libra', 'Libra de producto'),
('Cubeta', 'Cubeta de producto'),
('Perla', 'Perla o gragea');

-- Servicios médicos
INSERT INTO servicio (nombre_servicio, requiere_stock_24h, numero_camas) VALUES
('Emergencia General', TRUE, 10),
('Emergencia Maternidad', TRUE, 8),
('Emergencia Pediátrica', TRUE, 12),
('Observación Adultos', TRUE, 20),
('Observación Pediátrico', TRUE, 15),
('Medicina Interna', FALSE, 30),
('Cirugía', FALSE, 25),
('Ginecología', FALSE, 20),
('Pediatría', FALSE, 30),
('UCI Adultos', FALSE, 10),
('UCI Pediátrica', FALSE, 8),
('Neonatología', FALSE, 15);

-- Personal y usuarios de ejemplo
INSERT INTO personal (nombres, apellidos, dpi, cargo, telefono) VALUES
('Juan Carlos', 'López García', '1234567890101', 'Bodeguero', '12345678'),
('María Elena', 'Ramírez Cruz', '1234567890102', 'Turnista', '12345679'),
('Pedro José', 'Hernández Pérez', '1234567890103', 'Farmacéutico', '12345680'),
('Ana María', 'González Morales', '1234567890104', 'Administrador', '12345681');

INSERT INTO usuario (id_personal, nombre_usuario, contrasena, rol, tipo_turno) VALUES
(1, 'bodeguero1', '$2a$10$demopassword', 'bodeguero', 'bodega'),
(2, 'turnista1', '$2a$10$demopassword', 'turnista', '24_horas'),
(3, 'farmaceutico1', '$2a$10$demopassword', 'farmaceutico', 'diurno'),
(4, 'admin', '$2a$10$demopassword', 'administrador', 'administrativo');

-- Proveedor de ejemplo
INSERT INTO proveedor (nombre, nit, telefono, email, contacto_principal) VALUES
('Farmacéutica del Centro S.A.', '12345678-9', '23456789', 'ventas@farmaceutica.com', 'Carlos Méndez');

-- ============================================================================
-- PERMISOS Y COMENTARIOS FINALES
-- ============================================================================

COMMENT ON DATABASE farmacia_dinamica IS 
'Sistema de Gestión de Farmacia con registro dinámico de medicamentos - Versión mejorada';

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================

-- Verificación de instalación
DO $$
BEGIN
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Base de datos farmacia_dinamica creada exitosamente';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Características principales:';
    RAISE NOTICE '- Registro dinámico de medicamentos al momento del ingreso';
    RAISE NOTICE '- Control de inventario por lote y vencimiento';
    RAISE NOTICE '- Gestión de stock de 24 horas';
    RAISE NOTICE '- Sistema de consolidados y requisiciones';
    RAISE NOTICE '- Reposiciones automáticas';
    RAISE NOTICE '- Historial completo de movimientos';
    RAISE NOTICE '- Reportes de costos y consumo';
    RAISE NOTICE '- Alertas de vencimiento y stock mínimo';
    RAISE NOTICE '================================================';
END $$;
