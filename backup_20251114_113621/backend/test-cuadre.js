const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testCuadreSystem() {
  try {
    console.log('=== TEST SISTEMA DE CUADRE DIARIO ===\n');

    // 1. Login (usamos usuario 1 - ANA MERCEDES que es farmaceutico)
    console.log('1. Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      nombre_usuario: 'ANA MERCEDES',
      password: 'usuario' // Contraseña genérica según hashear-passwords.js
    });
    
    const token = loginResponse.data.data.token;
    console.log('✓ Login exitoso');
    console.log(`Token: ${token.substring(0, 20)}...\n`);

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // 2. Ver stock 24h configurado
    console.log('2. Consultando stock 24h configurado...');
    const stockResponse = await axios.get(`${BASE_URL}/stock-24h`, config);
    console.log(`✓ ${stockResponse.data.data.length} medicamentos configurados`);
    stockResponse.data.data.slice(0, 3).forEach(s => {
      console.log(`  - ${s.insumo_presentacion?.insumo?.nombre_insumo || 'N/A'}: ${s.cantidad_actual}/${s.cantidad_fija}`);
    });
    console.log('');

    // 3. Iniciar cuadre diario
    console.log('3. Iniciando cuadre diario...');
    const cuadreResponse = await axios.post(`${BASE_URL}/cuadres`, {
      id_personal_turnista: 10, // ID de personal de turno
      id_personal_bodeguero: 11, // ID de personal bodeguero
      observaciones: 'Cuadre diario de prueba automatizado'
    }, config);
    
    const cuadre = cuadreResponse.data.data;
    console.log(`✓ Cuadre iniciado con ID: ${cuadre.id_cuadre_stock}`);
    console.log(`  Fecha: ${cuadre.fecha_cuadre}`);
    console.log(`  Items a contar: ${cuadre.detalles.length}`);
    console.log('  Primeros 3 items:');
    cuadre.detalles.slice(0, 3).forEach(d => {
      console.log(`    - ${d.insumo_presentacion?.insumo?.nombre_insumo || 'N/A'}: ${d.cantidad_teorica} unidades (teórico)`);
    });
    console.log('');

    // 4. Registrar conteo físico (simulamos contar los primeros 3 items)
    console.log('4. Registrando conteos físicos...');
    for (let i = 0; i < Math.min(3, cuadre.detalles.length); i++) {
      const detalle = cuadre.detalles[i];
      // Simulamos pequeñas diferencias en el conteo
      const cantidadFisica = parseFloat(detalle.cantidad_teorica) + (Math.random() > 0.5 ? 1 : -1);
      
      await axios.put(
        `${BASE_URL}/cuadres/${cuadre.id_cuadre_stock}/detalles/${detalle.id_detalle_cuadre}`,
        { cantidad_fisica: cantidadFisica },
        config
      );
      
      const diff = cantidadFisica - parseFloat(detalle.cantidad_teorica);
      console.log(`  ✓ ${detalle.insumo_presentacion?.insumo?.nombre_insumo || 'N/A'}: ${cantidadFisica} (${diff >= 0 ? '+' : ''}${diff})`);
    }
    console.log('');

    // 5. Consultar cuadre actualizado
    console.log('5. Consultando cuadre actualizado...');
    const cuadreDetailResponse = await axios.get(`${BASE_URL}/cuadres/${cuadre.id_cuadre_stock}`, config);
    const cuadreActualizado = cuadreDetailResponse.data.data;
    console.log(`  Estado: ${cuadreActualizado.estado_cuadre}`);
    console.log(`  Items contados: ${cuadreActualizado.detalles.filter(d => d.cantidad_fisica !== null).length}/${cuadreActualizado.detalles.length}`);
    console.log('');

    console.log('=== TEST COMPLETADO EXITOSAMENTE ===');

  } catch (error) {
    console.error('❌ Error en el test:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

testCuadreSystem();
