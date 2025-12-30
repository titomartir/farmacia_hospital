import api from './api';

const kardexService = {
  // Obtener datos de kardex para un medicamento
  obtenerKardex: async (idInsumo, fechaInicio, fechaFin, filtros = {}) => {
    try {
      const response = await api.get(`/reportes/kardex/${idInsumo}`, {
        params: {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          ...filtros
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener kardex:', error);
      throw error;
    }
  },

  // Generar PDF del kardex
  generarPDF: async (idInsumo, fechaInicio, fechaFin, filtros = {}) => {
    try {
      const response = await api.get(`/reportes/kardex/${idInsumo}/pdf`, {
        params: {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          ...filtros
        },
        responseType: 'blob'
      });
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `kardex_${idInsumo}_${fechaInicio}_${fechaFin}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return response.data;
    } catch (error) {
      console.error('Error al generar PDF kardex:', error);
      throw error;
    }
  },

  // Exportar a Excel
  exportarExcel: async (idInsumo, fechaInicio, fechaFin, filtros = {}) => {
    try {
      const response = await api.get(`/reportes/kardex/${idInsumo}/excel`, {
        params: {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          ...filtros
        },
        responseType: 'blob'
      });
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `kardex_${idInsumo}_${fechaInicio}_${fechaFin}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return response.data;
    } catch (error) {
      console.error('Error al exportar Excel kardex:', error);
      throw error;
    }
  }
};

export default kardexService;
