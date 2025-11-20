import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Autocomplete,
  Typography,
  Alert,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import requisicionService from '../../services/requisicionService';
import servicioService from '../../services/servicioService';
import insumoService from '../../services/insumoService';
import authService from '../../services/authService';

const NuevaRequisicionDialog = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    id_servicio: '',
    fecha_solicitud: new Date().toISOString(),
    prioridad: 'normal',
    observaciones: '',
    origen_despacho: 'general',
    numero_cama: '',
    nombre_paciente: '',
    detalles: [],
  });

  const [servicios, setServicios] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usuarioActual, setUsuarioActual] = useState(null);

  // Item actual para agregar
  const [itemActual, setItemActual] = useState({
    insumo: null,
    cantidad_solicitada: '',
    observaciones: '',
  });

  useEffect(() => {
    if (open) {
      cargarCatalogos();
      resetForm();
      // Cargar usuario actual
      const usuario = authService.getCurrentUser();
      setUsuarioActual(usuario);
    }
  }, [open]);

  const cargarCatalogos = async () => {
    try {
      const [servData, insData] = await Promise.all([
        servicioService.listarServicios(),
        insumoService.getInsumosPresentaciones(),
      ]);
      setServicios(servData);
      setInsumos(insData);
    } catch (err) {
      setError('Error al cargar catálogos');
    }
  };

  const resetForm = () => {
    setFormData({
      id_servicio: '',
      fecha_solicitud: new Date().toISOString(),
      prioridad: 'normal',
      observaciones: '',
      origen_despacho: 'general',
      numero_cama: '',
      nombre_paciente: '',
      detalles: [],
    });
    setItemActual({
      insumo: null,
      cantidad_solicitada: '',
      observaciones: '',
    });
    setError('');
  };

  const handleChange = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const handleAgregarItem = () => {
    if (!itemActual.insumo || !itemActual.cantidad_solicitada) {
      setError('Seleccione un medicamento y cantidad');
      return;
    }

    const nuevoDetalle = {
      id_insumo_presentacion: itemActual.insumo.id_insumo_presentacion,
      insumo: itemActual.insumo,
      cantidad_solicitada: parseInt(itemActual.cantidad_solicitada),
      observaciones: itemActual.observaciones,
    };

    setFormData(prev => ({
      ...prev,
      detalles: [...prev.detalles, nuevoDetalle],
    }));

    setItemActual({
      insumo: null,
      cantidad_solicitada: '',
      observaciones: '',
    });
    setError('');
  };

  const handleEliminarItem = (index) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.id_servicio) {
        setError('Seleccione un servicio');
        return;
      }

      if (formData.detalles.length === 0) {
        setError('Agregue al menos un medicamento');
        return;
      }

      setLoading(true);
      setError('');

      const payload = {
        id_servicio: formData.id_servicio,
        fecha_solicitud: formData.fecha_solicitud,
        prioridad: formData.prioridad,
        observaciones: formData.observaciones,
        origen_despacho: formData.origen_despacho,
        numero_cama: formData.numero_cama || null,
        nombre_paciente: formData.nombre_paciente || null,
        detalles: formData.detalles.map(d => ({
          id_insumo_presentacion: d.id_insumo_presentacion,
          cantidad_solicitada: d.cantidad_solicitada,
          observaciones: d.observaciones,
        })),
      };

      await requisicionService.crearRequisicion(payload);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear requisición');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Nueva Requisición</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Servicio"
              value={formData.id_servicio}
              onChange={(e) => handleChange('id_servicio', e.target.value)}
              required
            >
              {servicios.map((serv) => (
                <MenuItem key={serv.id_servicio} value={serv.id_servicio}>
                  {serv.nombre_servicio}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Fecha y Hora de Solicitud"
              value={formData.fecha_solicitud ? formData.fecha_solicitud.slice(0, 16) : ''}
              onChange={(e) => handleChange('fecha_solicitud', new Date(e.target.value).toISOString())}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Prioridad"
              value={formData.prioridad}
              onChange={(e) => handleChange('prioridad', e.target.value)}
            >
              <MenuItem value="urgente">Urgente</MenuItem>
              <MenuItem value="alta">Alta</MenuItem>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="baja">Baja</MenuItem>
            </TextField>
          </Grid>

          {/* Origen de Despacho - Solo visible para turnistas */}
          {usuarioActual?.es_turnista && (
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Origen de Despacho</FormLabel>
                <RadioGroup
                  row
                  value={formData.origen_despacho}
                  onChange={(e) => handleChange('origen_despacho', e.target.value)}
                >
                  <FormControlLabel 
                    value="general" 
                    control={<Radio />} 
                    label="Inventario General" 
                  />
                  <FormControlLabel 
                    value="stock_24h" 
                    control={<Radio />} 
                    label="Stock 24 Horas" 
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
          )}

          {/* Información del Paciente */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Número de Cama"
              value={formData.numero_cama}
              onChange={(e) => handleChange('numero_cama', e.target.value)}
              placeholder="Ej: 101, 205A, UCI-3"
              helperText="Opcional - Número o código de cama del paciente"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nombre del Paciente"
              value={formData.nombre_paciente}
              onChange={(e) => handleChange('nombre_paciente', e.target.value)}
              placeholder="Nombre completo del paciente"
              helperText="Opcional - Nombre del paciente si aplica"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Observaciones"
              value={formData.observaciones}
              onChange={(e) => handleChange('observaciones', e.target.value)}
            />
          </Grid>

          {/* Sección para agregar items */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Medicamentos
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Autocomplete
              options={insumos}
              getOptionLabel={(option) => {
                const nombreInsumo = option.insumo?.nombre || option.insumo?.nombre_generico || 'Sin nombre';
                const presentacion = option.presentacion?.nombre || option.presentacion?.nombre_presentacion || '';
                return `${nombreInsumo}${presentacion ? ' - ' + presentacion : ''}`;
              }}
              value={itemActual.insumo}
              onChange={(_, newValue) =>
                setItemActual(prev => ({ ...prev, insumo: newValue }))
              }
              renderInput={(params) => (
                <TextField {...params} label="Buscar medicamento..." />
              )}
              isOptionEqualToValue={(option, value) => 
                option.id_insumo_presentacion === value?.id_insumo_presentacion
              }
              noOptionsText="No se encontraron medicamentos"
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Cantidad"
              value={itemActual.cantidad_solicitada}
              onChange={(e) =>
                setItemActual(prev => ({
                  ...prev,
                  cantidad_solicitada: e.target.value,
                }))
              }
              inputProps={{ min: 1 }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAgregarItem}
              sx={{ height: '56px' }}
            >
              Agregar
            </Button>
          </Grid>

          {/* Tabla de items agregados */}
          {formData.detalles.length > 0 && (
            <Grid item xs={12}>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Medicamento</TableCell>
                      <TableCell>Presentación</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.detalles.map((detalle, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {detalle.insumo?.insumo?.nombre || detalle.insumo?.insumo?.nombre_generico || '-'}
                        </TableCell>
                        <TableCell>
                          {detalle.insumo?.presentacion?.nombre || detalle.insumo?.presentacion?.nombre_presentacion || '-'}
                        </TableCell>
                        <TableCell align="right">
                          {detalle.cantidad_solicitada}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleEliminarItem(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || formData.detalles.length === 0}
        >
          {loading ? 'Guardando...' : 'Crear Requisición'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NuevaRequisicionDialog;
