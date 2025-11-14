-- ============================================================
-- MIGRACIÓN: Agregar clasificación de medicamentos
-- Objetivo: Clasificar medicamentos para reportes específicos
-- Clasificaciones: VIH, Métodos anticonceptivos, Listado básico
-- Subclasificaciones: Requisiciones, Recetas
-- ============================================================

BEGIN;

-- 1. Crear tipo ENUM para clasificación principal
CREATE TYPE clasificacion_medicamento AS ENUM (
    'vih',
    'metodo_anticonceptivo',
    'listado_basico'
);

-- 2. Crear tipo ENUM para subclasificación
CREATE TYPE subclasificacion_medicamento AS ENUM (
    'requisicion',
    'receta'
);

-- 3. Agregar columnas a la tabla insumo
ALTER TABLE insumo 
ADD COLUMN clasificacion clasificacion_medicamento DEFAULT 'listado_basico',
ADD COLUMN subclasificacion subclasificacion_medicamento;

COMMENT ON COLUMN insumo.clasificacion IS 'Clasificación principal del medicamento: VIH, Método anticonceptivo, Listado básico';
COMMENT ON COLUMN insumo.subclasificacion IS 'Subclasificación: Requisición o Receta (opcional)';

-- 4. Crear índices para mejorar consultas de reportes
CREATE INDEX idx_insumo_clasificacion ON insumo(clasificacion) WHERE estado = true;
CREATE INDEX idx_insumo_subclasificacion ON insumo(subclasificacion) WHERE estado = true;
CREATE INDEX idx_insumo_clasificacion_completa ON insumo(clasificacion, subclasificacion) WHERE estado = true;

COMMIT;

-- ============================================================
-- Datos de ejemplo: Actualizar algunos medicamentos conocidos
-- ============================================================

BEGIN;

-- Marcar algunos medicamentos como VIH (si existen)
UPDATE insumo 
SET clasificacion = 'vih'
WHERE LOWER(nombre) LIKE '%antirretroviral%'
   OR LOWER(nombre) LIKE '%efavirenz%'
   OR LOWER(nombre) LIKE '%lamivudina%'
   OR LOWER(nombre) LIKE '%tenofovir%'
   OR LOWER(nombre) LIKE '%zidovudina%';

-- Marcar métodos anticonceptivos (si existen)
UPDATE insumo 
SET clasificacion = 'metodo_anticonceptivo'
WHERE LOWER(nombre) LIKE '%anticonceptiv%'
   OR LOWER(nombre) LIKE '%levonorgestrel%'
   OR LOWER(nombre) LIKE '%etinilestradiol%'
   OR LOWER(nombre) LIKE '%medroxiprogesterona%'
   OR LOWER(nombre) LIKE '%condon%'
   OR LOWER(nombre) LIKE '%preservativo%';

-- El resto queda como 'listado_basico' (default)

COMMIT;

-- ============================================================
-- Verificación de cambios
-- ============================================================
SELECT 
    clasificacion,
    subclasificacion,
    COUNT(*) as cantidad_medicamentos
FROM insumo
WHERE estado = true
GROUP BY clasificacion, subclasificacion
ORDER BY clasificacion, subclasificacion;

SELECT 
    clasificacion,
    nombre,
    descripcion
FROM insumo
WHERE estado = true
  AND clasificacion IN ('vih', 'metodo_anticonceptivo')
ORDER BY clasificacion, nombre
LIMIT 10;
