import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Autocomplete,
  Paper,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import stock24hService from '../../services/stock24hService';
import insumoService from '../../services/insumoService';

const NuevaReposicionDialog = ({ open, onClose }) => {
  const [detalles, setDetalles] = useState([]);
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Estados para agregar detalle
  const [insumosPresentacion, setInsumosPresentacion] = useState([]);
  const [lotesDisponibles, setLotesDisponibles] = useState([]);
  const [selectedInsumo, setSelectedInsumo] = useState(null);
  const [selectedLote, setSelectedLote] = useState(null);
  const [cantidad, setCantidad] = useState('');

  useEffect(() => {
    if (open) {
      cargarInsumosPresentacion();
    }
  }, [open]);

  const cargarInsumosPresentacion = async () => {
    try {
      const response = await insumoService.getInsumosPresentaciones();
      console.log('Insumos presentaciones cargados:', response);
      setInsumosPresentacion(response || []);
    } catch (err) {
      console.error('Error al cargar insumos:', err);
      setError('Error al cargar la lista de medicamentos');
    }
  };

  const cargarLotes = async (idInsumoPresentacion) => {
    try {
      // Llamar al endpoint de lotes disponibles para ese insumo
      const response = await insumoService.getLotesDisponibles(idInsumoPresentacion);
      setLotesDisponibles(response || []);
    } catch (err) {
      console.error('Error al cargar lotes:', err);
      setLotesDisponibles([]);
    }
  };

  const handleInsumoChange = (event, value) => {
    console.log('Insumo seleccionado:', value);
    setSelectedInsumo(value);
    setSelectedLote(null);
    setLotesDisponibles([]);
    
    if (value) {
      cargarLotes(value.id_insumo_presentacion);
    }
  };

  const handleAgregarDetalle = () => {
    if (!selectedInsumo || !selectedLote || !cantidad || cantidad <= 0) {
      setError('Complete todos los campos para agregar el detalle');
      return;
    }

    // Verificar que no se agregue el mismo lote dos veces
    const existe = detalles.find(d => d.id_lote === selectedLote.id_lote);
    if (existe) {
      setError('Este lote ya fue agregado');
      return;
    }

    const nuevoDetalle = {
      id_insumo_presentacion: selectedInsumo.id_insumo_presentacion,
      id_lote: selectedLote.id_lote,
      cantidad: parseFloat(cantidad),
      precio_unitario: parseFloat(selectedLote.precio_lote || 0),
      // Datos para mostrar en la tabla
      nombre_insumo: selectedInsumo.insumo?.nombre || 'N/A',
      presentacion: selectedInsumo.presentacion?.nombre || 'N/A',
      numero_lote: selectedLote.numero_lote,
      fecha_vencimiento: selectedLote.fecha_vencimiento
    };

    console.log('Nuevo detalle creado:', nuevoDetalle);
    setDetalles([...detalles, nuevoDetalle]);
    
    // Limpiar campos
    setSelectedInsumo(null);
    setSelectedLote(null);
    setCantidad('');
    setLotesDisponibles([]);
    setError(null);
  };

  const handleEliminarDetalle = (index) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (detalles.length === 0) {
      setError('Debe agregar al menos un medicamento a la reposición');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = {
        detalles: detalles.map(d => ({
          id_insumo_presentacion: d.id_insumo_presentacion,
          id_lote: d.id_lote,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario
        })),
        observaciones
      };

      await stock24hService.crearReposicion(data);
      
      setSuccess('Reposición creada exitosamente');
      setTimeout(() => {
        onClose(true); // true indica que se creó
      }, 1500);
    } catch (err) {
      console.error('Error al crear reposición:', err);
      setError(err.response?.data?.message || 'Error al crear la reposición');
    } finally {
      setLoading(false);
    }
  };

  const calcularTotal = () => {
    return detalles.reduce((sum, d) => sum + (d.cantidad * d.precio_unitario), 0);
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Nueva Reposición a Stock 24h</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {/* Sección para agregar medicamentos */}
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
              Agregar Medicamento
            </Typography>
            
            <Box display="flex" gap={2} alignItems="flex-start" flexWrap="wrap">
              <Box flex="1" minWidth="200px">
                <Autocomplete
                  options={insumosPresentacion}
                  getOptionLabel={(option) => {
                    const nombre = option.insumo?.nombre || 'Sin nombre';
                    const presentacion = option.presentacion?.nombre || 'Sin presentación';
                    return `${nombre} - ${presentacion}`;
                  }}
                  getOptionKey={(option) => option.id_insumo_presentacion}
                  value={selectedInsumo}
                  onChange={handleInsumoChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Medicamento"
                      size="small"
                    />
                  )}
                  isOptionEqualToValue={(option, value) => 
                    option.id_insumo_presentacion === value?.id_insumo_presentacion
                  }
                />
              </Box>

              <Box flex="1" minWidth="200px">
                <Autocomplete
                  options={lotesDisponibles}
                  getOptionLabel={(option) => 
                    `Lote: ${option.numero_lote} (Stock: ${option.cantidad_actual || 0})`
                  }
                  value={selectedLote}
                  onChange={(e, value) => setSelectedLote(value)}
                  disabled={!selectedInsumo}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Lote Disponible"
                      size="small"
                    />
                  )}
                  isOptionEqualToValue={(option, value) => 
                    option.id_lote === value?.id_lote
                  }
                />
              </Box>

              <TextField
                label="Cantidad"
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                size="small"
                sx={{ width: '120px' }}
                inputProps={{ min: 0, step: 0.01 }}
              />

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAgregarDetalle}
                disabled={!selectedInsumo || !selectedLote || !cantidad}
              >
                Agregar
              </Button>
            </Box>
          </Paper>

          {/* Tabla de medicamentos agregados */}
          <Typography variant="subtitle1" gutterBottom fontWeight="medium">
            Medicamentos a Reponer ({detalles.length})
          </Typography>

          <TableContainer component={Paper} sx={{ mb: 2 }}>
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
                  <TableCell align="center">Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detalles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="textSecondary" py={2}>
                        No hay medicamentos agregados
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  detalles.map((detalle, index) => (
                    <TableRow key={`${detalle.id_lote}-${index}`}>
                      <TableCell>{detalle.nombre_insumo}</TableCell>
                      <TableCell>{detalle.presentacion}</TableCell>
                      <TableCell>{detalle.numero_lote}</TableCell>
                      <TableCell>
                        {detalle.fecha_vencimiento ? 
                          new Date(detalle.fecha_vencimiento).toLocaleDateString() : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell align="right">{detalle.cantidad}</TableCell>
                      <TableCell align="right">
                        Q{detalle.precio_unitario.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        Q{(detalle.cantidad * detalle.precio_unitario).toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleEliminarDetalle(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {detalles.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="right">
                      <Typography variant="subtitle1" fontWeight="bold">
                        TOTAL:
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle1" fontWeight="bold">
                        Q{calcularTotal().toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ my: 2 }} />

          <TextField
            fullWidth
            label="Observaciones"
            multiline
            rows={2}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || detalles.length === 0}
          >
            {loading ? 'Creando...' : 'Crear Reposición'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default NuevaReposicionDialog;
