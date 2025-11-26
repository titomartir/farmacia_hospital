import api from './api';

const consolidadoService = {
  // Listar consolidados con filtros
  async listarConsolidados(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.servicio) params.append('servicio', filtros.servicio);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.turno) params.append('turno', filtros.turno);
    if (filtros.encargado) params.append('id_encargado', filtros.encargado);
    if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);

    const response = await api.get(`/consolidados?${params.toString()}`);
    return response.data.data;
  },

  // Obtener consolidado por ID
  async obtenerConsolidado(id) {
    const response = await api.get(`/consolidados/${id}`);
    return response.data.data;
  },

  // Crear nuevo consolidado
  async crearConsolidado(data) {
    const response = await api.post('/consolidados', data);
    return response.data.data;
  },

  // Cerrar consolidado
  async cerrarConsolidado(id) {
    const response = await api.post(`/consolidados/${id}/cerrar`);
    return response.data.data;
  },

  // Anular consolidado
  async anularConsolidado(id, motivo) {
    const response = await api.post(`/consolidados/${id}/anular`, { motivo });
    return response.data.data;
  },

  // Entregar consolidado
  async entregarConsolidado(id, detallesEntregados) {
    const response = await api.post(`/consolidados/${id}/entregar`, {
      detalles_entregados: detallesEntregados,
    });
    return response.data.data;
  },
};

export default consolidadoService;
