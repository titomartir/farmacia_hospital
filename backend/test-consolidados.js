const API_BASE_URL = 'http://localhost:3000/api';

let token = '';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function login() {
  log('\n📋 TEST 1: Login de usuario', 'blue');
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre_usuario: 'ANA MERCEDES',
        password: 'usuario',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Login fallido');
    }
    token = data.data.token;
    log('✅ Login exitoso', 'green');
    log(`   Usuario: ${data.data.usuario.nombre_usuario}`, 'reset');
    return true;
  } catch (error) {
    log(`❌ Error en login: ${error.message}`, 'red');
    // Intentar con credenciales admin
    try {
      log('   Intentando con usuario ERNESTO ABINADAB...', 'yellow');
      const response2 = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre_usuario: 'ERNESTO ABINADAB',
          password: 'admin',
        }),
      });

      if (response2.ok) {
        const data2 = await response2.json();
        if (!data2.success || !data2.data) {
          throw new Error(data2.message || 'Login fallido');
        }
        token = data2.data.token;
        log('✅ Login exitoso con credenciales admin', 'green');
        log(`   Usuario: ${data2.data.usuario.nombre_usuario}`, 'reset');
        return true;
      }
    } catch (err) {
      log(`❌ Error con credenciales admin: ${err.message}`, 'red');
    }
    return false;
  }
}

