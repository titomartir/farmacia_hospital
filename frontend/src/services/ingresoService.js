import api from './api';

const ingresoService = {
  // Listar ingresos
  async listarIngresos(params = {}) {
    const response = await api.get('/ingresos', { params });
    return response.data.data;
  },

  // Obtener ingreso por ID
  async obtenerIngreso(id) {
    const response = await api.get(`/ingresos/${id}`);
    return response.data.data;
  },

  // Crear nuevo ingreso
  async crearIngreso(data) {
    const response = await api.post('/ingresos', data);
    return response.data.data;
  },

  // Anular ingreso
  async anularIngreso(id, motivo) {
    const response = await api.put(`/ingresos/${id}/anular`, {
      motivo_anulacion: motivo,
    });
    return response.data.data;
  },

  // Obtener estadísticas
  async obtenerEstadisticas(params = {}) {
    const response = await api.get('/ingresos/estadisticas', { params });
    return response.data.data;
  },

  // Obtener lotes disponibles
  async getLotes(idInsumoPresentacion = null) {
    const params = {};
    if (idInsumoPresentacion) {
      params.id_insumo_presentacion = idInsumoPresentacion;
    }
    const response = await api.get('/ingresos/lotes', { params });
    return response.data.data;
  },
};

export default ingresoService;
