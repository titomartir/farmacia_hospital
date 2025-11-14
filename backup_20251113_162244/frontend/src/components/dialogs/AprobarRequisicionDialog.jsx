import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
  Alert,
  Box,
} from '@mui/material';
import requisicionService from '../../services/requisicionService';

const AprobarRequisicionDialog = ({ open, requisicion, onClose, onSuccess }) => {
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && requisicion) {
      cargarDetalles();
    }
  }, [open, requisicion]);

  const cargarDetalles = async () => {
    try {
      const data = await requisicionService.obtenerRequisicion(
        requisicion.id_requisicion
      );
      
      const detallesIniciales = data.detalles.map((d) => ({
        id_detalle_requisicion: d.id_detalle_requisicion,
        insumo: d.insumoPresentacion?.insumo?.nombre_generico || '-',
        presentacion:
          d.insumoPresentacion?.presentacion?.nombre_presentacion || '-',
        cantidad_solicitada: d.cantidad_solicitada,
        cantidad_autorizada: d.cantidad_solicitada, // Por defecto, autorizar lo solicitado
      }));
      
      setDetalles(detallesIniciales);
    } catch (err) {
      setError('Error al cargar detalles');
    }
  };

  const handleCantidadChange = (index, valor) => {
    const nuevosDetalles = [...detalles];
    nuevosDetalles[index].cantidad_autorizada = parseInt(valor) || 0;
    setDetalles(nuevosDetalles);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const detallesAutorizados = detalles.map((d) => ({
        id_detalle_requisicion: d.id_detalle_requisicion,
        cantidad_autorizada: d.cantidad_autorizada,
      }));

      await requisicionService.aprobarRequisicion(
        requisicion.id_requisicion,
        detallesAutorizados
      );
      
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al aprobar requisición');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Aprobar Requisición #{requisicion?.id_requisicion}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Servicio:</strong> {requisicion?.servicio?.nombre_servicio}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Solicitante:</strong>{' '}
            {requisicion?.usuarioSolicita?.personal?.nombres}{' '}
            {requisicion?.usuarioSolicita?.personal?.apellidos}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Prioridad:</strong> {requisicion?.prioridad}
          </Typography>
        </Box>

        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Ajustar cantidades autorizadas:
        </Typography>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Medicamento</TableCell>
                <TableCell>Presentación</TableCell>
                <TableCell align="right">Solicitado</TableCell>
                <TableCell align="right">Autorizar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {detalles.map((detalle, index) => (
                <TableRow key={index}>
                  <TableCell>{detalle.insumo}</TableCell>
                  <TableCell>{detalle.presentacion}</TableCell>
                  <TableCell align="right">
                    {detalle.cantidad_solicitada}
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      value={detalle.cantidad_autorizada}
                      onChange={(e) =>
                        handleCantidadChange(index, e.target.value)
                      }
                      inputProps={{
                        min: 0,
                        max: detalle.cantidad_solicitada,
                      }}
                      sx={{ width: 100 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Aprobando...' : 'Aprobar Requisición'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AprobarRequisicionDialog;
