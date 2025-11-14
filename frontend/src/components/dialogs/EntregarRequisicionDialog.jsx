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
  MenuItem,
} from '@mui/material';
import requisicionService from '../../services/requisicionService';
import ingresoService from '../../services/ingresoService';

const EntregarRequisicionDialog = ({ open, requisicion, onClose, onSuccess }) => {
  const [detalles, setDetalles] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && requisicion) {
      cargarDetalles();
      cargarLotes();
    }
  }, [open, requisicion]);

  const cargarDetalles = async () => {
    try {
      const data = await requisicionService.obtenerRequisicion(
        requisicion.id_requisicion
      );
      
      const detallesIniciales = data.detalles.map((d) => ({
        id_detalle_requisicion: d.id_detalle_requisicion,
        id_insumo_presentacion: d.id_insumo_presentacion,
        insumo: d.insumoPresentacion?.insumo?.nombre_generico || '-',
        presentacion:
          d.insumoPresentacion?.presentacion?.nombre_presentacion || '-',
        cantidad_autorizada: d.cantidad_autorizada || 0,
        cantidad_entregada: d.cantidad_autorizada || 0,
        id_lote: '',
        precio_unitario: 0,
      }));
      
      setDetalles(detallesIniciales);
    } catch (err) {
      setError('Error al cargar detalles');
    }
  };

  const cargarLotes = async () => {
    try {
      const data = await ingresoService.getLotes();
      setLotes(data);
    } catch (err) {
      console.error('Error al cargar lotes:', err);
    }
  };

  const handleDetalleChange = (index, campo, valor) => {
    const nuevosDetalles = [...detalles];
    nuevosDetalles[index][campo] = valor;
    setDetalles(nuevosDetalles);
  };

  const getLotesPorInsumo = (id_insumo_presentacion) => {
    return lotes.filter(
      (l) => l.id_insumo_presentacion === id_insumo_presentacion
    );
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const detallesEntregados = detalles.map((d) => ({
        id_detalle_requisicion: d.id_detalle_requisicion,
        cantidad_entregada: parseInt(d.cantidad_entregada),
        id_lote: d.id_lote || null,
        precio_unitario: parseFloat(d.precio_unitario) || 0,
      }));

      await requisicionService.entregarRequisicion(
        requisicion.id_requisicion,
        detallesEntregados
      );
      
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al entregar requisición');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Entregar Requisición #{requisicion?.id_requisicion}
      </DialogTitle>
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
        </Box>

        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Registrar cantidades entregadas y lotes:
        </Typography>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Medicamento</TableCell>
                <TableCell>Presentación</TableCell>
                <TableCell align="right">Autorizado</TableCell>
                <TableCell align="right">Entregar</TableCell>
                <TableCell>Lote</TableCell>
                <TableCell align="right">Precio Unit.</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {detalles.map((detalle, index) => (
                <TableRow key={index}>
                  <TableCell>{detalle.insumo}</TableCell>
                  <TableCell>{detalle.presentacion}</TableCell>
                  <TableCell align="right">
                    {detalle.cantidad_autorizada}
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      value={detalle.cantidad_entregada}
                      onChange={(e) =>
                        handleDetalleChange(
                          index,
                          'cantidad_entregada',
                          e.target.value
                        )
                      }
                      inputProps={{
                        min: 0,
                        max: detalle.cantidad_autorizada,
                      }}
                      sx={{ width: 100 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      select
                      size="small"
                      value={detalle.id_lote}
                      onChange={(e) =>
                        handleDetalleChange(index, 'id_lote', e.target.value)
                      }
                      sx={{ minWidth: 150 }}
                    >
                      <MenuItem value="">Seleccionar</MenuItem>
                      {getLotesPorInsumo(detalle.id_insumo_presentacion).map(
                        (lote) => (
                          <MenuItem
                            key={lote.id_lote}
                            value={lote.id_lote}
                          >
                            {lote.numero_lote} - Stock: {lote.cantidad_disponible}
                          </MenuItem>
                        )
                      )}
                    </TextField>
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      value={detalle.precio_unitario}
                      onChange={(e) =>
                        handleDetalleChange(
                          index,
                          'precio_unitario',
                          e.target.value
                        )
                      }
                      inputProps={{ min: 0, step: 0.01 }}
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
          {loading ? 'Entregando...' : 'Entregar Requisición'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EntregarRequisicionDialog;
