import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { LocalHospital } from '@mui/icons-material';
import { loginStart, loginSuccess, loginFailure } from '../redux/slices/authSlice';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(loginStart());

    try {
      console.log('Enviando login...');
      const response = await api.post('/auth/login', formData);
      console.log('Respuesta del login:', response.data);
      
      if (response.data.success) {
        console.log('Login exitoso, guardando datos...');
        dispatch(loginSuccess(response.data.data));
        console.log('Navegando a dashboard...');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error en login:', err);
      const errorMsg = err.response?.data?.message || 'Error al iniciar sesión';
      setError(errorMsg);
      dispatch(loginFailure(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LocalHospital sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Sistema de Farmacia
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ingrese sus credenciales para continuar
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Usuario"
              name="nombre_usuario"
              value={formData.nombre_usuario}
              onChange={handleChange}
              margin="normal"
              required
              autoFocus
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Contraseña"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
            </Button>
          </form>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
            Sistema de Gestión de Farmacia v1.0
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
