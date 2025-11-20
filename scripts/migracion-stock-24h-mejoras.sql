-- ============================================
-- MIGRACIÓN: MEJORAS STOCK 24 HORAS
-- Fecha: 2025-11-17
-- Descripción: Agregar campo origen_despacho y mejorar control de stock
-- ============================================

-- 1. Agregar campo origen_despacho a requisiciones
ALTER TABLE requisicion 
ADD COLUMN IF NOT EXISTS origen_despacho VARCHAR(20) DEFAULT 'general' CHECK (origen_despacho IN ('general', 'stock_24h'));

COMMENT ON COLUMN requisicion.origen_despacho IS 'Origen del despacho: general (bodega) o stock_24h (farmacia 24h)';

-- 2. Agregar índice para búsquedas por origen
CREATE INDEX IF NOT EXISTS idx_requisicion_origen ON requisicion(origen_despacho);

-- 3. Agregar campo es_turnista a usuario (si no existe)
-- Este campo facilita la identificación rápida de personal de 24h
ALTER TABLE usuario 
ADD COLUMN IF NOT EXISTS es_turnista BOOLEAN DEFAULT false;

COMMENT ON COLUMN usuario.es_turnista IS 'Indica si el usuario es personal de turno 24h';

-- 4. Actualizar usuarios existentes con tipo_turno = '24_horas' a es_turnista = true
UPDATE usuario 
SET es_turnista = true 
WHERE tipo_turno = '24_horas' OR rol = 'turnista';

-- 5. Agregar campo para tracking de movimientos en stock 24h
-- Ya existe la tabla movimiento_stock_24h, solo agregamos un índice
CREATE INDEX IF NOT EXISTS idx_movimiento_tipo ON movimiento_stock_24h(tipo_movimiento);
CREATE INDEX IF NOT EXISTS idx_movimiento_fecha ON movimiento_stock_24h(fecha_movimiento);

-- 6. Vista para inventario total (bodega general + stock 24h)
CREATE OR REPLACE VIEW v_inventario_total AS
SELECT 
    ip.id_insumo_presentacion,
    i.id_insumo,
    i.nombre_insumo,
    i.clasificacion,
    p.nombre_presentacion,
    u.nombre_unidad_medida,
    -- Cantidad en bodega general (lotes disponibles)
    COALESCE(SUM(l.cantidad_disponible), 0) as cantidad_bodega_general,
    -- Cantidad en stock 24h
    COALESCE(s.stock_actual, 0) as cantidad_stock_24h,
    -- Total combinado
    COALESCE(SUM(l.cantidad_disponible), 0) + COALESCE(s.stock_actual, 0) as cantidad_total,
    -- Valor en bodega general
    COALESCE(SUM(l.cantidad_disponible * l.precio_unitario), 0) as valor_bodega_general,
    -- Valor estimado en stock 24h (usando precio promedio del último lote)
    COALESCE(s.stock_actual * (
        SELECT precio_unitario 
        FROM lote_inventario l2 
        WHERE l2.id_insumo_presentacion = ip.id_insumo_presentacion 
        ORDER BY fecha_ingreso DESC 
        LIMIT 1
    ), 0) as valor_stock_24h,
    -- Valor total
    COALESCE(SUM(l.cantidad_disponible * l.precio_unitario), 0) + 
    COALESCE(s.stock_actual * (
        SELECT precio_unitario 
        FROM lote_inventario l2 
        WHERE l2.id_insumo_presentacion = ip.id_insumo_presentacion 
        ORDER BY fecha_ingreso DESC 
        LIMIT 1
    ), 0) as valor_total,
    -- Stock mínimo
    ip.stock_minimo,
    -- Alerta de stock
    CASE 
        WHEN (COALESCE(SUM(l.cantidad_disponible), 0) + COALESCE(s.stock_actual, 0)) <= ip.stock_minimo THEN 'CRÍTICO'
        WHEN (COALESCE(SUM(l.cantidad_disponible), 0) + COALESCE(s.stock_actual, 0)) <= (ip.stock_minimo * 1.5) THEN 'BAJO'
        ELSE 'OK'
    END as nivel_alerta
FROM insumo_presentacion ip
INNER JOIN insumo i ON ip.id_insumo = i.id_insumo
INNER JOIN presentacion p ON ip.id_presentacion = p.id_presentacion
INNER JOIN unidad_medida u ON ip.id_unidad_medida = u.id_unidad_medida
LEFT JOIN lote_inventario l ON ip.id_insumo_presentacion = l.id_insumo_presentacion 
    AND l.estado = true 
    AND l.cantidad_disponible > 0
LEFT JOIN stock_24_horas s ON ip.id_insumo_presentacion = s.id_insumo_presentacion 
    AND s.estado = true
WHERE i.estado = true
GROUP BY 
    ip.id_insumo_presentacion,
    i.id_insumo,
    i.nombre_insumo,
    i.clasificacion,
    p.nombre_presentacion,
    u.nombre_unidad_medida,
    ip.stock_minimo,
    s.stock_actual;

COMMENT ON VIEW v_inventario_total IS 'Vista consolidada del inventario: bodega general + stock 24h';

-- 7. Función para registrar movimientos automáticos
CREATE OR REPLACE FUNCTION fn_registrar_movimiento_stock_24h()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo registrar si el stock_actual cambió
    IF (TG_OP = 'UPDATE' AND OLD.stock_actual != NEW.stock_actual) THEN
        INSERT INTO movimiento_stock_24h (
            id_stock_24h,
            tipo_movimiento,
            cantidad,
            cantidad_anterior,
            cantidad_nueva,
            observaciones,
            fecha_movimiento
        ) VALUES (
            NEW.id_stock_24h,
            'ajuste_sistema',
            ABS(NEW.stock_actual - OLD.stock_actual),
            OLD.stock_actual,
            NEW.stock_actual,
            'Ajuste automático del sistema',
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger para movimientos automáticos (opcional, comentado por ahora)
-- DROP TRIGGER IF EXISTS trg_stock_24h_movimiento ON stock_24_horas;
-- CREATE TRIGGER trg_stock_24h_movimiento
-- AFTER UPDATE ON stock_24_horas
-- FOR EACH ROW
-- EXECUTE FUNCTION fn_registrar_movimiento_stock_24h();

-- 9. Verificar integridad de datos
DO $$
BEGIN
    RAISE NOTICE 'Migración completada exitosamente';
    RAISE NOTICE 'Requisiciones totales: %', (SELECT COUNT(*) FROM requisicion);
    RAISE NOTICE 'Requisiciones con origen general: %', (SELECT COUNT(*) FROM requisicion WHERE origen_despacho = 'general');
    RAISE NOTICE 'Usuarios turnistas: %', (SELECT COUNT(*) FROM usuario WHERE es_turnista = true);
    RAISE NOTICE 'Medicamentos en stock 24h: %', (SELECT COUNT(*) FROM stock_24_horas WHERE estado = true);
END $$;
