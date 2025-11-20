const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let token = '';

// Helper para mostrar resultados
const log = (titulo, datos) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ ${titulo}`);
  console.log('='.repeat(60));
  console.log(JSON.stringify(datos, null, 2));
};

const logError = (titulo, error) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`❌ ${titulo}`);
  console.log('='.repeat(60));
  console.log('Error:', error.response?.data || error.message);
};

// TEST 1: Login
async function testLogin() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      nombre_usuario: 'AXEL FERNANDO',
      password: '12345'
    });
    token = response.data.token;
    log('TEST 1: Login exitoso', { usuario: response.data.usuario.nombre_usuario });
    return true;
  } catch (error) {
    logError('TEST 1: Login fallido', error);
    return false;
  }
}

// TEST 2: Crear insumo con clasificación VIH
async function testCrearInsumoVIH() {
  try {
    const response = await axios.post(
      `${BASE_URL}/insumos`,
      {
        nombre: 'Antirretroviral Test ' + Date.now(),
        descripcion: 'Medicamento para VIH',
        clasificacion: 'vih',
        subclasificacion: 'requisicion'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    log('TEST 2: Insumo VIH creado', response.data.data);
    return response.data.data;
  } catch (error) {
    logError('TEST 2: Error al crear insumo VIH', error);
    return null;
  }
}

// TEST 3: Crear insumo con clasificación Método Anticonceptivo
async function testCrearInsumoAnticonceptivo() {
  try {
    const response = await axios.post(
      `${BASE_URL}/insumos`,
      {
        nombre: 'Anticonceptivo Test ' + Date.now(),
        descripcion: 'Método anticonceptivo',
        clasificacion: 'metodo_anticonceptivo',
        subclasificacion: 'receta'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    log('TEST 3: Insumo Anticonceptivo creado', response.data.data);
    return response.data.data;
  } catch (error) {
    logError('TEST 3: Error al crear insumo anticonceptivo', error);
    return null;
  }
}

// TEST 4: Listar insumos filtrados por clasificación
async function testFiltrarPorClasificacion(clasificacion) {
  try {
    const response = await axios.get(`${BASE_URL}/insumos`, {
      params: { clasificacion, page: 1, limit: 5 },
      headers: { Authorization: `Bearer ${token}` }
    });
    log(`TEST 4: Insumos con clasificación "${clasificacion}"`, {
      total: response.data.totalRegistros,
      registros: response.data.data.length,
      primeros: response.data.data.slice(0, 3).map(i => ({
        id: i.id_insumo,
        nombre: i.nombre,
        clasificacion: i.clasificacion,
        subclasificacion: i.subclasificacion
      }))
    });
    return true;
  } catch (error) {
    logError(`TEST 4: Error al filtrar por clasificación ${clasificacion}`, error);
    return false;
  }
}

// TEST 5: Crear ingreso con fecha y hora
async function testCrearIngresoConFechaHora() {
  try {
    // Primero obtener un proveedor
    const proveedoresRes = await axios.get(`${BASE_URL}/proveedores`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const proveedor = proveedoresRes.data.data[0];
    
    const fechaHoraActual = new Date().toISOString();
    
    const response = await axios.post(
      `${BASE_URL}/ingresos`,
      {
        id_proveedor: proveedor.id_proveedor,
        tipo_ingreso: 'COMPRA',
        fecha_ingreso: fechaHoraActual,
        numero_factura: 'FACT-TEST-' + Date.now(),
        observaciones: 'Test de fecha y hora',
        detalles: []
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    log('TEST 5: Ingreso con fecha y hora creado', {
      id: response.data.data.id_ingreso,
      fecha_ingreso: response.data.data.fecha_ingreso,
      fecha_enviada: fechaHoraActual,
      coincide_hora: response.data.data.fecha_ingreso.includes('T')
    });
    return response.data.data;
  } catch (error) {
    logError('TEST 5: Error al crear ingreso con fecha y hora', error);
    return null;
  }
}

// TEST 6: Crear requisición con fecha y hora
async function testCrearRequisicionConFechaHora() {
  try {
    // Obtener un servicio
    const serviciosRes = await axios.get(`${BASE_URL}/servicios`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const servicio = serviciosRes.data.data[0];
    
    const fechaHoraActual = new Date().toISOString();
    
    const response = await axios.post(
      `${BASE_URL}/requisiciones`,
      {
        id_servicio: servicio.id_servicio,
        fecha_solicitud: fechaHoraActual,
        prioridad: 'normal',
        observaciones: 'Test de fecha y hora',
        detalles: []
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    log('TEST 6: Requisición con fecha y hora creada', {
      id: response.data.data.id_requisicion,
      fecha_solicitud: response.data.data.fecha_solicitud,
      fecha_enviada: fechaHoraActual,
      coincide_hora: response.data.data.fecha_solicitud.includes('T')
    });
    return response.data.data;
  } catch (error) {
    logError('TEST 6: Error al crear requisición con fecha y hora', error);
    return null;
  }
}

// TEST 7: Crear consolidado con fecha y hora
async function testCrearConsolidadoConFechaHora() {
  try {
    // Obtener un servicio
    const serviciosRes = await axios.get(`${BASE_URL}/servicios`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const servicio = serviciosRes.data.data[0];
    
    const fechaHoraActual = new Date().toISOString();
    
    const response = await axios.post(
      `${BASE_URL}/consolidados`,
      {
        id_servicio: servicio.id_servicio,
        fecha_consolidado: fechaHoraActual,
        turno: 'diurno',
        encargado: 'Test Usuario',
        observaciones: 'Test de fecha y hora',
        detalles: []
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    log('TEST 7: Consolidado con fecha y hora creado', {
      id: response.data.data.id_consolidado,
      fecha_consolidado: response.data.data.fecha_consolidado,
      fecha_enviada: fechaHoraActual,
      coincide_hora: response.data.data.fecha_consolidado.includes('T')
    });
    return response.data.data;
  } catch (error) {
    logError('TEST 7: Error al crear consolidado con fecha y hora', error);
    return null;
  }
}

// Ejecutar todas las pruebas
async function ejecutarTests() {
  console.log('\n🧪 INICIANDO PRUEBAS DE DATETIME Y CLASIFICACIÓN\n');
  
  // Test 1: Login
  const loginOk = await testLogin();
  if (!loginOk) {
    console.log('\n❌ No se pudo hacer login. Abortando pruebas.');
    return;
  }
  
  // Test 2 y 3: Crear insumos con clasificación
  await testCrearInsumoVIH();
  await testCrearInsumoAnticonceptivo();
  
  // Test 4: Filtrar por clasificación
  await testFiltrarPorClasificacion('vih');
  await testFiltrarPorClasificacion('metodo_anticonceptivo');
  await testFiltrarPorClasificacion('listado_basico');
  
  // Test 5, 6, 7: Crear registros con fecha y hora
  await testCrearIngresoConFechaHora();
  await testCrearRequisicionConFechaHora();
  await testCrearConsolidadoConFechaHora();
  
  console.log('\n✅ PRUEBAS COMPLETADAS\n');
}

// Ejecutar
ejecutarTests().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
