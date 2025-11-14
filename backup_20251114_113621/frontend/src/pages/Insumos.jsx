import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import api from '../services/api';

const Insumos = () => {
  const [insumos, setInsumos] = useState([]);
  const [presentaciones, setPresentaciones] = useState([]);
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState(null);
  const [filtros, setFiltros] = useState({
    clasificacion: '',
    subclasificacion: '',
    estado: ''
  });
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    clasificacion: 'listado_basico',
    subclasificacion: '',
    estado: true,
    // Nuevos campos para la presentación
    id_presentacion: '',
    id_unidad_medida: '',
    cantidad_presentacion: '',
    stock_minimo: ''
  });

  useEffect(() => {
    cargarInsumos();
    cargarPresentaciones();
    cargarUnidadesMedida();
  }, []);

  const cargarPresentaciones = async () => {
    try {
      const response = await api.get('/catalogos/presentaciones');
      if (response.data.success) {
        setPresentaciones(response.data.data);
      }
    } catch (err) {
      console.error('Error cargando presentaciones:', err);
    }
  };

  const cargarUnidadesMedida = async () => {
    try {
      const response = await api.get('/catalogos/unidades-medida');
      if (response.data.success) {
        setUnidadesMedida(response.data.data);
      }
    } catch (err) {
      console.error('Error cargando unidades de medida:', err);
    }
  };

  const cargarInsumos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/insumos');
      if (response.data.success) {
        setInsumos(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar insumos');
      console.error('Error cargando insumos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (insumo = null) => {
    if (insumo) {
      setEditingInsumo(insumo);
      setFormData({
        nombre: insumo.nombre || '',
        descripcion: insumo.descripcion || '',
        clasificacion: insumo.clasificacion || 'listado_basico',
        subclasificacion: insumo.subclasificacion || '',
        estado: insumo.estado !== undefined ? insumo.estado : true,
        id_presentacion: '',
        id_unidad_medida: '',
        cantidad_presentacion: '',
        stock_minimo: insumo.stock_minimo || ''
      });
    } else {
      setEditingInsumo(null);
      setFormData({
        nombre: '',
        descripcion: '',
        clasificacion: 'listado_basico',
        subclasificacion: '',
        estado: true,
        id_presentacion: '',
        id_unidad_medida: '',
        cantidad_presentacion: '',
        stock_minimo: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingInsumo(null);
    setFormData({
      nombre: '',
      descripcion: '',
      clasificacion: 'listado_basico',
      subclasificacion: '',
      estado: true,
      id_presentacion: '',
      id_unidad_medida: '',
      cantidad_presentacion: '',
      stock_minimo: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingInsumo) {
        await api.put(`/insumos/${editingInsumo.id_insumo}`, formData);
      } else {
        await api.post('/insumos', formData);
      }
      handleCloseDialog();
      cargarInsumos();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar insumo');
      console.error('Error guardando insumo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este insumo?')) return;
    
    try {
      setLoading(true);
      await api.delete(`/insumos/${id}`);
      cargarInsumos();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar insumo');
      console.error('Error eliminando insumo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      clasificacion: '',
      subclasificacion: '',
      estado: ''
    });
    setSearchTerm('');
  };

  const filteredInsumos = insumos.filter(insumo => {
    const matchSearch = insumo.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       insumo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClasificacion = !filtros.clasificacion || insumo.clasificacion === filtros.clasificacion;
    const matchSubclasificacion = !filtros.subclasificacion || insumo.subclasificacion === filtros.subclasificacion;
    const matchEstado = filtros.estado === '' || insumo.estado === (filtros.estado === 'true');
    
    return matchSearch && matchClasificacion && matchSubclasificacion && matchEstado;
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Gestión de Insumos
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handleImprimir}
            size="small"
          >
            Imprimir
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            size="small"
          >
            Nuevo Insumo
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filtros */}
      <Card sx={{ mb: 1.5 }} elevation={2}>
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Grid container spacing={1.5}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar insumo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Clasificación</InputLabel>
                <Select
                  value={filtros.clasificacion}
                  onChange={(e) => setFiltros({ ...filtros, clasificacion: e.target.value })}
                  label="Clasificación"
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="listado_basico">Listado Básico</MenuItem>
                  <MenuItem value="vih">VIH</MenuItem>
                  <MenuItem value="metodo_anticonceptivo">Método Anticonceptivo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Subclasificación</InputLabel>
                <Select
                  value={filtros.subclasificacion}
                  onChange={(e) => setFiltros({ ...filtros, subclasificacion: e.target.value })}
                  label="Subclasificación"
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="requisicion">Requisición</MenuItem>
                  <MenuItem value="receta">Receta</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filtros.estado}
                  onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="true">Activos</MenuItem>
                  <MenuItem value="false">Inactivos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleLimpiarFiltros}
                size="small"
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabla */}
      <TableContainer component={Paper} elevation={2}>
        <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.75 } }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Descripción</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Clasificación</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Subclasificación</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Estado</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredInsumos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No se encontraron insumos
                </TableCell>
              </TableRow>
            ) : (
              filteredInsumos.map((insumo) => (
                <TableRow key={insumo.id_insumo}>
                  <TableCell>{insumo.id_insumo}</TableCell>
                  <TableCell>{insumo.nombre}</TableCell>
                  <TableCell>{insumo.descripcion || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        insumo.clasificacion === 'vih' ? 'VIH' :
                        insumo.clasificacion === 'metodo_anticonceptivo' ? 'Método Anticonceptivo' :
                        'Listado Básico'
                      }
                      color={
                        insumo.clasificacion === 'vih' ? 'error' :
                        insumo.clasificacion === 'metodo_anticonceptivo' ? 'secondary' :
                        'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {insumo.subclasificacion ? (
                      <Chip
                        label={insumo.subclasificacion === 'requisicion' ? 'Requisición' : 'Receta'}
                        variant="outlined"
                        size="small"
                      />
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={insumo.estado ? 'Activo' : 'Inactivo'}
                      color={insumo.estado ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(insumo)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(insumo.id_insumo)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ pb: 1 }}>
            {editingInsumo ? 'Editar Insumo' : 'Nuevo Insumo'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                  Información General
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nombre del Medicamento"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  placeholder="Ej: Acetaminofén"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Descripción"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  multiline
                  rows={2}
                  placeholder="Descripción del medicamento"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required size="small">
                  <InputLabel>Clasificación</InputLabel>
                  <Select
                    value={formData.clasificacion}
                    onChange={(e) => setFormData({ ...formData, clasificacion: e.target.value })}
                    label="Clasificación"
                  >
                    <MenuItem value="listado_basico">Listado Básico</MenuItem>
                    <MenuItem value="vih">VIH</MenuItem>
                    <MenuItem value="metodo_anticonceptivo">Método Anticonceptivo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Subclasificación</InputLabel>
                  <Select
                    value={formData.subclasificacion}
                    onChange={(e) => setFormData({ ...formData, subclasificacion: e.target.value })}
                    label="Subclasificación"
                  >
                    <MenuItem value="">Ninguna</MenuItem>
                    <MenuItem value="requisicion">Requisición</MenuItem>
                    <MenuItem value="receta">Receta</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {!editingInsumo && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary" sx={{ mt: 1, fontWeight: 600 }}>
                      Presentación y Medida
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required size="small">
                      <InputLabel>Presentación</InputLabel>
                      <Select
                        value={formData.id_presentacion}
                        onChange={(e) => setFormData({ ...formData, id_presentacion: e.target.value })}
                        label="Presentación"
                      >
                        <MenuItem value="">Seleccione...</MenuItem>
                        {presentaciones.map((pres) => (
                          <MenuItem key={pres.id_presentacion} value={pres.id_presentacion}>
                            {pres.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required size="small">
                      <InputLabel>Unidad de Medida</InputLabel>
                      <Select
                        value={formData.id_unidad_medida}
                        onChange={(e) => setFormData({ ...formData, id_unidad_medida: e.target.value })}
                        label="Unidad de Medida"
                      >
                        <MenuItem value="">Seleccione...</MenuItem>
                        {unidadesMedida.map((unidad) => (
                          <MenuItem key={unidad.id_unidad_medida} value={unidad.id_unidad_medida}>
                            {unidad.nombre} ({unidad.abreviatura})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Cantidad por Presentación"
                      type="number"
                      value={formData.cantidad_presentacion}
                      onChange={(e) => setFormData({ ...formData, cantidad_presentacion: e.target.value })}
                      required
                      inputProps={{ min: 0.01, step: 0.01 }}
                      placeholder="Ej: 500 (mg)"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Stock Mínimo"
                      type="number"
                      value={formData.stock_minimo}
                      onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                      required
                      inputProps={{ min: 0, step: 1 }}
                      placeholder="Cantidad mínima"
                    />
                  </Grid>
                </>
              )}

              {editingInsumo && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Stock Mínimo"
                    type="number"
                    value={formData.stock_minimo}
                    onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                    inputProps={{ min: 0, step: 1 }}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.checked })}
                      color="primary"
                    />
                  }
                  label={formData.estado ? 'Activo' : 'Inactivo'}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseDialog} size="small">Cancelar</Button>
            <Button type="submit" variant="contained" disabled={loading} size="small">
              {loading ? <CircularProgress size={20} /> : 'Guardar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Insumos;
