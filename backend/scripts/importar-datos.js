const fs = require('fs');
const path = require('path');
const { Insumo, InsumoPresentacion, Presentacion, UnidadMedida, Stock24Horas } = require('./src/models');

async function importarInsumos() {
  try {
    console.log('📦 Iniciando importación de insumos desde CSV...\n');

    // Leer archivo CSV de insumos
    const csvInsumos = fs.readFileSync(path.join(__dirname, '../csv/insumo.csv'), 'utf-8');
    const lineasInsumos = csvInsumos.split('\n').filter(l => l.trim());
    
    // Saltar header
    const datosInsumos = lineasInsumos.slice(1);
    
    console.log(`📋 Total de insumos a importar: ${datosInsumos.length}\n`);

    let importados = 0;
    let errores = 0;

    for (const linea of datosInsumos) {
      const [nombre, descripcion, stock_minimo, dias_alerta, requiere_stock, tipo_doc, estado] = linea.split(';');
      
      if (!nombre || !nombre.trim()) continue;

      try {
        // Mapear tipo_documento
        let tipo_documento = 'RECETA';
        if (tipo_doc && tipo_doc.toUpperCase().includes('REQUISICIÓN')) {
          tipo_documento = 'REQUISICIÓN';
        } else if (tipo_doc && tipo_doc.toUpperCase().includes('ORDEN')) {
          tipo_documento = 'ORDEN_MÉDICA';
        }

        const insumo = await Insumo.create({
          nombre: nombre.trim(),
          descripcion: descripcion?.trim() || null,
          stock_minimo: parseFloat(stock_minimo) || 5,
          dias_alerta_vencimiento: parseInt(dias_alerta) || 30,
          requiere_stock_24h: requiere_stock === 'TRUE',
          tipo_documento: tipo_documento,
          estado: estado !== 'FALSE'
        });

        importados++;
        
        if (importados % 50 === 0) {
          console.log(`✓ ${importados} insumos importados...`);
        }
      } catch (error) {
        errores++;
        console.error(`✗ Error en: ${nombre.substring(0, 30)}... - ${error.message}`);
      }
    }

    console.log(`\n✅ Importación completada:`);
    console.log(`   - Exitosos: ${importados}`);
    console.log(`   - Errores: ${errores}`);
    console.log(`   - Total: ${datosInsumos.length}\n`);

  } catch (error) {
    console.error('❌ Error en importación:', error);
    process.exit(1);
  }
}

async function importarInsumoPresentacion() {
  try {
    console.log('📦 Iniciando importación de insumo_presentacion desde CSV...\n');

    const csv = fs.readFileSync(path.join(__dirname, '../csv/insumo_presentacion.csv'), 'utf-8');
    const lineas = csv.split('\n').filter(l => l.trim());
    const datos = lineas.slice(1); // Saltar header

    console.log(`📋 Total de relaciones a importar: ${datos.length}\n`);

    let importados = 0;
    let errores = 0;

    for (const linea of datos) {
      const [id_insumo, id_presentacion, id_unidad_medida, cantidad_presentacion, precio_unitario, codigo_barras, estado] = linea.split(';');
      
      if (!id_insumo || !id_presentacion || !id_unidad_medida) continue;

      try {
        await InsumoPresentacion.create({
          id_insumo: parseInt(id_insumo),
          id_presentacion: parseInt(id_presentacion),
          id_unidad_medida: parseInt(id_unidad_medida),
          cantidad_presentacion: parseFloat(cantidad_presentacion) || 1,
          precio_unitario: parseFloat(precio_unitario) || 0,
          codigo_barras: codigo_barras?.trim() || null,
          estado: estado !== 'FALSE'
        });

        importados++;
        
        if (importados % 50 === 0) {
          console.log(`✓ ${importados} relaciones importadas...`);
        }
      } catch (error) {
        errores++;
        console.error(`✗ Error en ID ${id_insumo}: ${error.message}`);
      }
    }

    console.log(`\n✅ Importación completada:`);
    console.log(`   - Exitosos: ${importados}`);
    console.log(`   - Errores: ${errores}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

async function importarStock24h() {
  try {
    console.log('📦 Iniciando importación de stock_24_horas desde CSV...\n');

    const csv = fs.readFileSync(path.join(__dirname, '../csv/stock_24_horas.csv'), 'utf-8');
    const lineas = csv.split('\n').filter(l => l.trim());
    const datos = lineas.slice(1);

    console.log(`📋 Total de stock 24h a importar: ${datos.length}\n`);

    let importados = 0;
    let errores = 0;

    for (const linea of datos) {
      const [id_insumo_presentacion, cantidad_fija, stock_actual, ultima_reposicion, observaciones, estado] = linea.split(';');
      
      if (!id_insumo_presentacion || !cantidad_fija) continue;

      try {
        await Stock24Horas.create({
          id_insumo_presentacion: parseInt(id_insumo_presentacion),
          stock_fijo: parseFloat(cantidad_fija),
          stock_actual: parseFloat(stock_actual) || 0,
          ultima_reposicion: ultima_reposicion?.trim() || null,
          observaciones: observaciones?.trim() || null,
          estado: estado !== 'FALSE'
        });

        importados++;
        
        if (importados % 20 === 0) {
          console.log(`✓ ${importados} items importados...`);
        }
      } catch (error) {
        errores++;
        console.error(`✗ Error en ID ${id_insumo_presentacion}: ${error.message}`);
      }
    }

    console.log(`\n✅ Importación completada:`);
    console.log(`   - Exitosos: ${importados}`);
    console.log(`   - Errores: ${errores}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

async function main() {
  try {
    console.log('🚀 IMPORTACIÓN MASIVA DE DATOS\n');
    console.log('='.repeat(50) + '\n');

    await importarInsumos();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await importarInsumoPresentacion();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await importarStock24h();
    console.log('\n' + '='.repeat(50) + '\n');

    console.log('✅ ¡IMPORTACIÓN COMPLETA!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

main();
