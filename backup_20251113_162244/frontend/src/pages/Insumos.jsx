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
    estado: true
  });

  useEffect(() => {
    cargarInsumos();
  }, []);

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
        estado: insumo.estado !== undefined ? insumo.estado : true
      });
    } else {
      setEditingInsumo(null);
      setFormData({
        nombre: '',
        descripcion: '',
        clasificacion: 'listado_basico',
        subclasificacion: '',
        estado: true
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
      estado: true
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
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Gestión de Insumos
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handleImprimir}
          >
            Imprimir
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Nuevo Insumo
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Buscar insumo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
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
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
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
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
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
            <Grid item xs={12} md={2}>
              <Box sx={{ display: 'flex', gap: 1, height: '100%' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleLimpiarFiltros}
                >
                  Limpiar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Clasificación</TableCell>
              <TableCell>Subclasificación</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingInsumo ? 'Editar Insumo' : 'Nuevo Insumo'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Descripción"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              multiline
              rows={3}
              margin="normal"
            />
            <FormControl fullWidth margin="normal" required>
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
            <FormControl fullWidth margin="normal">
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
            <FormControlLabel
              control={
                <Switch
                  checked={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.checked })}
                  color="primary"
                />
              }
              label={formData.estado ? 'Activo' : 'Inactivo'}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Guardar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Insumos;
