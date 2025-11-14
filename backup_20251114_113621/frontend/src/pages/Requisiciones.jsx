import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Stack,
  Tooltip,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as LocalShippingIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import requisicionService from '../services/requisicionService';
import api from '../services/api';
import NuevaRequisicionDialog from '../components/dialogs/NuevaRequisicionDialog';
import AprobarRequisicionDialog from '../components/dialogs/AprobarRequisicionDialog';
import EntregarRequisicionDialog from '../components/dialogs/EntregarRequisicionDialog';
import DetalleRequisicionDialog from '../components/dialogs/DetalleRequisicionDialog';

const Requisiciones = () => {
  const [requisiciones, setRequisiciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [servicios, setServicios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [filtros, setFiltros] = useState({
    estado: '',
    prioridad: '',
    servicio: '',
    solicitante: '',
  });

  // Estados de los diálogos
  const [dialogNueva, setDialogNueva] = useState(false);
  const [dialogAprobar, setDialogAprobar] = useState(false);
  const [dialogEntregar, setDialogEntregar] = useState(false);
  const [dialogDetalle, setDialogDetalle] = useState(false);
  const [requisicionSeleccionada, setRequisicionSeleccionada] = useState(null);

  useEffect(() => {
    cargarServicios();
    cargarUsuarios();
    cargarRequisiciones();
  }, [filtros]);

  const cargarServicios = async () => {
    try {
      const response = await api.get('/catalogos/servicios');
      if (response.data.success) {
        setServicios(response.data.data || []);
      }
    } catch (err) {
      console.error('Error cargando servicios:', err);
    }
  };

  const cargarUsuarios = async () => {
    try {
      const response = await api.get('/auth/usuarios');
      if (response.data.success) {
        setUsuarios(response.data.data || []);
      }
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    }
  };

  const cargarRequisiciones = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await requisicionService.listarRequisiciones(filtros);
      setRequisiciones(data);
    } catch (err) {
      setError(err.message || 'Error al cargar requisiciones');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const handleVerDetalle = (requisicion) => {
    setRequisicionSeleccionada(requisicion);
    setDialogDetalle(true);
  };

  const handleAprobar = (requisicion) => {
    setRequisicionSeleccionada(requisicion);
    setDialogAprobar(true);
  };

  const handleEntregar = (requisicion) => {
    setRequisicionSeleccionada(requisicion);
    setDialogEntregar(true);
  };

  const handleRechazar = async (requisicion) => {
    const motivo = window.prompt('Ingrese el motivo del rechazo:');
    if (!motivo) return;

    try {
      await requisicionService.rechazarRequisicion(requisicion.id_requisicion, motivo);
      cargarRequisiciones();
    } catch (err) {
      setError(err.message || 'Error al rechazar requisición');
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: 'warning',
      aprobada: 'info',
      entregada: 'success',
      rechazada: 'error',
    };
    return colores[estado] || 'default';
  };

  const getPrioridadColor = (prioridad) => {
    const colores = {
      urgente: 'error',
      alta: 'warning',
      normal: 'default',
      baja: 'info',
    };
    return colores[prioridad] || 'default';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Requisiciones
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            size="small"
          >
            Imprimir
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={cargarRequisiciones}
            size="small"
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogNueva(true)}
            size="small"
          >
            Nueva Requisición
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filtros */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Grid container spacing={1.5}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filtros.estado}
                  onChange={(e) => handleFiltroChange('estado', e.target.value)}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="pendiente">Pendiente</MenuItem>
                  <MenuItem value="aprobada">Aprobada</MenuItem>
                  <MenuItem value="entregada">Entregada</MenuItem>
                  <MenuItem value="rechazada">Rechazada</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Prioridad</InputLabel>
                <Select
                  value={filtros.prioridad}
                  onChange={(e) => handleFiltroChange('prioridad', e.target.value)}
                  label="Prioridad"
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="urgente">Urgente</MenuItem>
                  <MenuItem value="alta">Alta</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="baja">Baja</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Servicio</InputLabel>
                <Select
                  value={filtros.servicio}
                  onChange={(e) => handleFiltroChange('servicio', e.target.value)}
                  label="Servicio"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {servicios.map((servicio) => (
                    <MenuItem key={servicio.id_servicio} value={servicio.id_servicio}>
                      {servicio.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Solicitante</InputLabel>
                <Select
                  value={filtros.solicitante}
                  onChange={(e) => handleFiltroChange('solicitante', e.target.value)}
                  label="Solicitante"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {usuarios.map((usr) => (
                    <MenuItem key={usr.id_usuario} value={usr.id_usuario}>
                      {usr.personal?.nombres && usr.personal?.apellidos 
                        ? `${usr.personal.nombres} ${usr.personal.apellidos}` 
                        : usr.nombre_usuario}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={1}>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={() => setFiltros({ estado: '', prioridad: '', servicio: '', solicitante: '' })}
                sx={{ height: '40px' }}
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabla de requisiciones */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Fecha Solicitud</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Servicio</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Solicitante</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Prioridad</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : requisiciones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay requisiciones
                </TableCell>
              </TableRow>
            ) : (
              requisiciones.map((req) => (
                <TableRow key={req.id_requisicion}>
                  <TableCell>{req.id_requisicion}</TableCell>
                  <TableCell>
                    {new Date(req.fecha_solicitud).toLocaleString('es-GT', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>{req.servicio?.nombre_servicio || '-'}</TableCell>
                  <TableCell>
                    {req.usuarioSolicita?.personal?.nombres || ''}{' '}
                    {req.usuarioSolicita?.personal?.apellidos || ''}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={req.prioridad}
                      color={getPrioridadColor(req.prioridad)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={req.estado}
                      color={getEstadoColor(req.estado)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver detalles">
                      <IconButton
                        size="small"
                        onClick={() => handleVerDetalle(req)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>

                    {req.estado === 'pendiente' && (
                      <>
                        <Tooltip title="Aprobar">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleAprobar(req)}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Rechazar">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRechazar(req)}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}

                    {req.estado === 'aprobada' && (
                      <Tooltip title="Entregar">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEntregar(req)}
                        >
                          <LocalShippingIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogos */}
      <NuevaRequisicionDialog
        open={dialogNueva}
        onClose={() => setDialogNueva(false)}
        onSuccess={() => {
          setDialogNueva(false);
          cargarRequisiciones();
        }}
      />

      {requisicionSeleccionada && (
        <>
          <AprobarRequisicionDialog
            open={dialogAprobar}
            requisicion={requisicionSeleccionada}
            onClose={() => {
              setDialogAprobar(false);
              setRequisicionSeleccionada(null);
            }}
            onSuccess={() => {
              setDialogAprobar(false);
              setRequisicionSeleccionada(null);
              cargarRequisiciones();
            }}
          />

          <EntregarRequisicionDialog
            open={dialogEntregar}
            requisicion={requisicionSeleccionada}
            onClose={() => {
              setDialogEntregar(false);
              setRequisicionSeleccionada(null);
            }}
            onSuccess={() => {
              setDialogEntregar(false);
              setRequisicionSeleccionada(null);
              cargarRequisiciones();
            }}
          />

          <DetalleRequisicionDialog
            open={dialogDetalle}
            requisicion={requisicionSeleccionada}
            onClose={() => {
              setDialogDetalle(false);
              setRequisicionSeleccionada(null);
            }}
          />
        </>
      )}
    </Box>
  );
};

export default Requisiciones;
