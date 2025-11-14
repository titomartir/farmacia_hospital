import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TablePagination,
  TextField,
  MenuItem,
  Stack,
  FormControl,
  InputLabel,
  Select,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import api from '../services/api';
import NuevoIngresoDialog from '../components/forms/NuevoIngresoDialog';

const Ingresos = () => {
  const theme = useTheme();
  const [ingresos, setIngresos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedIngreso, setSelectedIngreso] = useState(null);
  const [openDetalleDialog, setOpenDetalleDialog] = useState(false);
  
  const [filtros, setFiltros] = useState({
    tipo_ingreso: '',
    proveedor: '',
    usuario: '',
    fecha_desde: '',
    fecha_hasta: ''
  });

  useEffect(() => {
    cargarProveedores();
    cargarUsuarios();
  }, []);

  useEffect(() => {
    cargarIngresos();
  }, [page, rowsPerPage, filtros]);

  const cargarProveedores = async () => {
    try {
      const response = await api.get('/catalogos/proveedores');
      if (response.data.success) {
        setProveedores(response.data.data || []);
      }
    } catch (err) {
      console.error('Error cargando proveedores:', err);
    }
  };

  const cargarUsuarios = async () => {
    try {
      const response = await api.get('/auth/usuarios');
      if (response.data.success) {
        setUsuarios(response.data.data || []);
      }
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    }
  };

  const cargarIngresos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('page', page + 1);
      params.append('limit', rowsPerPage);
      
      if (filtros.tipo_ingreso) params.append('tipo_ingreso', filtros.tipo_ingreso);
      if (filtros.proveedor) params.append('id_proveedor', filtros.proveedor);
      if (filtros.usuario) params.append('id_usuario', filtros.usuario);
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      
      const response = await api.get(`/ingresos?${params.toString()}`);
      if (response.data.success) {
        setIngresos(response.data.data);
        setTotalRegistros(response.data.totalRegistros);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar ingresos');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    setPage(0);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      tipo_ingreso: '',
      proveedor: '',
      usuario: '',
      fecha_desde: '',
      fecha_hasta: ''
    });
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleNuevoIngreso = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    cargarIngresos();
  };

  const handleVerDetalle = (ingreso) => {
    setSelectedIngreso(ingreso);
    setOpenDetalleDialog(true);
  };

  const handleCloseDetalleDialog = () => {
    setOpenDetalleDialog(false);
    setSelectedIngreso(null);
  };

  const getTipoColor = (tipo) => {
    return tipo === 'COMPRA' ? 'primary' : 'secondary';
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-GT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(valor);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Ingresos de Medicamentos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Registro de compras y devoluciones
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>
            Imprimir
          </Button>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={cargarIngresos} disabled={loading}>
            Actualizar
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleNuevoIngreso}>
            Nuevo Ingreso
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterListIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Filtros
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select value={filtros.tipo_ingreso} onChange={(e) => handleFiltroChange('tipo_ingreso', e.target.value)} label="Tipo">
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="COMPRA">Compra</MenuItem>
                  <MenuItem value="DEVOLUCION">Devolución</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2.5}>
              <FormControl fullWidth>
                <InputLabel>Proveedor</InputLabel>
                <Select value={filtros.proveedor} onChange={(e) => handleFiltroChange('proveedor', e.target.value)} label="Proveedor">
                  <MenuItem value="">Todos</MenuItem>
                  {proveedores.map((prov) => (
                    <MenuItem key={prov.id_proveedor} value={prov.id_proveedor}>{prov.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2.5}>
              <FormControl fullWidth>
                <InputLabel>Registrado Por</InputLabel>
                <Select value={filtros.usuario} onChange={(e) => handleFiltroChange('usuario', e.target.value)} label="Registrado Por">
                  <MenuItem value="">Todos</MenuItem>
                  {usuarios.map((usr) => (
                    <MenuItem key={usr.id_usuario} value={usr.id_usuario}>
                      {usr.personal?.nombres && usr.personal?.apellidos ? `${usr.personal.nombres} ${usr.personal.apellidos}` : usr.nombre_usuario}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth type="date" label="Desde" value={filtros.fecha_desde} onChange={(e) => handleFiltroChange('fecha_desde', e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth type="date" label="Hasta" value={filtros.fecha_hasta} onChange={(e) => handleFiltroChange('fecha_hasta', e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={1}>
              <Button fullWidth variant="outlined" onClick={handleLimpiarFiltros} sx={{ height: '56px' }}>Limpiar</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Proveedor</TableCell>
                <TableCell>Factura</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Registrado Por</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}><CircularProgress /></TableCell>
                </TableRow>
              ) : ingresos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">No hay ingresos registrados</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                ingresos.map((ingreso) => (
                  <TableRow key={ingreso.id_ingreso} hover>
                    <TableCell><Chip label={`#${ingreso.id_ingreso}`} size="small" variant="outlined" /></TableCell>
                    <TableCell><Chip label={ingreso.tipo_ingreso} color={getTipoColor(ingreso.tipo_ingreso)} size="small" /></TableCell>
                    <TableCell><Typography variant="body2">{formatearFecha(ingreso.fecha_ingreso)}</Typography></TableCell>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 500 }}>{ingreso.proveedor?.nombre || 'N/A'}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{ingreso.numero_factura || 'N/A'}</Typography></TableCell>
                    <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 600 }}>{formatearMoneda(ingreso.total)}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{ingreso.usuario?.personal?.nombres} {ingreso.usuario?.personal?.apellidos}</Typography></TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary" onClick={() => handleVerDetalle(ingreso)}><VisibilityIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={totalRegistros} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} labelRowsPerPage="Filas por página:" labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`} />
      </Card>

      <NuevoIngresoDialog open={openDialog} onClose={handleCloseDialog} />

      <Dialog open={openDetalleDialog} onClose={handleCloseDetalleDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle><Typography variant="h6" sx={{ fontWeight: 600 }}>Detalle del Ingreso #{selectedIngreso?.id_ingreso}</Typography></DialogTitle>
        <DialogContent>
          {selectedIngreso && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3, mt: 0.5 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Tipo:</Typography>
                  <Box mt={0.5}><Chip label={selectedIngreso.tipo_ingreso} color={getTipoColor(selectedIngreso.tipo_ingreso)} size="small" /></Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Fecha:</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{formatearFecha(selectedIngreso.fecha_ingreso)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Proveedor:</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>{selectedIngreso.proveedor?.nombre || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Factura:</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{selectedIngreso.numero_factura || 'N/A'}</Typography>
                </Grid>
              </Grid>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>Medicamentos</Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Medicamento</TableCell>
                      <TableCell>Presentación</TableCell>
                      <TableCell>Lote</TableCell>
                      <TableCell>Vencimiento</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Precio Unit.</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedIngreso.detalles?.map((detalle, index) => (
                      <TableRow key={index} hover>
                        <TableCell><Typography variant="body2" sx={{ fontWeight: 500 }}>{detalle.insumoPresentacion?.insumo?.nombre}</Typography></TableCell>
                        <TableCell>{detalle.insumoPresentacion?.presentacion?.nombre}</TableCell>
                        <TableCell>{detalle.lote}</TableCell>
                        <TableCell>{formatearFecha(detalle.fecha_vencimiento)}</TableCell>
                        <TableCell align="right">{detalle.cantidad}</TableCell>
                        <TableCell align="right">{formatearMoneda(detalle.precio_unitario)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{formatearMoneda(detalle.cantidad * detalle.precio_unitario)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: alpha(theme.palette.success.main, 0.08) }}>
                      <TableCell colSpan={6} align="right"><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>TOTAL:</Typography></TableCell>
                      <TableCell align="right"><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{formatearMoneda(selectedIngreso.total)}</Typography></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              {selectedIngreso.observaciones && (
                <Box mt={3} p={2} sx={{ bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Observaciones:</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{selectedIngreso.observaciones}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>Imprimir</Button>
          <Button onClick={handleCloseDetalleDialog} variant="contained">Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Ingresos;