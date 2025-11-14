import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, DateTimePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import api from '../../services/api';

const NuevoIngresoDialog = ({ open, onClose }) => {
  // Estados principales
  const [formData, setFormData] = useState({
    id_proveedor: '',
    tipo_ingreso: 'COMPRA',
    fecha_ingreso: new Date(),
    numero_factura: '',
    observaciones: ''
  });

  // Estados para catálogos
  const [proveedores, setProveedores] = useState([]);
  const [insumosPresentaciones, setInsumosPresentaciones] = useState([]);
  
  // Estados para la tabla de detalles
  const [detalles, setDetalles] = useState([]);
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Cargar catálogos al abrir
  useEffect(() => {
    if (open) {
      cargarCatalogos();
    }
  }, [open]);

  const cargarCatalogos = async () => {
    try {
      setLoading(true);
      const [provRes, insRes] = await Promise.all([
        api.get('/catalogos/proveedores'),
        api.get('/insumos/presentaciones/lista')
      ]);
      
      if (provRes.data.success) {
        setProveedores(provRes.data.data);
      }
      if (insRes.data.success) {
        setInsumosPresentaciones(insRes.data.data);
      }
    } catch (err) {
      console.error('Error cargando catálogos:', err);
      setError('Error al cargar los catálogos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAgregarDetalle = () => {
    setDetalles(prev => [...prev, {
      id_temporal: Date.now(),
      id_insumo_presentacion: '',
      lote: '',
      fecha_vencimiento: new Date(),
      cantidad: '',
      precio_unitario: ''
    }]);
  };

  const handleEliminarDetalle = (idTemporal) => {
    setDetalles(prev => prev.filter(d => d.id_temporal !== idTemporal));
  };

  const handleChangeDetalle = (idTemporal, field, value) => {
    setDetalles(prev => prev.map(d => 
      d.id_temporal === idTemporal ? { ...d, [field]: value } : d
    ));
  };

  const calcularSubtotal = (detalle) => {
    const cantidad = parseFloat(detalle.cantidad) || 0;
    const precio = parseFloat(detalle.precio_unitario) || 0;
    return cantidad * precio;
  };

  const calcularTotal = () => {
    return detalles.reduce((sum, d) => sum + calcularSubtotal(d), 0);
  };

  const validarFormulario = () => {
    if (!formData.id_proveedor) {
      setError('Debe seleccionar un proveedor');
      return false;
    }
    if (detalles.length === 0) {
      setError('Debe agregar al menos un medicamento');
      return false;
    }
    for (const detalle of detalles) {
      if (!detalle.id_insumo_presentacion || !detalle.lote || !detalle.cantidad || !detalle.precio_unitario) {
        setError('Todos los campos de los medicamentos son obligatorios');
        return false;
      }
      if (parseFloat(detalle.cantidad) <= 0 || parseFloat(detalle.precio_unitario) <= 0) {
        setError('Cantidad y precio deben ser mayores a cero');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) return;

    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...formData,
        fecha_ingreso: formData.fecha_ingreso.toISOString(),
        detalles: detalles.map(d => ({
          id_insumo_presentacion: d.id_insumo_presentacion,
          lote: d.lote,
          fecha_vencimiento: d.fecha_vencimiento.toISOString().split('T')[0], // Vencimiento solo fecha
          cantidad: parseFloat(d.cantidad),
          precio_unitario: parseFloat(d.precio_unitario)
        }))
      };

      const response = await api.post('/ingresos', payload);
      
      if (response.data.success) {
        handleCerrar();
        window.alert('Ingreso registrado exitosamente');
      }
    } catch (err) {
      console.error('Error al crear ingreso:', err);
      setError(err.response?.data?.message || 'Error al registrar el ingreso');
    } finally {
      setLoading(false);
    }
  };

  const handleCerrar = () => {
    setFormData({
      id_proveedor: '',
      tipo_ingreso: 'COMPRA',
      fecha_ingreso: new Date(),
      numero_factura: '',
      observaciones: ''
    });
    setDetalles([]);
    setError(null);
    onClose();
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(valor);
  };

  return (
    <>
      <Dialog open={open} onClose={handleCerrar} maxWidth="lg" fullWidth>
        <DialogTitle>Nuevo Ingreso de Medicamentos</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} />}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Campos del encabezado */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Proveedor</InputLabel>
                <Select
                  value={formData.id_proveedor}
                  onChange={(e) => handleChange('id_proveedor', e.target.value)}
                  label="Proveedor"
                >
                  {proveedores.map(p => (
                    <MenuItem key={p.id_proveedor} value={p.id_proveedor}>
                      {p.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Tipo de Ingreso</InputLabel>
                <Select
                  value={formData.tipo_ingreso}
                  onChange={(e) => handleChange('tipo_ingreso', e.target.value)}
                  label="Tipo de Ingreso"
                >
                  <MenuItem value="COMPRA">Compra</MenuItem>
                  <MenuItem value="DEVOLUCION">Devolución</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DateTimePicker
                  label="Fecha y Hora de Ingreso"
                  value={formData.fecha_ingreso}
                  onChange={(newValue) => handleChange('fecha_ingreso', newValue)}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                  ampm={false}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Número de Factura"
                value={formData.numero_factura}
                onChange={(e) => handleChange('numero_factura', e.target.value)}
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

            {/* Sección de medicamentos */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} mb={1}>
                <Typography variant="h6">Medicamentos</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAgregarDetalle}
                >
                  Agregar Ítem
                </Button>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Medicamento</TableCell>
                      <TableCell>Lote</TableCell>
                      <TableCell>Vencimiento</TableCell>
                      <TableCell>Cantidad</TableCell>
                      <TableCell>Precio Unit.</TableCell>
                      <TableCell>Subtotal</TableCell>
                      <TableCell width={50}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detalles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography color="textSecondary">
                            No hay medicamentos agregados. Use los botones de arriba para agregar.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      detalles.map((detalle) => (
                        <TableRow key={detalle.id_temporal}>
                          <TableCell>
                            <Autocomplete
                              size="small"
                              options={insumosPresentaciones}
                              getOptionLabel={(option) => {
                                if (!option.insumo) return '';
                                const nombre = option.insumo.nombre;
                                const presentacion = option.presentacion?.nombre || '';
                                const cantidad = option.cantidad_presentacion || '';
                                const unidad = option.unidadMedida?.abreviatura || '';
                                return `${nombre} - ${presentacion} ${cantidad}${unidad}`;
                              }}
                              value={insumosPresentaciones.find(ip => 
                                ip.id_insumo_presentacion === detalle.id_insumo_presentacion
                              ) || null}
                              onChange={(e, newValue) => 
                                handleChangeDetalle(
                                  detalle.id_temporal, 
                                  'id_insumo_presentacion', 
                                  newValue?.id_insumo_presentacion || ''
                                )
                              }
                              filterOptions={(options, { inputValue }) => {
                                const searchTerm = inputValue.toLowerCase();
                                return options.filter(option => {
                                  const nombre = option.insumo?.nombre?.toLowerCase() || '';
                                  const presentacion = option.presentacion?.nombre?.toLowerCase() || '';
                                  return nombre.includes(searchTerm) || presentacion.includes(searchTerm);
                                });
                              }}
                              renderInput={(params) => (
                                <TextField 
                                  {...params} 
                                  placeholder="Buscar medicamento..."
                                  helperText="Escriba para buscar"
                                />
                              )}
                              renderOption={(props, option) => (
                                <li {...props} key={option.id_insumo_presentacion}>
                                  <Box>
                                    <Typography variant="body2">
                                      <strong>{option.insumo?.nombre}</strong>
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      {option.presentacion?.nombre} - {option.cantidad_presentacion}{option.unidadMedida?.abreviatura}
                                    </Typography>
                                  </Box>
                                </li>
                              )}
                              sx={{ minWidth: 300 }}
                              noOptionsText="No se encontraron medicamentos"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={detalle.lote}
                              onChange={(e) => 
                                handleChangeDetalle(detalle.id_temporal, 'lote', e.target.value)
                              }
                              placeholder="Lote"
                            />
                          </TableCell>
                          <TableCell>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                              <DatePicker
                                value={detalle.fecha_vencimiento}
                                onChange={(newValue) => 
                                  handleChangeDetalle(detalle.id_temporal, 'fecha_vencimiento', newValue)
                                }
                                slotProps={{ 
                                  textField: { 
                                    size: 'small',
                                    sx: { width: 150 }
                                  } 
                                }}
                              />
                            </LocalizationProvider>
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              value={detalle.cantidad}
                              onChange={(e) => 
                                handleChangeDetalle(detalle.id_temporal, 'cantidad', e.target.value)
                              }
                              inputProps={{ min: 0, step: 1 }}
                              sx={{ width: 80 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              value={detalle.precio_unitario}
                              onChange={(e) => 
                                handleChangeDetalle(detalle.id_temporal, 'precio_unitario', e.target.value)
                              }
                              inputProps={{ min: 0, step: 0.01 }}
                              sx={{ width: 100 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatearMoneda(calcularSubtotal(detalle))}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleEliminarDetalle(detalle.id_temporal)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    {detalles.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="right">
                          <strong>TOTAL:</strong>
                        </TableCell>
                        <TableCell>
                          <strong>{formatearMoneda(calcularTotal())}</strong>
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCerrar} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || detalles.length === 0}
          >
            {loading ? 'Guardando...' : 'Guardar Ingreso'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NuevoIngresoDialog;
