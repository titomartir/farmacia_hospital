const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Test Kardex endpoint with authentication
async function testKardex() {
  try {
    console.log('🧪 Testing Kardex Endpoint...\n');
    
    // 1. Login
    console.log('1️⃣  Autenticando...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      nombre_usuario: 'admin',
      password: 'admin123'
    });
    
    const token = loginRes.data.data.token;
    console.log('✅ Login exitoso, token obtenido\n');

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // 2. Obtener medicinas
    console.log('2️⃣  Obteniendo medicinas...');
    const insumosRes = await axios.get(`${API_URL}/insumos?limit=5`, config);
    console.log(`✅ Se obtuvieron ${insumosRes.data.data.length} medicinas`);
    
    if (insumosRes.data.data.length === 0) {
      console.log('❌ No hay medicinas en la base de datos');
      return;
    }

    const medicina = insumosRes.data.data.find(m => m.presentaciones && m.presentaciones.length > 0);
    if (!medicina) {
      console.log('❌ No hay medicinas con presentaciones');
      return;
    }

    console.log(`\n📊 Medicina seleccionada: ${medicina.nombre} (ID: ${medicina.id_insumo})`);
    console.log(`   Presentaciones: ${medicina.presentaciones.length}\n`);

    // 3. Probar endpoint de Kardex
    const fecha_inicio = '2025-01-01';
    const fecha_fin = '2025-12-31';
    
    console.log(`3️⃣  Llamando Kardex para: ${medicina.nombre}`);
    console.log(`   Rango: ${fecha_inicio} a ${fecha_fin}\n`);

    const kardexRes = await axios.get(
      `${API_URL}/reportes/kardex/${medicina.id_insumo}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          fecha_inicio,
          fecha_fin
        }
      }
    );

    console.log('✅ Kardex obtenido exitosamente!\n');
    console.log('📋 Estructura de respuesta:');
    console.log(`   - Medicamento: ${kardexRes.data.data.medicamento}`);
    console.log(`   - Presentación: ${kardexRes.data.data.presentacion}`);
    console.log(`   - Unidad Medida: ${kardexRes.data.data.unidad_medida}`);
    console.log(`   - Movimientos: ${kardexRes.data.data.movimientos.length}`);
    console.log(`   - Totales: ${Object.keys(kardexRes.data.data.totales).length} campos`);

    if (kardexRes.data.data.movimientos.length > 0) {
      console.log('\n📊 Primeros 3 movimientos:');
      kardexRes.data.data.movimientos.slice(0, 3).forEach((mov, i) => {
        console.log(`   ${i + 1}. ${mov.fecha} - ${mov.descripcion} | Saldo: ${mov.saldo_cantidad} (${mov.saldo_valor})`);
      });
    } else {
      console.log('\n⚠️  No hay movimientos en el rango de fechas');
    }

    console.log('\n✅ Test completado exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.error('   → Credenciales inválidas');
    } else if (error.response?.status === 404) {
      console.error('   → El endpoint no existe');
    }
  }
}

testKardex();
