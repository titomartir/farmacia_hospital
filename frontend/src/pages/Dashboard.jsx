import { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Container,
  CircularProgress,
  Alert,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Receipt,
  LocalHospital,
  TrendingUp,
  AttachMoney,
} from '@mui/icons-material';

import {
  ResponsiveContainer,
  BarChart,
  PieChart,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  Bar,
  Pie,
  Line
} from 'recharts';
import api from '../services/api';

const Dashboard = () => {
  const theme = useTheme();
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());
  // Estados para las gráficas
  const [consumoServicio, setConsumoServicio] = useState([]);
  const [stockEstado, setStockEstado] = useState([]);
  const [tendenciaRequisiciones, setTendenciaRequisiciones] = useState([]);
  const [proximosVencer, setProximosVencer] = useState([]);
  const [costosServicio, setCostosServicio] = useState([]);

  useEffect(() => {
    cargarDatos();
    // Auto-refresh cada 30 segundos para tiempo real
    const interval = setInterval(() => {
      cargarDatos();
    }, 30000); // 30 segundos
    return () => clearInterval(interval);
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      // Obtener métricas principales y datos de gráficas en paralelo
      const [
        tiempoRealRes,
        consumoRes,
        stockRes,
        tendenciaRes,
        vencerRes,
        costosRes
      ] = await Promise.all([
        api.get('/dashboard/tiempo-real'),
        api.get('/dashboard/graficos/consumo-servicio'),
        api.get('/dashboard/graficos/stock-estado'),
        api.get('/dashboard/graficos/tendencia-requisiciones'),
        api.get('/dashboard/graficos/proximos-vencer'),
        api.get('/dashboard/graficos/costos-servicio'),
      ]);

      if (tiempoRealRes.data.success) {
        setEstadisticas(tiempoRealRes.data.data);
        setUltimaActualizacion(new Date());
        setError('');
      }
      if (consumoRes.data.success) setConsumoServicio(consumoRes.data.data);
      if (stockRes.data.success) setStockEstado(stockRes.data.data);
      if (tendenciaRes.data.success) setTendenciaRequisiciones(tendenciaRes.data.data);
      if (vencerRes.data.success) setProximosVencer(vencerRes.data.data);
      if (costosRes.data.success) setCostosServicio(costosRes.data.data);
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2
    }).format(valor || 0);
  };

  const formatearNumero = (valor) => {
    return new Intl.NumberFormat('es-GT', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor || 0);
  };

  const obtenerHoraFormato = () => {
    const ahora = new Date();
    return ahora.toLocaleTimeString('es-GT', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const StatCard = ({ title, value, icon: Icon, gradient, tipo }) => {
    const esMoneda = tipo === 'costo';
    const valorFormateado = esMoneda ? formatearMoneda(value) : formatearNumero(value);
    return (
      <Card 
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
          color: 'white',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[10],
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -50,
            right: -50,
            width: 150,
            height: 150,
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.9, 
                  mb: 0.5,
                  fontWeight: 500,
                  letterSpacing: '0.5px'
                }}
              >
                {title}
              </Typography>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                  lineHeight: 1.2
                }}
              >
                {valorFormateado}
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 2,
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon sx={{ fontSize: 32 }} />
            </Box>
          </Box>

          {/* Indicador de actualización en tiempo real */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#4ade80',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                '@keyframes pulse': {
                  '0%, 100%': {
                    opacity: 1,
                  },
                  '50%': {
                    opacity: 0.5,
                  },
                },
              }}
            />
            <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem' }}>
              Tiempo Real
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading && !estadisticas) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
              Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Resumen general del sistema de farmacia
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              label={`Última actualización: ${obtenerHoraFormato()}`}
              size="small"
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontWeight: 500
              }}
            />
            <Chip 
              icon={<Box 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: '#4ade80',
                  ml: 1.5
                }} 
              />}
              label="En Línea"
              size="small"
              sx={{ 
                bgcolor: alpha('#4ade80', 0.1),
                color: '#16a34a',
                fontWeight: 500
              }}
            />
          </Box>
        </Box>
        {/* Información del período */}
        {estadisticas?.periodo && (
          <Alert 
            severity="info" 
            sx={{ 
              mt: 2,
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: 24
              }
            }}
          >
            <Typography variant="body2">
              <strong>Período del día:</strong> 10:00 AM - 9:59 AM del día siguiente
              <br />
              <strong>Estado actual:</strong> {estadisticas.periodo.tipo === 'dia_actual' ? 
                'Mostrando datos desde las 10:00 AM de hoy' : 
                'Mostrando datos desde las 10:00 AM de ayer'}
            </Typography>
          </Alert>
        )}
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      {/* Cards de Estadísticas */}
      <Grid container spacing={3}>
        {/* Req. Unidades */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Req. Unidades"
            value={estadisticas?.req_unidades || 0}
            icon={Receipt}
            gradient={['#667eea', '#764ba2']}
            tipo="unidades"
          />
        </Grid>
        {/* Req. Costo */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Req. Costo"
            value={estadisticas?.req_costo || 0}
            icon={AttachMoney}
            gradient={['#f093fb', '#f5576c']}
            tipo="costo"
          />
        </Grid>
        {/* Receta Unidades */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Receta Unidades"
            value={estadisticas?.receta_unidades || 0}
            icon={LocalHospital}
            gradient={['#fa709a', '#fee140']}
            tipo="unidades"
          />
        </Grid>
        {/* Receta Costo */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Receta Costo"
            value={estadisticas?.receta_costo || 0}
            icon={TrendingUp}
            gradient={['#30cfd0', '#330867']}
            tipo="costo"
          />
        </Grid>
      </Grid>
      {/* Información adicional */}
      <Box sx={{ mt: 4 }}>
        <Card 
          elevation={0}
          sx={{ 
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              📊 Resumen del Día
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Requisiciones
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {formatearNumero(estadisticas?.req_unidades || 0)} unidades
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {formatearMoneda(estadisticas?.req_costo || 0)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Recetas
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {formatearNumero(estadisticas?.receta_unidades || 0)} unidades
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {formatearMoneda(estadisticas?.receta_costo || 0)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total General del Día
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                    {formatearMoneda((estadisticas?.req_costo || 0) + (estadisticas?.receta_costo || 0))}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {formatearNumero((estadisticas?.req_unidades || 0) + (estadisticas?.receta_unidades || 0))} unidades totales dispensadas
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Gráficas originales debajo de las tarjetas */}
      <Box sx={{ mt: 6 }}>
        {/* Gráficos */}
        <Grid container spacing={1.5}>
          {/* Gráfico 1: Consumo por Servicio */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  📊 Consumo por Servicio (30 días)
                </Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={consumoServicio}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="servicio" angle={-45} textAnchor="end" height={80} fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip formatter={(value) => `$${parseFloat(value).toFixed(2)}`} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="total_costo" fill="#8884d8" name="Costo Total" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Gráfico 2: Stock por Estado */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  ⚠️ Estado de Stock
                </Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={stockEstado}
                      dataKey="cantidad"
                      nameKey="estado"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {stockEstado.map((entry, index) => {
                        const colors = {
                          'Normal': '#4caf50',
                          'Bajo': '#ff9800',
                          'Crítico': '#f44336',
                          'Agotado': '#9e9e9e'
                        };
                        return <Cell key={`cell-${index}`} fill={colors[entry.estado] || '#8884d8'} />;
                      })}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Gráfico 3: Tendencia de Requisiciones */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  📈 Tendencia de Requisiciones (30 días)
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={tendenciaRequisiciones}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="entregadas" stroke="#4caf50" name="Entregadas" strokeWidth={2} />
                    <Line type="monotone" dataKey="aprobadas" stroke="#2196f3" name="Aprobadas" strokeWidth={2} />
                    <Line type="monotone" dataKey="pendientes" stroke="#ff9800" name="Pendientes" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Gráfico 4: Próximos a Vencer */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  📅 Próximos a Vencer (60 días)
                </Typography>
                <Box sx={{ maxHeight: 280, overflow: 'auto' }}>
                  {proximosVencer.length > 0 ? (
                    proximosVencer.map((item, index) => (
                      <Alert 
                        key={index} 
                        severity={item.dias_restantes < 30 ? 'error' : 'warning'}
                        sx={{ mb: 0.5, py: 0.5, fontSize: '0.85rem', '&:last-child': { mb: 0 } }}
                      >
                        <strong>{item.medicamento}</strong> - {item.presentacion}
                        <br />
                        Lote: {item.numero_lote} | Vence: {new Date(item.fecha_vencimiento).toLocaleDateString()}
                        <br />
                        Stock: {item.cantidad_actual} | Días: {item.dias_restantes}
                      </Alert>
                    ))
                  ) : (
                    <Typography color="textSecondary" variant="body2">No hay medicamentos próximos a vencer</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Gráfico 5: Costos por Servicio */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  💰 Costos por Servicio (30 días)
                </Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={costosServicio} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" fontSize={11} />
                    <YAxis dataKey="servicio" type="category" width={120} fontSize={11} />
                    <Tooltip formatter={(value) => `$${parseFloat(value).toFixed(2)}`} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="costo_total" fill="#82ca9d" name="Costo Total" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;