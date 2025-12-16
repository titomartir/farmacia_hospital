import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  TextField,
  Grid
} from '@mui/material';
import {
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon
} from '@mui/icons-material';
import stock24hService from '../../services/stock24hService';

const DetalleReposicionRow = ({ reposicion }) => {
  const [open, setOpen] = useState(false);
  const [detallesCargados, setDetallesCargados] = useState(null);
  const [cargando, setCargando] = useState(false);

  const cargarDetalles = async () => {
    if (detallesCargados !== null) {
      // Ya fueron cargados, solo abrir/cerrar
      setOpen(!open);
      return;
    }

    try {
      setCargando(true);
      const response = await stock24hService.getReposicionById(reposicion.id_reposicion);
      setDetallesCargados(response.data);
      setOpen(true);
    } catch (err) {
      console.error('Error al cargar detalles:', err);
    } finally {
      setCargando(false);
    }
  };

  const mostrarDetalles = detallesCargados || reposicion;

  return (
    <>
      <TableRow hover>
        <TableCell>
          <IconButton 
            size="small" 
            onClick={cargarDetalles}
            disabled={cargando}
          >
            {open ? <ArrowUpIcon /> : <ArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          {new Date(reposicion.fecha_reposicion).toLocaleDateString()}
        </TableCell>
        <TableCell>
          {reposicion.hora_reposicion || 'N/A'}
        </TableCell>
        <TableCell>
          {reposicion.usuarioEntrega?.nombre_usuario || 'N/A'}
        </TableCell>
        <TableCell>
          {reposicion.usuarioRecibe?.nombre_usuario || 'N/A'}
        </TableCell>
        <TableCell>
          <Chip 
            label={`${mostrarDetalles.detalles?.length || 0} items`}
            size="small"
            color="primary"
          />
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {reposicion.observaciones || '-'}
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight="medium">
                Detalles de la Reposición
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Medicamento</TableCell>
                    <TableCell>Presentación</TableCell>
                    <TableCell>Lote</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Precio Unit.</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mostrarDetalles.detalles?.map((detalle, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {detalle.insumoPresentacion?.insumo?.nombre || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {detalle.insumoPresentacion?.presentacion?.nombre || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {detalle.lote?.numero_lote || 'N/A'}
                      </TableCell>
                      <TableCell align="right">
                        {parseFloat(detalle.cantidad_reponer || 0).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        Q{parseFloat(detalle.precio_unitario || 0).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        Q{(parseFloat(detalle.cantidad_reponer || 0) * parseFloat(detalle.precio_unitario || 0)).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={5} align="right">
                      <Typography variant="subtitle2" fontWeight="bold">
                        TOTAL:
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" fontWeight="bold">
                        Q{mostrarDetalles.detalles?.reduce((sum, d) => 
                          sum + (parseFloat(d.cantidad_reponer || 0) * parseFloat(d.precio_unitario || 0)), 0
                        ).toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const HistorialReposicionesDialog = ({ open, onClose }) => {
  const [reposiciones, setReposiciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  useEffect(() => {
    if (open) {
      cargarReposiciones();
    }
  }, [open]);

  const cargarReposiciones = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (fechaDesde) params.fecha_desde = fechaDesde;
      if (fechaHasta) params.fecha_hasta = fechaHasta;

      const response = await stock24hService.getReposiciones(params);
      setReposiciones(response.data || []);
    } catch (err) {
      console.error('Error al cargar reposiciones:', err);
      setError('Error al cargar el historial de reposiciones');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltrar = () => {
    cargarReposiciones();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Historial de Reposiciones</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Filtros
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Fecha Desde"
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Fecha Hasta"
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button 
                variant="contained" 
                onClick={handleFiltrar}
                fullWidth
              >
                Filtrar
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="50px" />
                  <TableCell>Fecha</TableCell>
                  <TableCell>Hora</TableCell>
                  <TableCell>Entregó</TableCell>
                  <TableCell>Recibió</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Observaciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reposiciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="textSecondary" py={3}>
                        No se encontraron reposiciones
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  reposiciones.map((reposicion) => (
                    <DetalleReposicionRow 
                      key={reposicion.id_reposicion} 
                      reposicion={reposicion} 
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default HistorialReposicionesDialog;
