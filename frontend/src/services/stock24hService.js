import api from './api';

const stock24hService = {
  // Stock 24h
  getStock24h: async (params = {}) => {
    const response = await api.get('/stock-24h', { params });
    return response.data;
  },

  getStockById: async (id) => {
    const response = await api.get(`/stock-24h/${id}`);
    return response.data;
  },

  configurarStock: async (id, data) => {
    const response = await api.put(`/stock-24h/${id}/configurar`, data);
    return response.data;
  },

  agregarMedicamentoStock24h: async (data) => {
    const response = await api.post('/stock-24h/agregar', data);
    return response.data;
  },

  getAlertas: async () => {
    const response = await api.get('/stock-24h/alertas');
    return response.data;
  },

  getEstadisticas: async () => {
    const response = await api.get('/stock-24h/estadisticas');
    return response.data;
  },

  // Reposiciones
  getReposiciones: async (params = {}) => {
    const response = await api.get('/stock-24h/reposiciones', { params });
    return response.data;
  },

  getReposicionById: async (id) => {
    const response = await api.get(`/stock-24h/reposiciones/${id}`);
    return response.data;
  },

  crearReposicion: async (data) => {
    const response = await api.post('/stock-24h/reposiciones', data);
    return response.data;
  },

  // Cuadres
  getCuadres: async (params = {}) => {
    const response = await api.get('/cuadres', { params });
    return response.data;
  },

  getCuadreById: async (id) => {
    const response = await api.get(`/cuadres/${id}`);
    return response.data;
  },

  iniciarCuadre: async (data) => {
    const response = await api.post('/cuadres', data);
    return response.data;
  },

  registrarConteo: async (idCuadre, idDetalle, data) => {
    const response = await api.put(`/cuadres/${idCuadre}/detalles/${idDetalle}`, data);
    return response.data;
  },

  finalizarCuadre: async (id) => {
    const response = await api.put(`/cuadres/${id}/finalizar`);
    return response.data;
  }
};

export default stock24hService;