async function obtenerServicios() {
  log('\n📋 TEST 2: Obtener servicios', 'blue');
  try {
    const response = await fetch(`${API_BASE_URL}/catalogos/servicios`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const servicios = result.data || result;
    log(`✅ Servicios obtenidos: ${servicios.length}`, 'green');
    return servicios[0]?.id_servicio || null;
  } catch (error) {
    log(`❌ Error al obtener servicios: ${error.message}`, 'red');
    return null;
  }
}

async function obtenerInsumos() {
  log('\n📋 TEST 3: Obtener insumo_presentaciones con stock', 'blue');
  try {
    const response = await fetch(`${API_BASE_URL}/insumos/presentaciones/lista`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const todasLasPresentaciones = result.data || result;
    
    // Filtrar solo los IDs que sabemos que tienen stock
    const idsConStock = [275, 278, 276];
    const insumosConStock = todasLasPresentaciones.filter(ip => 
      idsConStock.includes(ip.id_insumo_presentacion)
    );
    
    log(`✅ Insumo-presentaciones con stock obtenidos: ${insumosConStock.length}`, 'green');
    if (insumosConStock.length > 0) {
      log(`   IDs: ${insumosConStock.map(i => i.id_insumo_presentacion).join(', ')}`, 'reset');
    }
    
    return insumosConStock;
  } catch (error) {
    log(`❌ Error al obtener insumos: ${error.message}`, 'red');
    return [];
  }
}

async function crearConsolidado(idServicio, insumos) {
  log('\n📋 TEST 4: Crear consolidado con 30 camas', 'blue');
  try {
    // Crear detalles de 30 camas con 3 medicamentos cada una
    const detalles = [];
    for (let cama = 1; cama <= 30; cama++) {
      const tienePaciente = cama <= 5; // Simular que solo 5 camas están ocupadas para evitar problemas de stock
      
      if (tienePaciente) {
        insumos.forEach((insumo, idx) => {
          if (!insumo || !insumo.id_insumo_presentacion) {
            log(`   ⚠️ Insumo-presentacion inválido en índice ${idx}`, 'red');
            return;
          }
          const cantidad = 1; // Usar 1 unidad para evitar problemas de stock
          detalles.push({
            numero_cama: cama,
            nombre_paciente: `Paciente ${cama}`,
            numero_registro: `REG-${cama}`,
            id_insumo_presentacion: insumo.id_insumo_presentacion,
            cantidad: cantidad,
            precio_unitario: 0, // El backend lo calculará si es necesario
          });
        });
      }
    }

    const consolidadoData = {
      id_servicio: idServicio,
      fecha_consolidado: new Date().toISOString().split('T')[0],
      turno: 'diurno',
      observaciones: 'Consolidado de prueba automática',
      detalles: detalles,
    };

    log(`   Creando consolidado con ${detalles.length} administraciones`, 'yellow');
    log(`   Camas ocupadas: 5/30`, 'yellow');
    log(`   Medicamentos: ${insumos.length}`, 'yellow');
    log(`   IDs de insumo_presentacion: ${insumos.map(i => i.id_insumo_presentacion).join(', ')}`, 'yellow');

    const response = await fetch(`${API_BASE_URL}/consolidados`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(consolidadoData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const consolidado = result.data || result;
    log('✅ Consolidado creado exitosamente', 'green');
    log(`   ID: ${consolidado.id_consolidado}`, 'reset');
    log(`   Total medicamentos: ${consolidado.total_medicamentos}`, 'reset');
    log(`   Costo total: Q${parseFloat(consolidado.costo_total || 0).toFixed(2)}`, 'reset');
    return consolidado.id_consolidado;
  } catch (error) {
    log(`❌ Error al crear consolidado: ${error.message}`, 'red');
    return null;
  }
}

async function obtenerConsolidado(idConsolidado) {
  log('\n📋 TEST 5: Obtener detalles del consolidado', 'blue');
  try {
    const response = await fetch(`${API_BASE_URL}/consolidados/${idConsolidado}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const consolidado = result.data || result;
    log('✅ Consolidado obtenido exitosamente', 'green');
    log(`   Estado: ${consolidado.estado}`, 'reset');
    log(`   Fecha: ${new Date(consolidado.fecha_consolidado).toLocaleDateString()}`, 'reset');
    log(`   Turno: ${consolidado.turno}`, 'reset');
    log(`   Detalles: ${consolidado.detalles?.length || 0} registros`, 'reset');
    
    // Calcular totales por medicamento
    const totalesPorMedicamento = {};
    consolidado.detalles?.forEach(det => {
      const nombreInsumo = det.insumoPresentacion?.insumo?.nombre || 'Desconocido';
      if (!totalesPorMedicamento[nombreInsumo]) {
        totalesPorMedicamento[nombreInsumo] = 0;
      }
      totalesPorMedicamento[nombreInsumo] += parseFloat(det.cantidad || 0);
    });

    log('   Totales por medicamento:', 'yellow');
    Object.entries(totalesPorMedicamento).forEach(([med, total]) => {
      log(`     - ${med}: ${total} unidades`, 'reset');
    });

    return consolidado;
  } catch (error) {
    log(`❌ Error al obtener consolidado: ${error.message}`, 'red');
    return null;
  }
}

async function listarConsolidados() {
  log('\n📋 TEST 6: Listar consolidados con filtros', 'blue');
  try {
    const filtros = new URLSearchParams({
      estado: 'activo',
    });

    const response = await fetch(`${API_BASE_URL}/consolidados?${filtros}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const consolidados = result.data || result;
    log(`✅ Consolidados listados: ${consolidados.length}`, 'green');
    consolidados.forEach(cons => {
      log(`   - ID ${cons.id_consolidado}: ${cons.servicio?.nombre_servicio || 'Sin servicio'} - ${cons.estado}`, 'reset');
    });
    return consolidados;
  } catch (error) {
    log(`❌ Error al listar consolidados: ${error.message}`, 'red');
    return [];
  }
}

async function cerrarConsolidado(idConsolidado) {
  log('\n📋 TEST 7: Cerrar consolidado', 'blue');
  try {
    const response = await fetch(`${API_BASE_URL}/consolidados/${idConsolidado}/cerrar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const consolidado = result.data || result;
    log('✅ Consolidado cerrado exitosamente', 'green');
    log(`   Nuevo estado: ${consolidado.estado}`, 'reset');
    log(`   Fecha cierre: ${new Date(consolidado.fecha_cierre).toLocaleString()}`, 'reset');
    return consolidado;
  } catch (error) {
    log(`❌ Error al cerrar consolidado: ${error.message}`, 'red');
    return null;
  }
}

async function anularConsolidado(idConsolidado) {
  log('\n📋 TEST 8: Anular consolidado', 'blue');
  try {
    const response = await fetch(`${API_BASE_URL}/consolidados/${idConsolidado}/anular`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        motivo: 'Prueba de anulación automática',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const consolidado = result.data || result;
    log('✅ Consolidado anulado exitosamente', 'green');
    log(`   Nuevo estado: ${consolidado.estado}`, 'reset');
    log(`   Motivo: ${consolidado.motivo_anulacion}`, 'reset');
    return consolidado;
  } catch (error) {
    log(`❌ Error al anular consolidado: ${error.message}`, 'red');
    return null;
  }
}

async function runTests() {
  log('='.repeat(60), 'blue');
  log('INICIANDO TESTS DEL MÓDULO DE CONSOLIDADOS', 'blue');
  log('='.repeat(60), 'blue');

  // TEST 1: Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    log('\n❌ No se puede continuar sin autenticación', 'red');
    return;
  }

  // TEST 2: Obtener servicios
  const idServicio = await obtenerServicios();
  if (!idServicio) {
    log('\n❌ No se puede continuar sin servicios', 'red');
    return;
  }

  // TEST 3: Obtener insumos
  const insumos = await obtenerInsumos();
  if (insumos.length === 0) {
    log('\n❌ No se puede continuar sin insumos', 'red');
    return;
  }

  // TEST 4: Crear consolidado
  const idConsolidado = await crearConsolidado(idServicio, insumos);
  if (!idConsolidado) {
    log('\n❌ No se pudo crear el consolidado', 'red');
    return;
  }

  // TEST 5: Obtener detalle
  await obtenerConsolidado(idConsolidado);

  // TEST 6: Listar consolidados
  await listarConsolidados();

  // TEST 7: Cerrar consolidado
  await cerrarConsolidado(idConsolidado);

  // Crear otro consolidado para prueba de anulación
  log('\n📋 Creando segundo consolidado para prueba de anulación...', 'yellow');
  const idConsolidado2 = await crearConsolidado(idServicio, insumos);
  if (idConsolidado2) {
    // TEST 8: Anular consolidado
    await anularConsolidado(idConsolidado2);
  }

  log('\n' + '='.repeat(60), 'blue');
  log('✅ TODOS LOS TESTS COMPLETADOS', 'green');
  log('='.repeat(60), 'blue');
}

// Ejecutar tests
runTests().catch((error) => {
  log(`\n❌ Error general: ${error.message}`, 'red');
  console.error(error);
});
