import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Paper, CircularProgress, Alert, FormControl,
  InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, TextField, Tabs, Tab, Chip, Stack, alpha, useTheme,
} from '@mui/material';
import {
  Download as DownloadIcon, Print as PrintIcon, Search as SearchIcon, Assessment as AssessmentIcon,
} from '@mui/icons-material';
import api from '../services/api';

const Reportes = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabActual, setTabActual] = useState(0);
  const [fechaDesde, setFechaDesde] = useState(new Date().toISOString().split('T')[0]);
  const [fechaHasta, setFechaHasta] = useState(new Date().toISOString().split('T')[0]);
  const [servicios, setServicios] = useState([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
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
        params: { fecha_desde: fechaDesde, fecha_hasta: fechaHasta, id_servicio: servicioSeleccionado }
      });
      if (response.data.success) {
        setResumenServicio(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al generar reporte');
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
    } finally {
      setLoading(false);
    }
  };

  const formatearMoneda = (valor) => `Q ${parseFloat(valor || 0).toFixed(2)}`;
  const formatearNumero = (valor) => parseFloat(valor || 0).toFixed(2);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center' }}>
          <AssessmentIcon sx={{ mr: 1 }} /> Reportes y Estadísticas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Análisis y reportes del sistema
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Card elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>Filtros Globales</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="date" label="Desde" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="date" label="Hasta" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Tabs value={tabActual} onChange={(e, v) => setTabActual(v)} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Tab label="Resumen Total por Medicamento" />
          <Tab label="Resumen por Servicio" />
          <Tab label="Consumo por Servicio" />
        </Tabs>

        <CardContent>
          {tabActual === 0 && (
            <Box>
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Button variant="contained" startIcon={<SearchIcon />} onClick={generarResumenTotal} disabled={loading}>Generar Reporte</Button>
                <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} disabled={!resumenTotal}>Imprimir</Button>
                <Button variant="outlined" startIcon={<DownloadIcon />} disabled={!resumenTotal}>Exportar Excel</Button>
              </Stack>

              {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}

              {resumenTotal && !loading && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>Período: {resumenTotal.periodo.fecha_desde} al {resumenTotal.periodo.fecha_hasta}</Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                          <TableCell sx={{ fontWeight: 600 }}>Medicamento</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Presentación</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Req. Unidades</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Req. Costo</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Receta Unidades</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Receta Costo</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Total Unidades</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Total Costo</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {resumenTotal.medicamentos.map((item, index) => (
                          <TableRow key={index} hover>
                            <TableCell>{item.medicamento}</TableCell>
                            <TableCell>{item.presentacion}</TableCell>
                            <TableCell align="right">{formatearNumero(item.req_unidades)}</TableCell>
                            <TableCell align="right">{formatearMoneda(item.req_costo)}</TableCell>
                            <TableCell align="right">{formatearNumero(item.receta_unidades)}</TableCell>
                            <TableCell align="right">{formatearMoneda(item.receta_costo)}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>{formatearNumero(item.total_unidades)}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>{formatearMoneda(item.total_costo)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{ bgcolor: alpha(theme.palette.success.main, 0.15) }}>
                          <TableCell colSpan={2} sx={{ fontWeight: 700 }}>TOTALES</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{formatearNumero(resumenTotal.totales.req_unidades)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{formatearMoneda(resumenTotal.totales.req_costo)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{formatearNumero(resumenTotal.totales.receta_unidades)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{formatearMoneda(resumenTotal.totales.receta_costo)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{formatearNumero(resumenTotal.totales.total_unidades)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{formatearMoneda(resumenTotal.totales.total_costo)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}

          {tabActual === 1 && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Servicio</InputLabel>
                    <Select value={servicioSeleccionado} onChange={(e) => setServicioSeleccionado(e.target.value)} label="Servicio">
                      <MenuItem value="">Seleccione...</MenuItem>
                      {servicios.map((srv) => (
                        <MenuItem key={srv.id_servicio} value={srv.id_servicio}>{srv.nombre_servicio}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Button variant="contained" startIcon={<SearchIcon />} onClick={generarResumenServicio} disabled={loading}>Generar Reporte</Button>
                <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} disabled={!resumenServicio}>Imprimir</Button>
                <Button variant="outlined" startIcon={<DownloadIcon />} disabled={!resumenServicio}>Exportar Excel</Button>
              </Stack>

              {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}

              {resumenServicio && !loading && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>Servicio: <strong>{resumenServicio.servicio}</strong></Typography>
                  <Typography variant="subtitle2" gutterBottom>Período: {resumenServicio.periodo.fecha_desde} al {resumenServicio.periodo.fecha_hasta}</Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                          <TableCell sx={{ fontWeight: 600 }}>Medicamento</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Presentación</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Req. Unidades</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Req. Costo</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Receta Unidades</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Receta Costo</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Total Unidades</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Total Costo</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {resumenServicio.medicamentos.map((item, index) => (
                          <TableRow key={index} hover>
                            <TableCell>{item.medicamento}</TableCell>
                            <TableCell>{item.presentacion}</TableCell>
                            <TableCell align="right">{formatearNumero(item.req_unidades)}</TableCell>
                            <TableCell align="right">{formatearMoneda(item.req_costo)}</TableCell>
                            <TableCell align="right">{formatearNumero(item.receta_unidades)}</TableCell>
                            <TableCell align="right">{formatearMoneda(item.receta_costo)}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>{formatearNumero(item.total_unidades)}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>{formatearMoneda(item.total_costo)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{ bgcolor: alpha(theme.palette.success.main, 0.15) }}>
                          <TableCell colSpan={2} sx={{ fontWeight: 700 }}>TOTALES</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{formatearNumero(resumenServicio.totales.req_unidades)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{formatearMoneda(resumenServicio.totales.req_costo)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{formatearNumero(resumenServicio.totales.receta_unidades)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{formatearMoneda(resumenServicio.totales.receta_costo)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{formatearNumero(resumenServicio.totales.total_unidades)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{formatearMoneda(resumenServicio.totales.total_costo)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}

          {tabActual === 2 && (
            <Box>
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Button variant="contained" startIcon={<SearchIcon />} onClick={generarConsumoServicios} disabled={loading}>Generar Reporte</Button>
                <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} disabled={!consumoServicios}>Imprimir</Button>
              </Stack>

              {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}

              {consumoServicios && !loading && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>Período: {consumoServicios.periodo.fecha_desde} al {consumoServicios.periodo.fecha_hasta}</Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, borderRadius: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                          <TableCell sx={{ fontWeight: 600 }}>Servicio</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Total Requisiciones</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Total Unidades</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Total Costo</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {consumoServicios.servicios.map((item, index) => (
                          <TableRow key={index} hover>
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