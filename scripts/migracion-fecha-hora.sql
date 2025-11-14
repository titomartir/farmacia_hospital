-- ============================================================
-- MIGRACIÓN: Convertir campos DATE a TIMESTAMP
-- Objetivo: Registrar fecha Y hora en todos los movimientos
-- para permitir reportes con rangos específicos de tiempo
-- ============================================================

BEGIN;

-- 1. TABLA: ingreso - fecha_ingreso
ALTER TABLE ingreso 
ALTER COLUMN fecha_ingreso TYPE TIMESTAMP USING fecha_ingreso::TIMESTAMP;

COMMENT ON COLUMN ingreso.fecha_ingreso IS 'Fecha y hora del ingreso de mercadería';

-- 2. TABLA: lote_inventario - fecha_ingreso, fecha_vencimiento
ALTER TABLE lote_inventario 
ALTER COLUMN fecha_ingreso TYPE TIMESTAMP USING fecha_ingreso::TIMESTAMP;

COMMENT ON COLUMN lote_inventario.fecha_ingreso IS 'Fecha y hora de ingreso del lote';

-- fecha_vencimiento puede quedarse como DATE ya que solo importa el día

-- 3. TABLA: requisicion - fecha_solicitud, fecha_autorizacion, fecha_entrega
ALTER TABLE requisicion 
ALTER COLUMN fecha_solicitud TYPE TIMESTAMP USING fecha_solicitud::TIMESTAMP,
ALTER COLUMN fecha_autorizacion TYPE TIMESTAMP USING fecha_autorizacion::TIMESTAMP,
ALTER COLUMN fecha_entrega TYPE TIMESTAMP USING fecha_entrega::TIMESTAMP;

COMMENT ON COLUMN requisicion.fecha_solicitud IS 'Fecha y hora de creación de la requisición';
COMMENT ON COLUMN requisicion.fecha_autorizacion IS 'Fecha y hora de autorización';
COMMENT ON COLUMN requisicion.fecha_entrega IS 'Fecha y hora de entrega';

-- 4. TABLA: consolidado - fecha_consolidado, fecha_cierre
ALTER TABLE consolidado 
ALTER COLUMN fecha_consolidado TYPE TIMESTAMP USING fecha_consolidado::TIMESTAMP,
ALTER COLUMN fecha_cierre TYPE TIMESTAMP USING fecha_cierre::TIMESTAMP;

COMMENT ON COLUMN consolidado.fecha_consolidado IS 'Fecha y hora del consolidado (turno específico)';
COMMENT ON COLUMN consolidado.fecha_cierre IS 'Fecha y hora de cierre del consolidado';

-- 5. TABLA: cuadre_stock_24h - fecha_cuadre, fecha_cierre
-- fecha_cuadre ya es TIMESTAMP, solo verificamos
-- fecha_cierre no existe como columna, se usa fecha_creacion

COMMENT ON COLUMN cuadre_stock_24h.fecha_cuadre IS 'Fecha y hora del cuadre';

-- 6. TABLA: reposicion_stock_24h - fecha_reposicion
ALTER TABLE reposicion_stock_24h 
ALTER COLUMN fecha_reposicion TYPE TIMESTAMP USING fecha_reposicion::TIMESTAMP;

COMMENT ON COLUMN reposicion_stock_24h.fecha_reposicion IS 'Fecha y hora de la reposición';

-- 7. TABLA: historial_movimientos - fecha_movimiento (ya es TIMESTAMP, verificar)
-- Esta tabla ya tiene TIMESTAMP, solo agregamos comentario
COMMENT ON COLUMN historial_movimientos.fecha_movimiento IS 'Fecha y hora exacta del movimiento';

COMMIT;

-- ============================================================
-- Verificación de cambios
-- ============================================================
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name LIKE '%fecha%'
  AND table_name NOT IN ('usuario', 'personal', 'insumo', 'proveedor', 'servicio', 'presentacion', 'unidad_medida', 'tipo_documento')
ORDER BY table_name, ordinal_position;
