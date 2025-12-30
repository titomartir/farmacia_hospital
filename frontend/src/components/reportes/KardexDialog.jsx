import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Print as PrintIcon,
  GetApp as DownloadIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import insumoService from '../../services/insumoService';
import kardexService from '../../services/kardexService';

const KardexDialog = ({ open, onClose }) => {
  const [insumos, setInsumos] = useState([]);
  const [insumoSeleccionado, setInsumoSeleccionado] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [kardexData, setKardexData] = useState(null);
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [nivelMinimo, setNivelMinimo] = useState('');
  const [nivelMaximo, setNivelMaximo] = useState('');

  useEffect(() => {
    if (open) {
      cargarInsumos();
      // Establecer fechas por defecto (último mes)
      const hoy = new Date();
      const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      setFechaInicio(primerDiaMes.toISOString().split('T')[0]);
      setFechaFin(hoy.toISOString().split('T')[0]);
    }
  }, [open]);

  const cargarInsumos = async () => {
    try {
      const data = await insumoService.getInsumos({ activo: true });
      const insumosArray = data.data || data;
      setInsumos(Array.isArray(insumosArray) ? insumosArray : []);
    } catch (err) {
      console.error('Error al cargar insumos:', err);
      setError('Error al cargar medicamentos');
    }
  };

  const generarKardex = async () => {
    if (!insumoSeleccionado) {
      setError('Debe seleccionar un medicamento');
      return;
    }
    if (!fechaInicio || !fechaFin) {
      setError('Debe seleccionar el rango de fechas');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('📊 Generando Kardex:', {
        id_insumo: insumoSeleccionado.id_insumo,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      });

      const response = await kardexService.obtenerKardex(
        insumoSeleccionado.id_insumo,
        fechaInicio,
        fechaFin
      );

      console.log('✅ Kardex obtenido:', response);

      if (response.success && response.data) {
        setKardexData(response.data);
      } else {
        setError(response.message || 'Error al generar kardex');
      }
    } catch (err) {
      console.error('❌ Error generando Kardex:', err);
      setError(err.message || 'Error al generar kardex');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarPDF = async () => {
    if (!insumoSeleccionado || !kardexData) {
      alert('Debe generar el kardex primero');
      return;
    }

    try {
      setLoading(true);
      console.log('📄 Generando PDF...');
      await kardexService.generarPDF(
        insumoSeleccionado.id_insumo,
        fechaInicio,
        fechaFin
      );
      console.log('✅ PDF descargado');
    } catch (err) {
      console.error('❌ Error generando PDF:', err);
      setError('Error al generar PDF: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportarExcel = async () => {
    if (!insumoSeleccionado || !kardexData) {
      alert('Debe generar el kardex primero');
      return;
    }

    try {
      setLoading(true);
      console.log('📊 Exportando a Excel...');
      await kardexService.exportarExcel(
        insumoSeleccionado.id_insumo,
        fechaInicio,
        fechaFin
      );
      console.log('✅ Excel descargado');
    } catch (err) {
      console.error('❌ Error exportando Excel:', err);
      setError('Error al exportar Excel: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setKardexData(null);
    setInsumoSeleccionado(null);
    setError('');
    setNumeroTarjeta('');
    setNivelMinimo('');
    setNivelMaximo('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="xl" 
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div">
            📊 Kardex de Medicamento
          </Typography>
          <Button onClick={handleClose} color="inherit">
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <Autocomplete
                options={insumos}
                getOptionLabel={(option) => option.nombre_generico || option.nombre || ''}
                value={insumoSeleccionado}
                onChange={(e, newValue) => setInsumoSeleccionado(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Seleccionar Medicamento"
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={2.5}>
              <TextField
                label="Fecha Inicio"
                type="date"
                fullWidth
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={2.5}>
              <TextField
                label="Fecha Fin"
                type="date"
                fullWidth
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                fullWidth
                onClick={generarKardex}
                disabled={loading}
                sx={{ height: '56px' }}
              >
                {loading ? <CircularProgress size={24} /> : 'Generar'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Encabezado del Kardex */}
        {kardexData && (
          <>
            <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography variant="h6" align="center" sx={{ fontWeight: 'bold' }}>
                    Hospital Regional de El Utcubamba
                  </Typography>
                  <Typography variant="subtitle1" align="center">
                    KARDEX DE MEDICAMENTO
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography 
                    variant="h5" 
                    align="center" 
                    sx={{ 
                      fontWeight: 700, 
                      color: 'primary.main',
                      fontFamily: 'Arial Black, sans-serif',
                      my: 1,
                      textTransform: 'uppercase',
                      letterSpacing: 1
                    }}
                  >
                    {kardexData.medicamento} - {kardexData.presentacion}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2">
                    <strong>Unidad:</strong> {kardexData.unidad}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Número de Tarjeta"
                    size="small"
                    fullWidth
                    value={numeroTarjeta}
                    onChange={(e) => setNumeroTarjeta(e.target.value.replace(/[^0-9]/g, ''))}
                    inputProps={{ 
                      maxLength: 10,
                      style: { textAlign: 'center' }
                    }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    label="Nivel Mínimo"
                    size="small"
                    fullWidth
                    value={nivelMinimo}
                    onChange={(e) => setNivelMinimo(e.target.value.replace(/[^0-9]/g, ''))}
                    inputProps={{ 
                      maxLength: 6,
                      style: { textAlign: 'center' }
                    }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    label="Nivel Máximo"
                    size="small"
                    fullWidth
                    value={nivelMaximo}
                    onChange={(e) => setNivelMaximo(e.target.value.replace(/[^0-9]/g, ''))}
                    inputProps={{ 
                      maxLength: 6,
                      style: { textAlign: 'center' }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Período:</strong> {fechaInicio} al {fechaFin}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Tabla de Kardex */}
            <TableContainer component={Paper} sx={{ maxHeight: 'calc(90vh - 400px)' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" rowSpan={2} sx={{ fontWeight: 'bold', bgcolor: '#e3f2fd', borderRight: '1px solid #ddd' }}>
                      FECHA
                    </TableCell>
                    <TableCell align="center" rowSpan={2} sx={{ fontWeight: 'bold', bgcolor: '#e3f2fd', borderRight: '1px solid #ddd' }}>
                      Nº CORRELA
                    </TableCell>
                    <TableCell align="center" rowSpan={2} sx={{ fontWeight: 'bold', bgcolor: '#e3f2fd', borderRight: '1px solid #ddd', minWidth: 150 }}>
                      DESCRIPCION
                    </TableCell>
                    <TableCell align="center" rowSpan={2} sx={{ fontWeight: 'bold', bgcolor: '#e3f2fd', borderRight: '2px solid #666' }}>
                      UNIDAD MEDIDA
                    </TableCell>
                    <TableCell align="center" colSpan={3} sx={{ fontWeight: 'bold', bgcolor: '#c8e6c9', borderRight: '2px solid #666' }}>
                      ENTRADAS
                    </TableCell>
                    <TableCell align="center" colSpan={3} sx={{ fontWeight: 'bold', bgcolor: '#ffccbc', borderRight: '2px solid #666' }}>
                      SALIDAS
                    </TableCell>
                    <TableCell align="center" colSpan={3} sx={{ fontWeight: 'bold', bgcolor: '#fff9c4' }}>
                      SALDOS
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    {/* ENTRADAS */}
                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#c8e6c9', fontSize: '0.75rem' }}>CANT</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#c8e6c9', fontSize: '0.75rem' }}>C. UNIT</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#c8e6c9', fontSize: '0.75rem', borderRight: '2px solid #666' }}>VALOR</TableCell>
                    {/* SALIDAS */}
                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#ffccbc', fontSize: '0.75rem' }}>CANT</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#ffccbc', fontSize: '0.75rem' }}>C. UNIT</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#ffccbc', fontSize: '0.75rem', borderRight: '2px solid #666' }}>VALOR</TableCell>
                    {/* SALDOS */}
                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#fff9c4', fontSize: '0.75rem' }}>CANT</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#fff9c4', fontSize: '0.75rem' }}>C. UNIT</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#fff9c4', fontSize: '0.75rem' }}>VALOR</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {kardexData.movimientos.map((mov, idx) => (
                    <TableRow 
                      key={idx}
                      sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}
                    >
                      <TableCell align="center" sx={{ fontSize: '0.8rem' }}>{mov.fecha}</TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.8rem' }}>{mov.correlativo}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{mov.descripcion}</TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.8rem', borderRight: '2px solid #666' }}>{mov.unidadMedida}</TableCell>
                      {/* ENTRADAS */}
                      <TableCell align="right" sx={{ fontSize: '0.8rem', bgcolor: mov.entrada_cantidad > 0 ? '#e8f5e9' : 'inherit' }}>
                        {mov.entrada_cantidad > 0 ? mov.entrada_cantidad : ''}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.8rem', bgcolor: mov.entrada_cantidad > 0 ? '#e8f5e9' : 'inherit' }}>
                        {mov.entrada_costo > 0 ? mov.entrada_costo.toFixed(2) : ''}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.8rem', bgcolor: mov.entrada_cantidad > 0 ? '#e8f5e9' : 'inherit', borderRight: '2px solid #666' }}>
                        {mov.entrada_valor > 0 ? mov.entrada_valor.toFixed(2) : ''}
                      </TableCell>
                      {/* SALIDAS */}
                      <TableCell align="right" sx={{ fontSize: '0.8rem', bgcolor: mov.salida_cantidad > 0 ? '#ffebee' : 'inherit' }}>
                        {mov.salida_cantidad > 0 ? mov.salida_cantidad : ''}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.8rem', bgcolor: mov.salida_cantidad > 0 ? '#ffebee' : 'inherit' }}>
                        {mov.salida_costo > 0 ? mov.salida_costo.toFixed(2) : ''}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.8rem', bgcolor: mov.salida_cantidad > 0 ? '#ffebee' : 'inherit', borderRight: '2px solid #666' }}>
                        {mov.salida_valor > 0 ? mov.salida_valor.toFixed(2) : ''}
                      </TableCell>
                      {/* SALDOS */}
                      <TableCell align="right" sx={{ fontSize: '0.8rem', bgcolor: '#fffde7' }}>
                        {mov.saldo_cantidad}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.8rem', bgcolor: '#fffde7' }}>
                        {mov.saldo_costo.toFixed(2)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.8rem', bgcolor: '#fffde7' }}>
                        {mov.saldo_valor.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Fila de totales */}
                  <TableRow sx={{ bgcolor: '#e0e0e0' }}>
                    <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>
                      TOTALES
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#c8e6c9' }}>
                      {kardexData.totales.entrada_cantidad}
                    </TableCell>
                    <TableCell colSpan={1} sx={{ bgcolor: '#c8e6c9' }}></TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#c8e6c9', borderRight: '2px solid #666' }}>
                      {kardexData.totales.entrada_valor.toFixed(2)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#ffccbc' }}>
                      {kardexData.totales.salida_cantidad}
                    </TableCell>
                    <TableCell colSpan={1} sx={{ bgcolor: '#ffccbc' }}></TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#ffccbc', borderRight: '2px solid #666' }}>
                      {kardexData.totales.salida_valor.toFixed(2)}
                    </TableCell>
                    <TableCell colSpan={3}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cerrar
        </Button>
        {kardexData && (
          <>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportarExcel}
              color="success"
            >
              Exportar Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handleGenerarPDF}
              color="primary"
            >
              Generar PDF
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default KardexDialog;
