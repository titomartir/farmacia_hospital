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
  Autocomplete,
  Grid
} from '@mui/material';
import api from '../../services/api';
import stock24hService from '../../services/stock24hService';

const AgregarMedicamentoStock24hDialog = ({ open, onClose }) => {
  const [insumosPresentacion, setInsumosPresentacion] = useState([]);
  const [selectedInsumo, setSelectedInsumo] = useState(null);
  const [cantidadFija, setCantidadFija] = useState('');
  const [stockInicial, setStockInicial] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (open) {
      cargarInsumosPresentacion();
      // Limpiar campos al abrir
      setSelectedInsumo(null);
      setCantidadFija('');
      setStockInicial('0');
      setError(null);
      setSuccess(null);
    }
  }, [open]);

  const cargarInsumosPresentacion = async () => {
    try {
      setLoading(true);
      console.log('Cargando insumos presentaciones...');
      
      const response = await api.get('/insumos/presentaciones/lista');
      console.log('Respuesta insumos:', response.data);
      
      if (response.data.success) {
        // Filtrar solo los que NO están ya en stock 24h
        const stockActual = await stock24hService.getStock24h();
        console.log('Stock actual:', stockActual);
        
        const idsEnStock = stockActual.data?.map(s => s.id_insumo_presentacion) || [];
        console.log('IDs en stock 24h:', idsEnStock);
        
        const disponibles = response.data.data.filter(
          ip => !idsEnStock.includes(ip.id_insumo_presentacion)
        );
        
        console.log('Medicamentos disponibles para agregar:', disponibles.length);
        setInsumosPresentacion(disponibles);
      }
    } catch (err) {
      console.error('Error cargando insumos:', err);
      setError('Error al cargar la lista de medicamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedInsumo) {
      setError('Debe seleccionar un medicamento');
      return;
    }
    
    if (!cantidadFija || parseFloat(cantidadFija) <= 0) {
      setError('La cantidad fija debe ser mayor a 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await stock24hService.agregarMedicamentoStock24h({
        id_insumo_presentacion: selectedInsumo.id_insumo_presentacion,
        cantidad_fija: parseFloat(cantidadFija),
        stock_actual: parseFloat(stockInicial) || 0
      });

      setSuccess('Medicamento agregado exitosamente al stock 24h');
      
      setTimeout(() => {
        onClose(true); // true indica que se agregó correctamente
      }, 1500);
    } catch (err) {
      console.error('Error al agregar medicamento:', err);
      setError(err.response?.data?.message || 'Error al agregar el medicamento al stock 24h');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Agregar Medicamento a Stock 24 Horas</DialogTitle>
        <DialogContent>
          <Box mt={1}>
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

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  options={insumosPresentacion}
                  getOptionKey={(option) => option.id_insumo_presentacion}
                  getOptionLabel={(option) => {
                    const nombre = option.insumo?.nombre || 'Sin nombre';
                    const presentacion = option.presentacion?.nombre || 'Sin presentación';
                    return `${nombre} - ${presentacion}`;
                  }}
                  value={selectedInsumo}
                  onChange={(event, newValue) => setSelectedInsumo(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Medicamento *"
                      placeholder="Buscar medicamento..."
                      helperText="Solo se muestran medicamentos que NO están en stock 24h"
                    />
                  )}
                  isOptionEqualToValue={(option, value) => 
                    option.id_insumo_presentacion === value?.id_insumo_presentacion
                  }
                  disabled={loading}
                  noOptionsText="No hay medicamentos disponibles para agregar"
                  loading={loading}
                />
              </Grid>

              {selectedInsumo && (
                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Información del medicamento
                    </Typography>
                    <Typography variant="body2">
                      <strong>Nombre:</strong> {selectedInsumo.insumo?.nombre || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Presentación:</strong> {selectedInsumo.presentacion?.nombre || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Unidad:</strong> {selectedInsumo.unidad_medida?.nombre_unidad_medida || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Stock mínimo general:</strong> {selectedInsumo.stock_minimo || 0}
                    </Typography>
                  </Box>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cantidad Fija (Stock de Seguridad) *"
                  type="number"
                  value={cantidadFija}
                  onChange={(e) => setCantidadFija(e.target.value)}
                  required
                  inputProps={{ min: 0.01, step: 0.01 }}
                  helperText="Cantidad que debe mantenerse siempre"
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Stock Inicial"
                  type="number"
                  value={stockInicial}
                  onChange={(e) => setStockInicial(e.target.value)}
                  inputProps={{ min: 0, step: 0.01 }}
                  helperText="Cantidad actual (opcional)"
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 1 }}>
                  <strong>Nota:</strong> Este medicamento estará disponible exclusivamente para personal de turno 24 horas.
                </Alert>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || !selectedInsumo}
          >
            {loading ? 'Agregando...' : 'Agregar a Stock 24h'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AgregarMedicamentoStock24hDialog;
