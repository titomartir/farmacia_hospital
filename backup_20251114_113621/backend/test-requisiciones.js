const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let token = '';
let requisicionId = null;

// Configurar axios para incluir el token
const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

async function test() {
  console.log('\n=== INICIANDO PRUEBAS DE MÓDULO REQUISICIONES ===\n');

  try {
    // 1. Login
    console.log('[1/7] Login...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      nombre_usuario: 'ANA MERCEDES',
      password: 'usuario',
    });
    token = loginRes.data.data.token;
    console.log('✅ Login exitoso');

    // 2. Listar servicios
    console.log('\n[2/7] Obtener catálogo de servicios...');
    const serviciosRes = await api.get('/catalogos/servicios');
    const servicios = serviciosRes.data.data;
    console.log(`✅ Servicios obtenidos: ${servicios.length}`);
    const primerServicio = servicios[0];

    // 3. Obtener insumos
    console.log('\n[3/7] Obtener insumos/presentaciones...');
    const insumosRes = await api.get('/insumos/presentaciones/lista');
    const insumos = insumosRes.data.data;
    console.log(`✅ Insumos obtenidos: ${insumos.length}`);

    // 4. Crear requisición
    console.log('\n[4/7] Crear nueva requisición...');
    const nuevaRequisicion = {
      id_servicio: primerServicio.id_servicio,
      fecha_solicitud: new Date().toISOString().split('T')[0],
      prioridad: 'urgente',
      observaciones: 'Requisición de prueba - TEST',
      detalles: [
        {
          id_insumo_presentacion: insumos[0].id_insumo_presentacion,
          cantidad_solicitada: 10,
          observaciones: 'Medicamento 1',
        },
        {
          id_insumo_presentacion: insumos[1].id_insumo_presentacion,
          cantidad_solicitada: 5,
          observaciones: 'Medicamento 2',
        },
      ],
    };

    const crearRes = await api.post('/requisiciones', nuevaRequisicion);
    requisicionId = crearRes.data.data.id_requisicion;
    console.log(`✅ Requisición creada: ID ${requisicionId}`);
    console.log(`   Servicio: ${primerServicio.nombre_servicio}`);
    console.log(`   Prioridad: ${nuevaRequisicion.prioridad}`);
    console.log(`   Detalles: ${nuevaRequisicion.detalles.length} items`);

    // 5. Listar requisiciones
    console.log('\n[5/7] Listar requisiciones...');
    const listarRes = await api.get('/requisiciones');
    console.log(`✅ Requisiciones listadas: ${listarRes.data.data.length}`);

    // 6. Aprobar requisición
    console.log('\n[6/7] Aprobar requisición...');
    const requisicionDetalle = await api.get(`/requisiciones/${requisicionId}`);
    const detallesAutorizar = requisicionDetalle.data.data.detalles.map(
      (d) => ({
        id_detalle_requisicion: d.id_detalle_requisicion,
        cantidad_autorizada: d.cantidad_solicitada, // Autorizar todo lo solicitado
      })
    );

    await api.post(`/requisiciones/${requisicionId}/aprobar`, {
      detalles_autorizados: detallesAutorizar,
    });
    console.log(`✅ Requisición aprobada: ID ${requisicionId}`);

    // 7. Entregar requisición
    console.log('\n[7/7] Entregar requisición...');
    
    // Obtener lotes disponibles
    const lotesRes = await api.get('/ingresos/lotes');
    const lotes = lotesRes.data.data;
    
    const requisicionAprobada = await api.get(`/requisiciones/${requisicionId}`);
    const detallesEntregar = requisicionAprobada.data.data.detalles.map(
      (d) => {
        // Buscar un lote para este insumo
        const loteDisponible = lotes.find(
          (l) => l.id_insumo_presentacion === d.id_insumo_presentacion
        );

        return {
          id_detalle_requisicion: d.id_detalle_requisicion,
          cantidad_entregada: d.cantidad_autorizada,
          id_lote: loteDisponible?.id_lote || null,
          precio_unitario: 5.5,
        };
      }
    );

    await api.post(`/requisiciones/${requisicionId}/entregar`, {
      detalles_entregados: detallesEntregar,
    });
    console.log(`✅ Requisición entregada: ID ${requisicionId}`);

    // Obtener detalle final
    console.log('\n[RESULTADO FINAL] Detalle de requisición completa:');
    const finalRes = await api.get(`/requisiciones/${requisicionId}`);
    const reqFinal = finalRes.data.data;
    console.log(`   ID: ${reqFinal.id_requisicion}`);
    console.log(`   Estado: ${reqFinal.estado}`);
    console.log(`   Servicio: ${reqFinal.servicio.nombre_servicio}`);
    console.log(`   Prioridad: ${reqFinal.prioridad}`);
    console.log(
      `   Solicitante: ${reqFinal.usuarioSolicita.personal.nombres} ${reqFinal.usuarioSolicita.personal.apellidos}`
    );
    console.log(
      `   Autorizado por: ${reqFinal.usuarioAutoriza.personal.nombres} ${reqFinal.usuarioAutoriza.personal.apellidos}`
    );
    console.log(
      `   Entregado por: ${reqFinal.usuarioEntrega.personal.nombres} ${reqFinal.usuarioEntrega.personal.apellidos}`
    );
    console.log(`   Detalles:`);
    reqFinal.detalles.forEach((d, i) => {
      const total =
        (d.cantidad_entregada || 0) * (d.precio_unitario || 0);
      console.log(
        `     ${i + 1}. ${d.insumoPresentacion.insumo.nombre_generico} - Solicitado: ${d.cantidad_solicitada}, Autorizado: ${d.cantidad_autorizada}, Entregado: ${d.cantidad_entregada}, Total: Q${total.toFixed(2)}`
      );
    });

    const totalGeneral = reqFinal.detalles.reduce(
      (sum, d) =>
        sum +
        (d.cantidad_entregada || 0) * (d.precio_unitario || 0),
      0
    );
    console.log(`   TOTAL GENERAL: Q${totalGeneral.toFixed(2)}`);

    console.log('\n=== TEST COMPLETADO EXITOSAMENTE ===');
    console.log('✅ MÓDULO REQUISICIONES AL 100%');
  } catch (error) {
    console.error('\n❌ ERROR EN PRUEBAS:');
    console.error('Mensaje:', error.response?.data?.message || error.message);
    console.error('Detalles:', error.response?.data || error);
    process.exit(1);
  }
}

test();
