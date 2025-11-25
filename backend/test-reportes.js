/**
 * Script de prueba para endpoints de reportes
 * Verifica que los 3 reportes funcionen correctamente con las columnas clasificacion y subclasificacion
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
let token = '';

// Login para obtener token
async function login() {
  try {
    console.log('\n🔐 Iniciando sesión...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      nombre_usuario: 'ANA MERCEDES',
      password: 'password123'
    });
    
    if (response.data.success) {
      token = response.data.data.token;
      console.log('✅ Login exitoso');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    return false;
  }
}

// Test 1: Resumen Total por Medicamento
async function testResumenTotal() {
  try {
    console.log('\n📊 Test 1: Resumen Total por Medicamento');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const response = await axios.get(`${API_URL}/reportes/resumen-total`, {
      params: {
        fecha_desde: '2025-01-01',
        fecha_hasta: '2025-12-31'
      },
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      const data = response.data.data;
      console.log('✅ Endpoint funcionando correctamente');
      console.log(`📅 Período: ${data.periodo.fecha_desde} al ${data.periodo.fecha_hasta}`);
      console.log(`📦 Total medicamentos: ${data.medicamentos.length}`);
      console.log(`💰 Total costo: Q ${data.totales.total_costo}`);
      console.log(`📋 Unidades requisición: ${data.totales.req_unidades}`);
      console.log(`💊 Unidades receta: ${data.totales.receta_unidades}`);
      
      if (data.medicamentos.length > 0) {
        console.log('\n📝 Ejemplo de medicamento:');
        const med = data.medicamentos[0];
        console.log(`   Nombre: ${med.medicamento}`);
        console.log(`   Clasificación: ${med.clasificacion || 'N/A'}`);
        console.log(`   Subclasificación: ${med.subclasificacion || 'N/A'}`);
        console.log(`   Req Unidades: ${med.req_unidades}`);
        console.log(`   Receta Unidades: ${med.receta_unidades}`);
      }
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data?.error) {
      console.error('   Detalles:', error.response.data.error);
    }
    return false;
  }
}

// Test 2: Resumen por Servicio
async function testResumenServicio() {
  try {
    console.log('\n📊 Test 2: Resumen por Servicio');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const response = await axios.get(`${API_URL}/reportes/resumen-servicio`, {
      params: {
        fecha_desde: '2025-01-01',
        fecha_hasta: '2025-12-31',
        id_servicio: 1 // Usar el primer servicio
      },
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      const data = response.data.data;
      console.log('✅ Endpoint funcionando correctamente');
      console.log(`📅 Período: ${data.periodo.fecha_desde} al ${data.periodo.fecha_hasta}`);
      console.log(`🏥 Servicio: ${data.servicio}`);
      console.log(`📦 Total medicamentos: ${data.medicamentos.length}`);
      console.log(`💰 Total costo: Q ${data.totales.total_costo}`);
      console.log(`📋 Unidades requisición: ${data.totales.req_unidades}`);
      console.log(`💊 Unidades receta: ${data.totales.receta_unidades}`);
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data?.error) {
      console.error('   Detalles:', error.response.data.error);
    }
    return false;
  }
}

// Test 3: Consumo por Servicio
async function testConsumoPorServicio() {
  try {
    console.log('\n📊 Test 3: Consumo por Servicio');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const response = await axios.get(`${API_URL}/reportes/consumo-servicio`, {
      params: {
        fecha_desde: '2025-01-01',
        fecha_hasta: '2025-12-31'
      },
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      const data = response.data.data;
      console.log('✅ Endpoint funcionando correctamente');
      console.log(`📅 Período: ${data.periodo.fecha_desde} al ${data.periodo.fecha_hasta}`);
      console.log(`🏥 Total servicios: ${data.servicios.length}`);
      
      if (data.servicios.length > 0) {
        console.log('\n📝 Resumen por servicio:');
        data.servicios.forEach((srv, idx) => {
          console.log(`   ${idx + 1}. ${srv.servicio}`);
          console.log(`      Requisiciones: ${srv.total_requisiciones}`);
          console.log(`      Unidades: ${srv.total_unidades}`);
          console.log(`      Costo: Q ${srv.total_costo}`);
        });
      }
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data?.error) {
      console.error('   Detalles:', error.response.data.error);
    }
    return false;
  }
}

// Ejecutar todos los tests
async function runTests() {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║   TEST DE ENDPOINTS DE REPORTES          ║');
  console.log('╚═══════════════════════════════════════════╝');
  
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('\n❌ No se pudo iniciar sesión. Abortando tests.');
    process.exit(1);
  }
  
  const results = {
    resumenTotal: await testResumenTotal(),
    resumenServicio: await testResumenServicio(),
    consumoServicio: await testConsumoPorServicio()
  };
  
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║          RESUMEN DE RESULTADOS            ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log(`Resumen Total:      ${results.resumenTotal ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Resumen por Servicio: ${results.resumenServicio ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Consumo por Servicio: ${results.consumoServicio ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(r => r === true);
  console.log(`\n${allPassed ? '✅ TODOS LOS TESTS PASARON' : '❌ ALGUNOS TESTS FALLARON'}\n`);
  
  process.exit(allPassed ? 0 : 1);
}

runTests();
