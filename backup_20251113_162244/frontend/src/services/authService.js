import api from './api';

export const authService = {
  // Login
  login: async (nombre_usuario, password) => {
    try {
      const response = await api.post('/auth/login', {
        nombre_usuario,
        password
      });
      
      if (response.data.success) {
        const { token, usuario } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(usuario));
        return { success: true, data: response.data.data };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al iniciar sesión'
      };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Cambiar contraseña
  changePassword: async (password_actual, password_nueva) => {
    try {
      const response = await api.post('/auth/cambiar-password', {
        password_actual,
        password_nueva
      });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      throw error;
    }
  }
};

export default authService;
