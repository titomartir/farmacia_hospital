#!/bin/bash
set -e

echo "Importando datos manualmente..."

# Función para importar CSV
import_csv() {
    local table=$1
    local file=$2
    local columns=$3
    
    echo "Importando datos a tabla: $table"
    
    if [ ! -f "$file" ]; then
        echo "ADVERTENCIA: Archivo $file no encontrado"
        return
    fi
    
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\COPY $table($columns) FROM '$file' WITH (FORMAT csv, DELIMITER ';', HEADER true, ENCODING 'UTF8')" || echo "Error importando $table"
}

# Importar insumos (corrigiendo header)
if [ -f /csv/insumo.csv ]; then
    echo "Corrigiendo header de insumos..."
    sed '1s/tipo de documento/tipo_documento/' /csv/insumo.csv > /tmp/insumo_temp.csv
    import_csv "insumo" "/tmp/insumo_temp.csv" "nombre,descripcion,stock_minimo,dias_alerta_vencimiento,requiere_stock_24h,tipo_documento,estado"
    rm /tmp/insumo_temp.csv
fi

# Importar relaciones insumo-presentación
if [ -f /csv/insumo_presentacion.csv ]; then
    import_csv "insumo_presentacion" "/csv/insumo_presentacion.csv" "id_insumo,id_presentacion,id_unidad_medida,cantidad_presentacion,precio_unitario,codigo_barras,estado"
fi

# Importar stock 24 horas (sin columnas vacías)
if [ -f /csv/stock_24_horas.csv ]; then
    import_csv "stock_24_horas" "/csv/stock_24_horas.csv" "id_insumo_presentacion,cantidad_fija,stock_actual,observaciones,estado"
fi

echo "Importación manual completada"

# Mostrar estadísticas
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<-EOSQL
    SELECT 'Unidades de medida' as tabla, COUNT(*) as registros FROM unidad_medida WHERE estado = TRUE
    UNION ALL
    SELECT 'Presentaciones', COUNT(*) FROM presentacion WHERE estado = TRUE
    UNION ALL
    SELECT 'Insumos', COUNT(*) FROM insumo WHERE estado = TRUE
    UNION ALL
    SELECT 'Insumo-Presentación', COUNT(*) FROM insumo_presentacion WHERE estado = TRUE
    UNION ALL
    SELECT 'Proveedores', COUNT(*) FROM proveedor WHERE estado = TRUE
    UNION ALL
    SELECT 'Servicios', COUNT(*) FROM servicio WHERE estado = TRUE
    UNION ALL
    SELECT 'Personal', COUNT(*) FROM personal WHERE estado = TRUE
    UNION ALL
    SELECT 'Usuarios', COUNT(*) FROM usuario WHERE estado = TRUE
    UNION ALL
    SELECT 'Stock 24h', COUNT(*) FROM stock_24_horas WHERE estado = TRUE;
EOSQL
