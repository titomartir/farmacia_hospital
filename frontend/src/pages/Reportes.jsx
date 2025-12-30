import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Paper, CircularProgress, Alert, FormControl,
  InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, TextField, Tabs, Tab, Chip, Stack, alpha, useTheme,
} from '@mui/material';
import {
  Download as DownloadIcon, Print as PrintIcon, Search as SearchIcon, Assessment as AssessmentIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import KardexDialog from '../components/reportes/KardexDialog';
  // Exportar a Excel - Resumen Total
  const exportarResumenTotalExcel = () => {
    if (!resumenTotal) return;
    const ws = XLSX.utils.json_to_sheet(resumenTotal.medicamentos.map(item => ({
      Medicamento: item.medicamento,
      Presentación: item.presentacion,
      'Req. Unidades': item.req_unidades,
      'Req. Costo': item.req_costo,
      'Receta Unidades': item.receta_unidades,
      'Receta Costo': item.receta_costo,
      'Total Unidades': item.total_unidades,
      'Total Costo': item.total_costo,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ResumenTotal');
    XLSX.writeFile(wb, 'reporte_resumen_total.xlsx');
  };

  // Exportar a PDF - Resumen Total
  const exportarResumenTotalPDF = () => {
    if (!resumenTotal) return;
    const doc = new jsPDF();
    doc.text('Reporte: Resumen Total por Medicamento', 14, 14);
    doc.text(`Período: ${resumenTotal.periodo.fecha_desde} al ${resumenTotal.periodo.fecha_hasta}`, 14, 22);
    doc.autoTable({
      startY: 28,
      head: [[
        'Medicamento', 'Presentación', 'Req. Unidades', 'Req. Costo',
        'Receta Unidades', 'Receta Costo', 'Total Unidades', 'Total Costo'
      ]],
      body: resumenTotal.medicamentos.map(item => ([
        item.medicamento,
        item.presentacion,
        item.req_unidades,
        item.req_costo,
        item.receta_unidades,
        item.receta_costo,
        item.total_unidades,
        item.total_costo
      ])),
    });
    doc.save('reporte_resumen_total.pdf');
  };

  // Exportar a Excel - Resumen por Servicio
  const exportarResumenServicioExcel = () => {
    if (!resumenServicio) return;
    const ws = XLSX.utils.json_to_sheet(resumenServicio.medicamentos.map(item => ({
      Medicamento: item.medicamento,
      Presentación: item.presentacion,
      'Req. Unidades': item.req_unidades,
      'Req. Costo': item.req_costo,
      'Receta Unidades': item.receta_unidades,
      'Receta Costo': item.receta_costo,
      'Total Unidades': item.total_unidades,
      'Total Costo': item.total_costo,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ResumenServicio');
    XLSX.writeFile(wb, 'reporte_resumen_servicio.xlsx');
  };

  // Exportar a PDF - Resumen por Servicio
  const exportarResumenServicioPDF = () => {
    if (!resumenServicio) return;
    const doc = new jsPDF();
    doc.text('Reporte: Resumen por Servicio', 14, 14);
    doc.text(`Servicio: ${resumenServicio.servicio}`, 14, 22);
    doc.text(`Período: ${resumenServicio.periodo.fecha_desde} al ${resumenServicio.periodo.fecha_hasta}`, 14, 30);
    doc.autoTable({
      startY: 36,
      head: [[
        'Medicamento', 'Presentación', 'Req. Unidades', 'Req. Costo',
        'Receta Unidades', 'Receta Costo', 'Total Unidades', 'Total Costo'
      ]],
      body: resumenServicio.medicamentos.map(item => ([
        item.medicamento,
        item.presentacion,
        item.req_unidades,
        item.req_costo,
        item.receta_unidades,
        item.receta_costo,
        item.total_unidades,
        item.total_costo
      ])),
    });
    doc.save('reporte_resumen_servicio.pdf');
  };

  // Exportar a Excel - Consumo por Servicio
  const exportarConsumoServiciosExcel = () => {
    if (!consumoServicios) return;
    const datos = consumoServicios.servicios.map(servicio => ({
      Servicio: servicio.servicio,
      'Req. Unidades': servicio.req_unidades,
      'Req. Costo': servicio.req_costo,
      'Receta Unidades': servicio.receta_unidades,
      'Receta Costo': servicio.receta_costo,
      'Total Unidades': servicio.total_unidades,
      'Total Costo': servicio.total_costo,
    }));
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ConsumoServicios');
    XLSX.writeFile(wb, 'reporte_consumo_servicios.xlsx');
  };

  // Exportar a PDF - Consumo por Servicio
  const exportarConsumoServiciosPDF = () => {
    if (!consumoServicios) return;
    const doc = new jsPDF();
    doc.text('Reporte: Consumo por Servicio', 14, 14);
    doc.text(`Período: ${consumoServicios.periodo.fecha_desde} al ${consumoServicios.periodo.fecha_hasta}`, 14, 22);
    
    const datos = consumoServicios.servicios.map(servicio => [
      servicio.servicio,
      servicio.req_unidades,
      servicio.req_costo,
      servicio.receta_unidades,
      servicio.receta_costo,
      servicio.total_unidades,
      servicio.total_costo
    ]);
    
    doc.autoTable({
      startY: 28,
      head: [[
        'Servicio', 'Req. Unidades', 'Req. Costo',
        'Receta Unidades', 'Receta Costo', 'Total Unidades', 'Total Costo'
      ]],
      body: datos,
    });
    doc.save('reporte_consumo_servicios.pdf');
  };
import api from '../services/api';

const Reportes = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabActual, setTabActual] = useState(0);
  const [fechaDesde, setFechaDesde] = useState(new Date().toISOString().slice(0, 16));
  const [fechaHasta, setFechaHasta] = useState(new Date().toISOString().slice(0, 16));
  const [servicios, setServicios] = useState([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [resumenTotal, setResumenTotal] = useState(null);
  const [resumenServicio, setResumenServicio] = useState(null);
  const [consumoServicios, setConsumoServicios] = useState(null);
  const [kardexDialogOpen, setKardexDialogOpen] = useState(false);

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
              <TextField 
                fullWidth 
                type="datetime-local" 
                label="Desde" 
                value={fechaDesde} 
                onChange={(e) => setFechaDesde(e.target.value)} 
                InputLabelProps={{ shrink: true }} 
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField 
                fullWidth 
                type="datetime-local" 
                label="Hasta" 
                value={fechaHasta} 
                onChange={(e) => setFechaHasta(e.target.value)} 
                InputLabelProps={{ shrink: true }} 
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Tabs value={tabActual} onChange={(e, v) => setTabActual(v)} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Tab label="Resumen Total por Medicamento" />
          <Tab label="Resumen por Servicio" />
          <Tab label="Consumo por Servicio" />
          <Tab label="Kardex de Medicamento" />
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
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportarConsumoServiciosExcel} disabled={!consumoServicios}>Exportar Excel</Button>
              </Stack>

              {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}

              {consumoServicios && !loading && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>Período: {consumoServicios.periodo.fecha_desde} al {consumoServicios.periodo.fecha_hasta}</Typography>
                  
                  <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                          <TableCell sx={{ fontWeight: 600 }}>Servicio</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Req. Unidades</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Req. Costo</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Receta Unidades</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Receta Costo</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Total Unidades</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Total Costo</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {consumoServicios.servicios.map((servicio, idx) => (
                          <TableRow key={idx} hover>
                            <TableCell>{servicio.servicio}</TableCell>
                            <TableCell align="right">{formatearNumero(servicio.req_unidades)}</TableCell>
                            <TableCell align="right">{formatearMoneda(servicio.req_costo)}</TableCell>
                            <TableCell align="right">{formatearNumero(servicio.receta_unidades)}</TableCell>
                            <TableCell align="right">{formatearMoneda(servicio.receta_costo)}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>{formatearNumero(servicio.total_unidades)}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>{formatearMoneda(servicio.total_costo)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}

          {tabActual === 3 && (
            <Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Genera el reporte de Kardex de un medicamento específico con el detalle de entradas, salidas y saldos.
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<DescriptionIcon />} 
                onClick={() => setKardexDialogOpen(true)}
                sx={{ mb: 2 }}
              >
                Generar Kardex
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <KardexDialog 
        open={kardexDialogOpen} 
        onClose={() => setKardexDialogOpen(false)} 
      />
    </Box>
  );
};

export default Reportes;