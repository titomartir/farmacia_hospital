import api from './api';

const servicioService = {
  // Listar todos los servicios/departamentos
  async listarServicios() {
    const response = await api.get('/catalogos/servicios');
    return response.data.data;
  },
};

export default servicioService;
