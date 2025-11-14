import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  usuario: JSON.parse(localStorage.getItem('usuario')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.usuario = action.payload.usuario;
      state.token = action.payload.token;
      state.error = null;
      
      // Guardar en localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('usuario', JSON.stringify(action.payload.usuario));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.usuario = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
