#!/bin/bash
set -e

echo "============================================"
echo "Inicializando datos desde archivos CSV..."
echo "============================================"

# Esperar que la base de datos esté lista
sleep 5

# Función para importar CSV
import_csv() {
    local table=$1
    local file=$2
    local columns=$3
    
    echo "Importando datos a tabla: $table"
    
    # Verificar que el archivo existe
    if [ ! -f "$file" ]; then
        echo "ADVERTENCIA: Archivo $file no encontrado"
        return
    fi
    
    # Importar datos (saltar primera línea de encabezados)
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\COPY $table($columns) FROM '$file' WITH (FORMAT csv, DELIMITER ';', HEADER true, ENCODING 'UTF8')" || echo "Error importando $table"
}

# Verificar que la base de datos existe
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT version();" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✓ Base de datos conectada correctamente"
    
    # Importar catálogos básicos (sobrescribir datos de ejemplo del SQL)
    echo ""
    echo "--- Importando catálogos básicos ---"
    
    # Limpiar datos de ejemplo e importar desde CSV
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<-EOSQL
        -- Limpiar tablas que pueden tener datos de ejemplo
        TRUNCATE unidad_medida CASCADE;
        TRUNCATE presentacion CASCADE;
        TRUNCATE proveedor CASCADE;
        TRUNCATE servicio CASCADE;
        TRUNCATE personal CASCADE;
        TRUNCATE insumo CASCADE;
        
        -- Reiniciar secuencias
        ALTER SEQUENCE unidad_medida_id_unidad_medida_seq RESTART WITH 1;
        ALTER SEQUENCE presentacion_id_presentacion_seq RESTART WITH 1;
        ALTER SEQUENCE proveedor_id_proveedor_seq RESTART WITH 1;
        ALTER SEQUENCE servicio_id_servicio_seq RESTART WITH 1;
        ALTER SEQUENCE personal_id_personal_seq RESTART WITH 1;
        ALTER SEQUENCE insumo_id_insumo_seq RESTART WITH 1;
        ALTER SEQUENCE usuario_id_usuario_seq RESTART WITH 1;
EOSQL
    
    # Importar unidades de medida
    if [ -f /csv/unidad_medida.csv ]; then
        # El CSV tiene una columna "numero" que no necesitamos
        sed '1d' /csv/unidad_medida.csv | cut -d';' -f1-3 > /tmp/unidad_medida_temp.csv
        psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\COPY unidad_medida(nombre,abreviatura,estado) FROM '/tmp/unidad_medida_temp.csv' WITH (FORMAT csv, DELIMITER ';', ENCODING 'UTF8')" || echo "Error importando unidad_medida"
        rm /tmp/unidad_medida_temp.csv
    fi
    
    # Importar presentaciones
    if [ -f /csv/presentacion.csv ]; then
        import_csv "presentacion" "/csv/presentacion.csv" "nombre,descripcion,estado"
    fi
    
    # Importar proveedores
    if [ -f /csv/proveedor.csv ]; then
        import_csv "proveedor" "/csv/proveedor.csv" "nombre,nit,telefono,email,direccion,estado"
    fi
    
    # Importar servicios
    if [ -f /csv/servicio.csv ]; then
        import_csv "servicio" "/csv/servicio.csv" "nombre_servicio,descripcion,requiere_stock_24h,numero_camas,estado"
    fi
    
    # Importar personal
    if [ -f /csv/personal.csv ]; then
        import_csv "personal" "/csv/personal.csv" "nombres,apellidos,dpi,cargo,telefono,email,direccion,estado"
    fi
    
    # Importar usuarios (necesita traducir roles)
    if [ -f /csv/usuario.csv ]; then
        # Crear archivo temporal con roles traducidos
        sed '1d' /csv/usuario.csv | sed 's/farmacéutico/farmaceutico/g' | sed 's/bodeguero/bodeguero/g' > /tmp/usuario_temp.csv
        import_csv "usuario" "/tmp/usuario_temp.csv" "id_personal,nombre_usuario,contrasena,rol,tipo_turno,estado"
        rm /tmp/usuario_temp.csv
    fi
    
    echo ""
    echo "--- NOTA: Registro Dinámico de Medicamentos ---"
    echo "Los insumos/medicamentos NO se precargan."
    echo "Se registrarán automáticamente al momento del primer ingreso."
    echo ""
    echo "Esto permite:"
    echo "  ✓ Mayor flexibilidad"
    echo "  ✓ Solo registrar medicamentos que realmente se usan"
    echo "  ✓ Evitar catálogos obsoletos"
    echo ""
    
    # OPCIONAL: Si deseas precargar insumos desde CSV, descomenta lo siguiente:
    # if [ -f /csv/insumo.csv ]; then
    #     sed '1s/tipo de documento/tipo_documento/' /csv/insumo.csv > /tmp/insumo_temp.csv
    #     import_csv "insumo" "/tmp/insumo_temp.csv" "nombre,descripcion,stock_minimo,dias_alerta_vencimiento,requiere_stock_24h,tipo_documento,estado"
    #     rm /tmp/insumo_temp.csv
    # fi
    #
    # if [ -f /csv/insumo_presentacion.csv ]; then
    #     import_csv "insumo_presentacion" "/csv/insumo_presentacion.csv" "id_insumo,id_presentacion,id_unidad_medida,cantidad_presentacion,precio_unitario,codigo_barras,estado"
    # fi
    #
    # if [ -f /csv/stock_24_horas.csv ]; then
    #     sed '1d' /csv/stock_24_horas.csv | cut -d';' -f1-3,6 > /tmp/stock_temp.csv
    #     psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\COPY stock_24_horas(id_insumo_presentacion,cantidad_fija,stock_actual,estado) FROM '/tmp/stock_temp.csv' WITH (FORMAT csv, DELIMITER ';', ENCODING 'UTF8')" || echo "Error importando stock_24_horas"
    #     rm /tmp/stock_temp.csv
    # fi
    
    echo ""
    echo "============================================"
    echo "✓ Importación de datos completada"
    echo "============================================"
    
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
    
else
    echo "✗ Error conectando a la base de datos"
    exit 1
fi
