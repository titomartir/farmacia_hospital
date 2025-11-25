-- ============================================================================
-- MIGRACIÓN: Agregar columnas clasificacion y subclasificacion a tabla insumo
-- Fecha: 2025-11-24
-- Propósito: Habilitar reportes que diferencien entre requisiciones y recetas
-- ============================================================================

-- Paso 1: Crear tipos ENUM si no existen
DO $$ BEGIN
    CREATE TYPE clasificacion_enum AS ENUM ('vih', 'metodo_anticonceptivo', 'listado_basico');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subclasificacion_enum AS ENUM ('requisicion', 'receta');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Paso 2: Agregar columnas a tabla insumo
ALTER TABLE insumo 
ADD COLUMN IF NOT EXISTS clasificacion clasificacion_enum DEFAULT 'listado_basico',
ADD COLUMN IF NOT EXISTS subclasificacion subclasificacion_enum;

-- Paso 3: Agregar comentarios a las columnas
COMMENT ON COLUMN insumo.clasificacion IS 'Clasificación principal del medicamento: vih, metodo_anticonceptivo, listado_basico';
COMMENT ON COLUMN insumo.subclasificacion IS 'Subclasificación para reportes: requisicion o receta';

-- Paso 4: Actualizar datos existentes basados en tipo_documento
-- Si tipo_documento = 'REQUISICIÓN', entonces subclasificacion = 'requisicion'
-- Si tipo_documento = 'RECETA', entonces subclasificacion = 'receta'
UPDATE insumo 
SET subclasificacion = CASE 
    WHEN tipo_documento = 'REQUISICIÓN' THEN 'requisicion'::subclasificacion_enum
    WHEN tipo_documento = 'RECETA' THEN 'receta'::subclasificacion_enum
    ELSE NULL
END
WHERE subclasificacion IS NULL;

-- Verificación: Mostrar estadísticas
SELECT 
    clasificacion,
    subclasificacion,
    tipo_documento,
    COUNT(*) as total
FROM insumo
GROUP BY clasificacion, subclasificacion, tipo_documento
ORDER BY clasificacion, subclasificacion;

-- Mostrar algunos registros de ejemplo
SELECT 
    id_insumo,
    nombre,
    clasificacion,
    subclasificacion,
    tipo_documento,
    estado
FROM insumo
LIMIT 10;
