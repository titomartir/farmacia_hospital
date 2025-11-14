import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Tabs,
  Tab,
  Chip,
  Stack
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  LocalShipping as LocalShippingIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import api from '../services/api';

const StatCard = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography color="textSecondary" variant="body2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4">
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}.main`,
            color: 'white',
            borderRadius: '50%',
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Reportes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabActual, setTabActual] = useState(0);
  
  // Filtros
  const [fechaDesde, setFechaDesde] = useState(new Date().toISOString().split('T')[0]);
  const [fechaHasta, setFechaHasta] = useState(new Date().toISOString().split('T')[0]);
  const [servicios, setServicios] = useState([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  
  // Datos de reportes
  const [resumenTotal, setResumenTotal] = useState(null);
  const [resumenServicio, setResumenServicio] = useState(null);
  const [consumoServicios, setConsumoServicios] = useState(null);

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      const response = await api.get('/catalogos/servicios');
      if (response.data.success) {
        setServicios(response.data.data || []);
      }
    } catch (err) {
      console.error('Error cargando servicios:', err);
    }
  };

  const generarResumenTotal = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/reportes/resumen-total', {
        params: { fecha_desde: fechaDesde, fecha_hasta: fechaHasta }
      });
      
      if (response.data.success) {
        setResumenTotal(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al generar reporte');
      console.error('Error generando reporte:', err);
    } finally {
      setLoading(false);
    }
  };

  const generarResumenServicio = async () => {
    try {
      if (!servicioSeleccionado) {
        setError('Debe seleccionar un servicio');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      const response = await api.get('/reportes/resumen-servicio', {
        params: { 
          fecha_desde: fechaDesde, 
          fecha_hasta: fechaHasta,
          id_servicio: servicioSeleccionado
        }
      });
      
      if (response.data.success) {
        setResumenServicio(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al generar reporte');
      console.error('Error generando reporte:', err);
    } finally {
      setLoading(false);
    }
  };

  const generarConsumoServicios = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/reportes/consumo-servicio', {
        params: { fecha_desde: fechaDesde, fecha_hasta: fechaHasta }
      });
      
      if (response.data.success) {
        setConsumoServicios(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al generar reporte');
      console.error('Error generando reporte:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatearMoneda = (valor) => {
    return `Q ${parseFloat(valor || 0).toFixed(2)}`;
  };

  const formatearNumero = (valor) => {
    return parseFloat(valor || 0).toFixed(2);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        📊 Reportes y Estadísticas
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filtros Globales */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Filtros</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Desde"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Hasta"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs de Reportes */}
      <Card>
        <Tabs value={tabActual} onChange={(e, newValue) => setTabActual(newValue)}>
          <Tab label="Resumen Total por Medicamento" />
          <Tab label="Resumen por Servicio" />
          <Tab label="Consumo por Servicio" />
        </Tabs>

        <CardContent>
          {/* TAB 1: Resumen Total */}
          {tabActual === 0 && (
            <Box>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={generarResumenTotal}
                  disabled={loading}
                >
                  Generar Reporte
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={() => window.print()}
                  disabled={!resumenTotal}
                >
                  Imprimir
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  disabled={!resumenTotal}
                >
                  Exportar Excel
                </Button>
              </Stack>

              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              )}

              {resumenTotal && !loading && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Período: {resumenTotal.periodo.fecha_desde} al {resumenTotal.periodo.fecha_hasta}
                  </Typography>

                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.light' }}>
                          <TableCell><strong>Medicamento</strong></TableCell>
                          <TableCell><strong>Presentación</strong></TableCell>
                          <TableCell align="right"><strong>Req. Unidades</strong></TableCell>
                          <TableCell align="right"><strong>Req. Costo</strong></TableCell>
                          <TableCell align="right"><strong>Receta Unidades</strong></TableCell>
                          <TableCell align="right"><strong>Receta Costo</strong></TableCell>
                          <TableCell align="right"><strong>Total Unidades</strong></TableCell>
                          <TableCell align="right"><strong>Total Costo</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {resumenTotal.medicamentos.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.medicamento}</TableCell>
                            <TableCell>{item.presentacion}</TableCell>
                            <TableCell align="right">{formatearNumero(item.req_unidades)}</TableCell>
                            <TableCell align="right">{formatearMoneda(item.req_costo)}</TableCell>
                            <TableCell align="right">{formatearNumero(item.receta_unidades)}</TableCell>
                            <TableCell align="right">{formatearMoneda(item.receta_costo)}</TableCell>
                            <TableCell align="right"><strong>{formatearNumero(item.total_unidades)}</strong></TableCell>
                            <TableCell align="right"><strong>{formatearMoneda(item.total_costo)}</strong></TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{ backgroundColor: 'success.light' }}>
                          <TableCell colSpan={2}><strong>TOTALES</strong></TableCell>
                          <TableCell align="right"><strong>{formatearNumero(resumenTotal.totales.req_unidades)}</strong></TableCell>
                          <TableCell align="right"><strong>{formatearMoneda(resumenTotal.totales.req_costo)}</strong></TableCell>
                          <TableCell align="right"><strong>{formatearNumero(resumenTotal.totales.receta_unidades)}</strong></TableCell>
                          <TableCell align="right"><strong>{formatearMoneda(resumenTotal.totales.receta_costo)}</strong></TableCell>
                          <TableCell align="right"><strong>{formatearNumero(resumenTotal.totales.total_unidades)}</strong></TableCell>
                          <TableCell align="right"><strong>{formatearMoneda(resumenTotal.totales.total_costo)}</strong></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}

          {/* TAB 2: Resumen por Servicio */}
          {tabActual === 1 && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Servicio</InputLabel>
                    <Select
                      value={servicioSeleccionado}
                      onChange={(e) => setServicioSeleccionado(e.target.value)}
                      label="Servicio"
                    >
                      <MenuItem value="">Seleccione...</MenuItem>
                      {servicios.map((srv) => (
                        <MenuItem key={srv.id_servicio} value={srv.id_servicio}>
                          {srv.nombre_servicio}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={generarResumenServicio}
                  disabled={loading}
                >
                  Generar Reporte
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={() => window.print()}
                  disabled={!resumenServicio}
                >
                  Imprimir
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  disabled={!resumenServicio}
                >
                  Exportar Excel
                </Button>
              </Stack>

              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              )}

              {resumenServicio && !loading && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Servicio: <strong>{resumenServicio.servicio}</strong>
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Período: {resumenServicio.periodo.fecha_desde} al {resumenServicio.periodo.fecha_hasta}
                  </Typography>

                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.light' }}>
                          <TableCell><strong>Medicamento</strong></TableCell>
                          <TableCell><strong>Presentación</strong></TableCell>
                          <TableCell align="right"><strong>Req. Unidades</strong></TableCell>
                          <TableCell align="right"><strong>Req. Costo</strong></TableCell>
                          <TableCell align="right"><strong>Receta Unidades</strong></TableCell>
                          <TableCell align="right"><strong>Receta Costo</strong></TableCell>
                          <TableCell align="right"><strong>Total Unidades</strong></TableCell>
                          <TableCell align="right"><strong>Total Costo</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {resumenServicio.medicamentos.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.medicamento}</TableCell>
                            <TableCell>{item.presentacion}</TableCell>
                            <TableCell align="right">{formatearNumero(item.req_unidades)}</TableCell>
                            <TableCell align="right">{formatearMoneda(item.req_costo)}</TableCell>
                            <TableCell align="right">{formatearNumero(item.receta_unidades)}</TableCell>
                            <TableCell align="right">{formatearMoneda(item.receta_costo)}</TableCell>
                            <TableCell align="right"><strong>{formatearNumero(item.total_unidades)}</strong></TableCell>
                            <TableCell align="right"><strong>{formatearMoneda(item.total_costo)}</strong></TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{ backgroundColor: 'success.light' }}>
                          <TableCell colSpan={2}><strong>TOTALES</strong></TableCell>
                          <TableCell align="right"><strong>{formatearNumero(resumenServicio.totales.req_unidades)}</strong></TableCell>
                          <TableCell align="right"><strong>{formatearMoneda(resumenServicio.totales.req_costo)}</strong></TableCell>
                          <TableCell align="right"><strong>{formatearNumero(resumenServicio.totales.receta_unidades)}</strong></TableCell>
                          <TableCell align="right"><strong>{formatearMoneda(resumenServicio.totales.receta_costo)}</strong></TableCell>
                          <TableCell align="right"><strong>{formatearNumero(resumenServicio.totales.total_unidades)}</strong></TableCell>
                          <TableCell align="right"><strong>{formatearMoneda(resumenServicio.totales.total_costo)}</strong></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}

          {/* TAB 3: Consumo por Servicio */}
          {tabActual === 2 && (
            <Box>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={generarConsumoServicios}
                  disabled={loading}
                >
                  Generar Reporte
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={() => window.print()}
                  disabled={!consumoServicios}
                >
                  Imprimir
                </Button>
              </Stack>

              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              )}

              {consumoServicios && !loading && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Período: {consumoServicios.periodo.fecha_desde} al {consumoServicios.periodo.fecha_hasta}
                  </Typography>

                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.light' }}>
                          <TableCell><strong>Servicio</strong></TableCell>
                          <TableCell align="right"><strong>Total Requisiciones</strong></TableCell>
                          <TableCell align="right"><strong>Total Unidades</strong></TableCell>
                          <TableCell align="right"><strong>Total Costo</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {consumoServicios.servicios.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.servicio}</TableCell>
                            <TableCell align="right">{item.total_requisiciones}</TableCell>
                            <TableCell align="right">{formatearNumero(item.total_unidades)}</TableCell>
                            <TableCell align="right">{formatearMoneda(item.total_costo)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reportes;
