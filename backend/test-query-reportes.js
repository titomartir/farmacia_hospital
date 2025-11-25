/**
 * Test directo de SQL query de reportes
 */

const { sequelize } = require('./src/config/database');
const { QueryTypes } = require('sequelize');

async function testReportQuery() {
  try {
    console.log('\n📊 Test de Query de Reportes');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const query = `
      SELECT 
        i.id_insumo,
        i.nombre as medicamento,
        i.clasificacion,
        i.subclasificacion,
        p.nombre as presentacion,
        
        -- REQUISICIONES (cuando subclasificacion = 'requisicion')
        SUM(CASE WHEN i.subclasificacion = 'requisicion' THEN dr.cantidad_autorizada ELSE 0 END) as req_unidades,
        SUM(CASE WHEN i.subclasificacion = 'requisicion' THEN (dr.cantidad_autorizada * dr.precio_unitario) ELSE 0 END) as req_costo,
        
        -- RECETAS (cuando subclasificacion = 'receta')
        SUM(CASE WHEN i.subclasificacion = 'receta' THEN dr.cantidad_autorizada ELSE 0 END) as receta_unidades,
        SUM(CASE WHEN i.subclasificacion = 'receta' THEN (dr.cantidad_autorizada * dr.precio_unitario) ELSE 0 END) as receta_costo,
        
        -- TOTALES
        SUM(dr.cantidad_autorizada) as total_unidades,
        SUM(dr.cantidad_autorizada * dr.precio_unitario) as total_costo,
        
        AVG(dr.precio_unitario) as precio_promedio
        
      FROM detalle_requisicion dr
      INNER JOIN requisicion r ON dr.id_requisicion = r.id_requisicion
      INNER JOIN insumo_presentacion ip ON dr.id_insumo_presentacion = ip.id_insumo_presentacion
      INNER JOIN insumo i ON ip.id_insumo = i.id_insumo
      INNER JOIN presentacion p ON ip.id_presentacion = p.id_presentacion
      
      WHERE r.fecha_solicitud BETWEEN :fecha_desde AND :fecha_hasta
        AND r.estado IN ('aprobada', 'entregada')
      
      GROUP BY i.id_insumo, i.nombre, i.clasificacion, i.subclasificacion, p.nombre
      ORDER BY i.nombre ASC
      LIMIT 10
    `;

    const resultados = await sequelize.query(query, {
      replacements: { 
        fecha_desde: '2025-01-01', 
        fecha_hasta: '2025-12-31' 
      },
      type: QueryTypes.SELECT
    });

    console.log(`✅ Query ejecutada correctamente`);
    console.log(`📦 Resultados encontrados: ${resultados.length}\n`);

    if (resultados.length > 0) {
      console.log('📝 Primeros resultados:\n');
      resultados.forEach((item, idx) => {
        console.log(`${idx + 1}. ${item.medicamento}`);
        console.log(`   Clasificación: ${item.clasificacion || 'N/A'}`);
        console.log(`   Subclasificación: ${item.subclasificacion || 'N/A'}`);
        console.log(`   Presentación: ${item.presentacion}`);
        console.log(`   Req Unidades: ${item.req_unidades} | Receta Unidades: ${item.receta_unidades}`);
        console.log(`   Req Costo: Q${item.req_costo} | Receta Costo: Q${item.receta_costo}`);
        console.log(`   Total: ${item.total_unidades} unidades | Q${item.total_costo}\n`);
      });
    } else {
      console.log('⚠️  No se encontraron requisiciones en el período especificado');
      
      // Verificar si hay requisiciones en general
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM requisicion 
        WHERE estado IN ('aprobada', 'entregada')
      `;
      const count = await sequelize.query(countQuery, { type: QueryTypes.SELECT });
      console.log(`📊 Total requisiciones aprobadas/entregadas: ${count[0].total}`);
    }

    await sequelize.close();
    console.log('\n✅ Test completado\n');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error en query:', error.message);
    console.error(error);
    await sequelize.close();
    process.exit(1);
  }
}

testReportQuery();
