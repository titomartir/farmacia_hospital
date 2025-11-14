import api from './api';

const insumoService = {
  // Insumos
  getInsumos: async (params = {}) => {
    const response = await api.get('/insumos', { params });
    return response.data;
  },

  listarInsumos: async (params = {}) => {
    const response = await api.get('/insumos', { params });
    return response.data.data || response.data;
  },

  getInsumoById: async (id) => {
    const response = await api.get(`/insumos/${id}`);
    return response.data;
  },

  createInsumo: async (data) => {
    const response = await api.post('/insumos', data);
    return response.data;
  },

  updateInsumo: async (id, data) => {
    const response = await api.put(`/insumos/${id}`, data);
    return response.data;
  },

  deleteInsumo: async (id) => {
    const response = await api.delete(`/insumos/${id}`);
    return response.data;
  },

  // Insumos Presentación
  getInsumosPresentaciones: async (params = {}) => {
    const response = await api.get('/insumos/presentaciones/lista', { params });
    return response.data.data;
  },

  // Lotes
  getLotesDisponibles: async (idInsumoPresentacion) => {
    const response = await api.get(`/insumos/presentaciones/${idInsumoPresentacion}/lotes`);
    return response.data;
  },

  getLoteById: async (id) => {
    const response = await api.get(`/lotes/${id}`);
    return response.data;
  }
};

export default insumoService;
