import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, TextField, MenuItem, Stack, Tooltip, Alert,
  FormControl, InputLabel, Select,
} from '@mui/material';
import {
  Add as AddIcon, Visibility as VisibilityIcon, CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon, Refresh as RefreshIcon, Description as DescriptionIcon,
  Print as PrintIcon, FilterList as FilterListIcon,
} from '@mui/icons-material';
import consolidadoService from '../services/consolidadoService';
import servicioService from '../services/servicioService';
import api from '../services/api';
import NuevoConsolidadoDialog from '../components/dialogs/NuevoConsolidadoDialog';
import DetalleConsolidadoDialog from '../components/dialogs/DetalleConsolidadoDialog';

const Consolidados = () => {
  const [consolidados, setConsolidados] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({
    servicio: '', estado: 'activo', turno: '', encargado: '', fecha_desde: '', fecha_hasta: '',
  });
  const [dialogNuevo, setDialogNuevo] = useState(false);
  const [dialogDetalle, setDialogDetalle] = useState(false);
  const [consolidadoSeleccionado, setConsolidadoSeleccionado] = useState(null);

  useEffect(() => {
    cargarServicios();
    cargarUsuarios();
  }, []);

  useEffect(() => {
    cargarConsolidados();
  }, [filtros]);

  const cargarServicios = async () => {
    try {
      const data = await servicioService.listarServicios();
      setServicios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar servicios:', err);
      setServicios([]);
    }
  };

  const cargarUsuarios = async () => {
    try {
      const response = await api.get('/auth/usuarios');
      if (response.data.success) setUsuarios(response.data.data || []);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    }
  };

  const cargarConsolidados = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await consolidadoService.listarConsolidados(filtros);
      setConsolidados(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Error al cargar consolidados');
      setConsolidados([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => setFiltros(prev => ({ ...prev, [campo]: valor }));
  const handleVerDetalle = (consolidado) => {
    setConsolidadoSeleccionado(consolidado);
    setDialogDetalle(true);
  };
  const handleCerrar = async (consolidado) => {
    if (!window.confirm('¿Está seguro de cerrar este consolidado?')) return;
    try {
      await consolidadoService.cerrarConsolidado(consolidado.id_consolidado);
      cargarConsolidados();
    } catch (err) {
      setError(err.message || 'Error al cerrar consolidado');
    }
  };
  const handleAnular = async (consolidado) => {
    const motivo = window.prompt('Ingrese el motivo de anulación:');
    if (!motivo) return;
    try {
      await consolidadoService.anularConsolidado(consolidado.id_consolidado, motivo);
      cargarConsolidados();
    } catch (err) {
      setError(err.message || 'Error al anular consolidado');
    }
  };

  const getEstadoColor = (estado) => {
    const colores = { activo: 'primary', cerrado: 'success', anulado: 'error' };
    return colores[estado] || 'default';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Consolidados</Typography>
          <Typography variant="body2" color="text.secondary">Resumen de consumo por servicio</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>Imprimir</Button>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={cargarConsolidados}>Actualizar</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogNuevo(true)}>Nuevo Consolidado</Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Card elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterListIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Filtros</Typography>
          </Box>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <TextField select label="Servicio" value={filtros.servicio} onChange={(e) => handleFiltroChange('servicio', e.target.value)} sx={{ minWidth: 200 }} size="small">
              <MenuItem value="">Todos</MenuItem>
              {servicios.map((serv) => (
                <MenuItem key={serv.id_servicio} value={serv.id_servicio}>{serv.nombre_servicio}</MenuItem>
              ))}
            </TextField>
            <TextField select label="Estado" value={filtros.estado} onChange={(e) => handleFiltroChange('estado', e.target.value)} sx={{ minWidth: 150 }} size="small">
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="activo">Activo</MenuItem>
              <MenuItem value="cerrado">Cerrado</MenuItem>
              <MenuItem value="anulado">Anulado</MenuItem>
            </TextField>
            <TextField select label="Turno" value={filtros.turno} onChange={(e) => handleFiltroChange('turno', e.target.value)} sx={{ minWidth: 150 }} size="small">
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="diurno">Diurno</MenuItem>
              <MenuItem value="nocturno">Nocturno (24h)</MenuItem>
            </TextField>
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>Encargado</InputLabel>
              <Select value={filtros.encargado} onChange={(e) => handleFiltroChange('encargado', e.target.value)} label="Encargado">
                <MenuItem value="">Todos</MenuItem>
                {usuarios.map((usr) => (
                  <MenuItem key={usr.id_usuario} value={usr.id_usuario}>
                    {usr.personal?.nombres && usr.personal?.apellidos ? `${usr.personal.nombres} ${usr.personal.apellidos}` : usr.nombre_usuario}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField type="date" label="Desde" value={filtros.fecha_desde} onChange={(e) => handleFiltroChange('fecha_desde', e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
            <TextField type="date" label="Hasta" value={filtros.fecha_hasta} onChange={(e) => handleFiltroChange('fecha_hasta', e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
          </Stack>
        </CardContent>
      </Card>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Servicio</TableCell>
              <TableCell>Turno</TableCell>
              <TableCell>Encargado</TableCell>
              <TableCell align="right">Total Med.</TableCell>
              <TableCell align="right">Costo Total</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 8 }}>Cargando...</TableCell></TableRow>
            ) : consolidados.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 8 }}><Typography color="text.secondary">No hay consolidados</Typography></TableCell></TableRow>
            ) : (
              consolidados.map((cons) => (
                <TableRow key={cons.id_consolidado} hover>
                  <TableCell><Typography variant="body2">{new Date(cons.fecha_consolidado).toLocaleString('es-GT', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 500 }}>{cons.servicio?.nombre_servicio || '-'}</Typography></TableCell>
                  <TableCell><Chip label={cons.turno} size="small" color={cons.turno === 'diurno' ? 'primary' : 'secondary'} /></TableCell>
                  <TableCell><Typography variant="body2">{cons.usuario?.personal?.nombres || ''} {cons.usuario?.personal?.apellidos || ''}</Typography></TableCell>
                  <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 600 }}>{cons.total_medicamentos || 0}</Typography></TableCell>
                  <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 600 }}>Q{parseFloat(cons.costo_total || 0).toFixed(2)}</Typography></TableCell>
                  <TableCell><Chip label={cons.estado} color={getEstadoColor(cons.estado)} size="small" /></TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver detalles"><IconButton size="small" onClick={() => handleVerDetalle(cons)}><VisibilityIcon /></IconButton></Tooltip>
                    {cons.estado === 'activo' && (
                      <>
                        <Tooltip title="Cerrar"><IconButton size="small" color="success" onClick={() => handleCerrar(cons)}><CheckCircleIcon /></IconButton></Tooltip>
                        <Tooltip title="Anular"><IconButton size="small" color="error" onClick={() => handleAnular(cons)}><CancelIcon /></IconButton></Tooltip>
                      </>
                    )}
                    <Tooltip title="Imprimir"><IconButton size="small" color="info" onClick={() => window.print()}><DescriptionIcon /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <NuevoConsolidadoDialog open={dialogNuevo} onClose={() => setDialogNuevo(false)} onSuccess={() => { setDialogNuevo(false); cargarConsolidados(); }} />
      {consolidadoSeleccionado && (
        <DetalleConsolidadoDialog open={dialogDetalle} consolidado={consolidadoSeleccionado} onClose={() => { setDialogDetalle(false); setConsolidadoSeleccionado(null); }} />
      )}
    </Box>
  );
};

export default Consolidados;