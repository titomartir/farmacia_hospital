import api from './api';

const requisicionService = {
  // Listar requisiciones con filtros
  async listarRequisiciones(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.prioridad) params.append('prioridad', filtros.prioridad);
    if (filtros.servicio) params.append('id_servicio', filtros.servicio);
    if (filtros.solicitante) params.append('id_solicitante', filtros.solicitante);

    const response = await api.get(`/requisiciones?${params.toString()}`);
    return response.data.data;
  },

  // Obtener requisición por ID
  async obtenerRequisicion(id) {
    const response = await api.get(`/requisiciones/${id}`);
    return response.data.data;
  },

  // Crear nueva requisición
  async crearRequisicion(data) {
    const response = await api.post('/requisiciones', data);
    return response.data.data;
  },

  // Actualizar requisición
  async actualizarRequisicion(id, data) {
    const response = await api.put(`/requisiciones/${id}`, data);
    return response.data.data;
  },

  // Aprobar requisición
  async aprobarRequisicion(id, detallesAutorizados) {
    const response = await api.post(`/requisiciones/${id}/aprobar`, {
      detalles_autorizados: detallesAutorizados,
    });
    return response.data.data;
  },

  // Entregar requisición
  async entregarRequisicion(id, detallesEntregados) {
    const response = await api.post(`/requisiciones/${id}/entregar`, {
      detalles_entregados: detallesEntregados,
    });
    return response.data.data;
  },

  // Rechazar requisición
  async rechazarRequisicion(id, motivo) {
    const response = await api.post(`/requisiciones/${id}/rechazar`, { motivo });
    return response.data.data;
  },
};

export default requisicionService;
