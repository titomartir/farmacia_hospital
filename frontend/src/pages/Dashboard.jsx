import { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Alert,
  alpha,
  useTheme,
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
  const theme = useTheme();
  const [estadisticas, setEstadisticas] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [consumoServicio, setConsumoServicio] = useState([]);
  const [stockEstado, setStockEstado] = useState([]);
  const [tendenciaRequisiciones, setTendenciaRequisiciones] = useState([]);
  const [proximosVencer, setProximosVencer] = useState([]);
  const [costosServicio, setCostosServicio] = useState([]);

  useEffect(() => {
    cargarDatos();
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

      if (statsRes.data.success) setEstadisticas(statsRes.data.data);
      if (alertasRes.data.success) setAlertas(alertasRes.data.data);
      if (consumoRes.data.success) setConsumoServicio(consumoRes.data.data);
      if (stockRes.data.success) setStockEstado(stockRes.data.data);
      if (tendenciaRes.data.success) setTendenciaRequisiciones(tendenciaRes.data.data);
      if (vencerRes.data.success) setProximosVencer(vencerRes.data.data);
      if (costosRes.data.success) setCostosServicio(costosRes.data.data);
    } catch (err) {
      setError('Error al cargar los datos del dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, gradient }) => (
    <Card 
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
        color: 'white',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
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
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 3,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ fontSize: 32 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Cargando...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Resumen general del sistema de farmacia
        </Typography>
      </Box>

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Insumos"
            value={estadisticas?.totalInsumos || 0}
            icon={Inventory}
            gradient={['#667eea', '#764ba2']}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Alertas Activas"
            value={estadisticas?.alertasActivas || 0}
            icon={Warning}
            gradient={['#f093fb', '#f5576c']}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Próximos a Vencer"
            value={estadisticas?.lotesProximosVencer || 0}
            icon={TrendingUp}
            gradient={['#fa709a', '#fee140']}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Movimientos Hoy"
            value={estadisticas?.movimientosHoy || 0}
            icon={Notifications}
            gradient={['#30cfd0', '#330867']}
          />
        </Grid>
      </Grid>

      {/* Alertas recientes */}
      {alertas.length > 0 && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Alertas Recientes
          </Typography>
          {alertas.map((alerta, index) => (
            <Alert
              key={index}
              severity={alerta.nivel === 'error' ? 'error' : 'warning'}
              sx={{ 
                mb: 1, 
                '&:last-child': { mb: 0 },
                borderRadius: 2,
              }}
            >
              {alerta.mensaje}
            </Alert>
          ))}
        </Paper>
      )}

      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Consumo por Servicio */}
        <Grid item xs={12} lg={6}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                📊 Consumo por Servicio (30 días)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={consumoServicio}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                  <XAxis 
                    dataKey="servicio" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100} 
                    fontSize={11}
                  />
                  <YAxis fontSize={11} />
                  <Tooltip 
                    formatter={(value) => `$${parseFloat(value).toFixed(2)}`}
                    contentStyle={{ borderRadius: 8 }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="total_costo" fill="#667eea" name="Costo Total" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Stock por Estado */}
        <Grid item xs={12} lg={6}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                ⚠️ Estado de Stock
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stockEstado}
                    dataKey="cantidad"
                    nameKey="estado"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
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
                  <Tooltip contentStyle={{ borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Tendencia de Requisiciones */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                📈 Tendencia de Requisiciones (30 días)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={tendenciaRequisiciones}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                  <XAxis dataKey="fecha" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="entregadas" 
                    stroke="#4caf50" 
                    name="Entregadas" 
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="aprobadas" 
                    stroke="#2196f3" 
                    name="Aprobadas" 
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pendientes" 
                    stroke="#ff9800" 
                    name="Pendientes" 
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Próximos a Vencer */}
        <Grid item xs={12} lg={6}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                📅 Próximos a Vencer (60 días)
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {proximosVencer.length > 0 ? (
                  proximosVencer.map((item, index) => (
                    <Alert 
                      key={index} 
                      severity={item.dias_restantes < 30 ? 'error' : 'warning'}
                      sx={{ 
                        mb: 1.5, 
                        '&:last-child': { mb: 0 },
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.medicamento} - {item.presentacion}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Lote: {item.numero_lote} | Vence: {new Date(item.fecha_vencimiento).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Stock: {item.cantidad_actual} | Días restantes: {item.dias_restantes}
                      </Typography>
                    </Alert>
                  ))
                ) : (
                  <Typography color="text.secondary" variant="body2">
                    No hay medicamentos próximos a vencer
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Costos por Servicio */}
        <Grid item xs={12} lg={6}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                💰 Costos por Servicio (30 días)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={costosServicio} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                  <XAxis type="number" fontSize={11} />
                  <YAxis dataKey="servicio" type="category" width={150} fontSize={11} />
                  <Tooltip 
                    formatter={(value) => `$${parseFloat(value).toFixed(2)}`}
                    contentStyle={{ borderRadius: 8 }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar 
                    dataKey="costo_total" 
                    fill="#82ca9d" 
                    name="Costo Total"
                    radius={[0, 8, 8, 0]}
                  />
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