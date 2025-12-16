import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert
} from '@mui/material';
import stock24hService from '../../services/stock24hService';

const ConfigurarStockDialog = ({ open, item, onClose }) => {
  const [cantidadFija, setCantidadFija] = useState(
    item?.cantidad_fija ? parseFloat(item.cantidad_fija) : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cantidadFija || cantidadFija <= 0) {
      setError('La cantidad fija debe ser mayor a 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await stock24hService.configurarStock({
        id_insumo_presentacion: item.id_insumo_presentacion,
        cantidad_fija: parseFloat(cantidadFija)
      });

      onClose(true); // true indica que se actualizó
    } catch (err) {
      console.error('Error al configurar stock:', err);
      setError(err.response?.data?.message || 'Error al configurar el stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Configurar Stock Fijo</DialogTitle>
        <DialogContent>
          <Box mb={2} mt={1}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Medicamento
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {item?.insumoPresentacion?.insumo?.nombre || 'N/A'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {item?.insumoPresentacion?.presentacion?.nombre || 'N/A'}
            </Typography>
          </Box>

          <Box mb={2}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Stock Actual
            </Typography>
            <Typography variant="h6">
              {parseFloat(item?.stock_actual || 0).toFixed(2)} unidades
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Cantidad Fija (Stock de Seguridad)"
            type="number"
            value={cantidadFija}
            onChange={(e) => setCantidadFija(e.target.value)}
            required
            inputProps={{ min: 0, step: 0.01 }}
            helperText="Cantidad mínima que debe mantenerse en stock 24h"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ConfigurarStockDialog;
