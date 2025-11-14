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
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  LocalShipping as LocalShippingIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import api from '../services/api';
import NuevoIngresoDialog from '../components/forms/NuevoIngresoDialog';

const Ingresos = () => {
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
  
  // Filtros
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
      console.log('Respuesta de usuarios:', response.data);
      if (response.data.success) {
        const usuariosData = response.data.data || [];
        console.log('Usuarios cargados:', usuariosData);
        setUsuarios(usuariosData);
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
      console.error('Error cargando ingresos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
    setPage(0); // Resetear a la primera página
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
    cargarIngresos(); // Recargar después de crear
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

  if (loading && ingresos.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5} flexWrap="wrap" gap={1}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Ingresos de Medicamentos
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            size="small"
          >
            Imprimir
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={cargarIngresos}
            size="small"
            disabled={loading}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNuevoIngreso}
            size="small"
          >
            Nuevo Ingreso
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filtros */}
      <Card sx={{ mb: 1.5 }} elevation={2}>
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
            Filtros
          </Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={filtros.tipo_ingreso}
                  onChange={(e) => handleFiltroChange('tipo_ingreso', e.target.value)}
                  label="Tipo"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="COMPRA">Compra</MenuItem>
                  <MenuItem value="DEVOLUCION">Devolución</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Proveedor</InputLabel>
                <Select
                  value={filtros.proveedor}
                  onChange={(e) => handleFiltroChange('proveedor', e.target.value)}
                  label="Proveedor"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {proveedores.map((prov) => (
                    <MenuItem key={prov.id_proveedor} value={prov.id_proveedor}>
                      {prov.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Registrado Por</InputLabel>
                <Select
                  value={filtros.usuario}
                  onChange={(e) => handleFiltroChange('usuario', e.target.value)}
                  label="Registrado Por"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {usuarios.map((usr) => (
                    <MenuItem key={usr.id_usuario} value={usr.id_usuario}>
                      {usr.personal?.nombres && usr.personal?.apellidos 
                        ? `${usr.personal.nombres} ${usr.personal.apellidos}` 
                        : usr.nombre_usuario}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="date"
                label="Desde"
                value={filtros.fecha_desde}
                onChange={(e) => handleFiltroChange('fecha_desde', e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="date"
                label="Hasta"
                value={filtros.fecha_hasta}
                onChange={(e) => handleFiltroChange('fecha_hasta', e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={1}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleLimpiarFiltros}
                size="small"
                sx={{ height: '100%' }}
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Proveedor</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Factura</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Registrado Por</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress size={30} />
                    </TableCell>
                  </TableRow>
                ) : ingresos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="textSecondary">
                        No hay ingresos registrados
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  ingresos.map((ingreso) => (
                    <TableRow key={ingreso.id_ingreso}>
                      <TableCell>{ingreso.id_ingreso}</TableCell>
                      <TableCell>
                        <Chip
                          label={ingreso.tipo_ingreso}
                          color={getTipoColor(ingreso.tipo_ingreso)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatearFecha(ingreso.fecha_ingreso)}</TableCell>
                      <TableCell>{ingreso.proveedor?.nombre || 'N/A'}</TableCell>
                      <TableCell>{ingreso.numero_factura || 'N/A'}</TableCell>
                      <TableCell align="right">{formatearMoneda(ingreso.total)}</TableCell>
                      <TableCell>
                        {ingreso.usuario?.personal?.nombres} {ingreso.usuario?.personal?.apellidos}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleVerDetalle(ingreso)}
                          title="Ver detalle"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalRegistros}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </CardContent>
      </Card>

      {/* Dialog para nuevo ingreso */}
      <NuevoIngresoDialog
        open={openDialog}
        onClose={handleCloseDialog}
      />

      {/* Dialog para detalle del ingreso */}
      <Dialog
        open={openDetalleDialog}
        onClose={handleCloseDetalleDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalle del Ingreso #{selectedIngreso?.id_ingreso}
        </DialogTitle>
        <DialogContent>
          {selectedIngreso && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Tipo:
                  </Typography>
                  <Chip
                    label={selectedIngreso.tipo_ingreso}
                    color={getTipoColor(selectedIngreso.tipo_ingreso)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Fecha:
                  </Typography>
                  <Typography>{formatearFecha(selectedIngreso.fecha_ingreso)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Proveedor:
                  </Typography>
                  <Typography>{selectedIngreso.proveedor?.nombre || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Factura:
                  </Typography>
                  <Typography>{selectedIngreso.numero_factura || 'N/A'}</Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Medicamentos
              </Typography>
              <TableContainer component={Paper} variant="outlined">
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
                      <TableRow key={index}>
                        <TableCell>
                          {detalle.insumoPresentacion?.insumo?.nombre}
                        </TableCell>
                        <TableCell>
                          {detalle.insumoPresentacion?.presentacion?.nombre}
                        </TableCell>
                        <TableCell>{detalle.lote}</TableCell>
                        <TableCell>{formatearFecha(detalle.fecha_vencimiento)}</TableCell>
                        <TableCell align="right">{detalle.cantidad}</TableCell>
                        <TableCell align="right">{formatearMoneda(detalle.precio_unitario)}</TableCell>
                        <TableCell align="right">
                          {formatearMoneda(detalle.cantidad * detalle.precio_unitario)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={6} align="right">
                        <strong>TOTAL:</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>{formatearMoneda(selectedIngreso.total)}</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {selectedIngreso.observaciones && (
                <Box mt={2}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Observaciones:
                  </Typography>
                  <Typography>{selectedIngreso.observaciones}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
          >
            Imprimir
          </Button>
          <Button onClick={handleCloseDetalleDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Ingresos;
