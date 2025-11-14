import { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Alert,
  Container,
} from '@mui/material';
import {
  Inventory,
  Warning,
  TrendingUp,
  Notifications,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';

const Dashboard = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Datos para gráficos
  const [consumoServicio, setConsumoServicio] = useState([]);
  const [stockEstado, setStockEstado] = useState([]);
  const [tendenciaRequisiciones, setTendenciaRequisiciones] = useState([]);
  const [proximosVencer, setProximosVencer] = useState([]);
  const [costosServicio, setCostosServicio] = useState([]);

  useEffect(() => {
    cargarDatos();
    // Auto-refresh cada 5 minutos
    const interval = setInterval(cargarDatos, 300000);
    return () => clearInterval(interval);
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [
        statsRes,
        alertasRes,
        consumoRes,
        stockRes,
        tendenciaRes,
        vencerRes,
        costosRes,
      ] = await Promise.all([
        api.get('/dashboard/estadisticas'),
        api.get('/dashboard/alertas?limit=5'),
        api.get('/dashboard/graficos/consumo-servicio'),
        api.get('/dashboard/graficos/stock-estado'),
        api.get('/dashboard/graficos/tendencia-requisiciones'),
        api.get('/dashboard/graficos/proximos-vencer'),
        api.get('/dashboard/graficos/costos-servicio'),
      ]);

      if (statsRes.data.success) {
        setEstadisticas(statsRes.data.data);
      }

      if (alertasRes.data.success) {
        setAlertas(alertasRes.data.data);
      }

      if (consumoRes.data.success) {
        setConsumoServicio(consumoRes.data.data);
      }

      if (stockRes.data.success) {
        setStockEstado(stockRes.data.data);
      }

      if (tendenciaRes.data.success) {
        setTendenciaRequisiciones(tendenciaRes.data.data);
      }

      if (vencerRes.data.success) {
        setProximosVencer(vencerRes.data.data);
      }

      if (costosRes.data.success) {
        setCostosServicio(costosRes.data.data);
      }
    } catch (err) {
      setError('Error al cargar los datos del dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card elevation={2}>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography color="textSecondary" variant="body2" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.75rem' }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: `${color}.light`,
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <Typography>Cargando...</Typography>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 600 }}>
        Dashboard
      </Typography>

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Total Insumos"
            value={estadisticas?.totalInsumos || 0}
            icon={<Inventory sx={{ color: 'primary.main', fontSize: 28 }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Alertas Activas"
            value={estadisticas?.alertasActivas || 0}
            icon={<Warning sx={{ color: 'warning.main', fontSize: 28 }} />}
            color="warning"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Próximos a Vencer"
            value={estadisticas?.lotesProximosVencer || 0}
            icon={<TrendingUp sx={{ color: 'error.main', fontSize: 28 }} />}
            color="error"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Movimientos Hoy"
            value={estadisticas?.movimientosHoy || 0}
            icon={<Notifications sx={{ color: 'success.main', fontSize: 28 }} />}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Alertas recientes */}
      {alertas.length > 0 && (
        <Paper sx={{ p: 1.5, mb: 1.5 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            Alertas Recientes
          </Typography>
          {alertas.map((alerta, index) => (
            <Alert
              key={index}
              severity={alerta.nivel === 'error' ? 'error' : 'warning'}
              sx={{ mb: 0.5, py: 0.5, '&:last-child': { mb: 0 } }}
            >
              {alerta.mensaje}
            </Alert>
          ))}
        </Paper>
      )}

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
  );
};

export default Dashboard;
