import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Grid,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Settings as SettingsIcon,
  Inventory as InventoryIcon,
  History as HistoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  LocalShipping as LocalShippingIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import stock24hService from '../services/stock24hService';
import ConfigurarStockDialog from '../components/dialogs/ConfigurarStockDialog';
import NuevaReposicionDialog from '../components/dialogs/NuevaReposicionDialog';
import CuadreDiarioDialog from '../components/dialogs/CuadreDiarioDialog';
import HistorialReposicionesDialog from '../components/dialogs/HistorialReposicionesDialog';

const Stock24h = () => {
  const [stock, setStock] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [nivelAlerta, setNivelAlerta] = useState('todos');

  // Estados para diálogos
  const [configurarDialog, setConfigurarDialog] = useState({ open: false, item: null });
  const [reposicionDialog, setReposicionDialog] = useState(false);
  const [cuadreDialog, setCuadreDialog] = useState(false);
  const [historialDialog, setHistorialDialog] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [nivelAlerta]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (nivelAlerta !== 'todos') {
        params.nivel_alerta = nivelAlerta;
      }

      const [stockData, statsData] = await Promise.all([
        stock24hService.getStock24h(params).catch(err => {
          console.error('Error al cargar stock:', err);
          return { data: [], success: false };
        }),
        stock24hService.getEstadisticas().catch(err => {
          console.error('Error al cargar estadísticas:', err);
          return { data: null, success: false };
        })
      ]);

      setStock(Array.isArray(stockData.data) ? stockData.data : []);
      setEstadisticas(statsData.data || null);

      // Si no hay datos, mostrar mensaje informativo
      if (!stockData.data || stockData.data.length === 0) {
        setError('No hay stock 24h configurado. Configure los medicamentos que necesita para este servicio.');
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos del stock 24h: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleConfigurarStock = (item) => {
    setConfigurarDialog({ open: true, item });
  };

  const handleCloseConfigurar = (actualizado) => {
    setConfigurarDialog({ open: false, item: null });
    if (actualizado) {
      cargarDatos();
    }
  };

  const handleCloseReposicion = (creada) => {
    setReposicionDialog(false);
    if (creada) {
      cargarDatos();
    }
  };

  const handleCloseCuadre = (finalizado) => {
    setCuadreDialog(false);
    if (finalizado) {
      cargarDatos();
    }
  };

  const getNivelAlertaConfig = (nivel) => {
    switch (nivel?.toLowerCase()) {
      case 'crítico':
      case 'critico':
        return { color: 'error', icon: <ErrorIcon />, label: 'CRÍTICO' };
      case 'bajo':
        return { color: 'warning', icon: <WarningIcon />, label: 'BAJO' };
      case 'ok':
        return { color: 'success', icon: <CheckCircleIcon />, label: 'OK' };
      default:
        return { color: 'default', icon: null, label: nivel || 'N/A' };
    }
  };

  const stockFiltrado = stock.filter(item => {
    const nombreInsumo = item.insumo_presentacion?.insumo?.nombre_insumo || '';
    const presentacion = item.insumo_presentacion?.presentacion?.nombre_presentacion || '';
    const textoBusqueda = `${nombreInsumo} ${presentacion}`.toLowerCase();
    return textoBusqueda.includes(filtro.toLowerCase());
  });

  const getPorcentajeStock = (actual, fijo) => {
    if (!fijo || fijo === 0) return 0;
    return ((actual / fijo) * 100).toFixed(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Stock 24 Horas
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => setHistorialDialog(true)}
          >
            Historial
          </Button>
          <Button
            variant="outlined"
            startIcon={<LocalShippingIcon />}
            onClick={() => setReposicionDialog(true)}
          >
            Nueva Reposición
          </Button>
          <Button
            variant="contained"
            startIcon={<AssessmentIcon />}
            onClick={() => setCuadreDialog(true)}
          >
            Cuadre Diario
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Estadísticas */}
      {estadisticas && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total Medicamentos
                </Typography>
                <Typography variant="h4">
                  {estadisticas.total_medicamentos || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
              <CardContent>
                <Typography gutterBottom variant="body2">
                  Stock Crítico
                </Typography>
                <Typography variant="h4">
                  {estadisticas.critico || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <CardContent>
                <Typography gutterBottom variant="body2">
                  Stock Bajo
                </Typography>
                <Typography variant="h4">
                  {estadisticas.bajo || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
              <CardContent>
                <Typography gutterBottom variant="body2">
                  Stock OK
                </Typography>
                <Typography variant="h4">
                  {estadisticas.ok || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Buscar medicamento"
              variant="outlined"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip
                label="Todos"
                color={nivelAlerta === 'todos' ? 'primary' : 'default'}
                onClick={() => setNivelAlerta('todos')}
              />
              <Chip
                label="Crítico"
                color={nivelAlerta === 'crítico' ? 'error' : 'default'}
                onClick={() => setNivelAlerta('crítico')}
              />
              <Chip
                label="Bajo"
                color={nivelAlerta === 'bajo' ? 'warning' : 'default'}
                onClick={() => setNivelAlerta('bajo')}
              />
              <Chip
                label="OK"
                color={nivelAlerta === 'ok' ? 'success' : 'default'}
                onClick={() => setNivelAlerta('ok')}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de Stock */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Medicamento</TableCell>
              <TableCell>Presentación</TableCell>
              <TableCell align="center">Stock Actual</TableCell>
              <TableCell align="center">Stock Fijo</TableCell>
              <TableCell align="center">Porcentaje</TableCell>
              <TableCell align="center">Nivel Alerta</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stockFiltrado.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="textSecondary" py={3}>
                    No hay medicamentos configurados para stock 24h
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              stockFiltrado.map((item) => {
                const alertaConfig = getNivelAlertaConfig(item.nivel_alerta);
                const porcentaje = getPorcentajeStock(item.cantidad_actual, item.cantidad_fija);
                
                return (
                  <TableRow key={item.id_stock_24h} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {item.insumo_presentacion?.insumo?.nombre_insumo || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {item.insumo_presentacion?.presentacion?.nombre_presentacion || 'N/A'}
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight="bold">
                        {parseFloat(item.cantidad_actual || 0).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {parseFloat(item.cantidad_fija || 0).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${porcentaje}%`}
                        size="small"
                        color={
                          porcentaje < 30 ? 'error' :
                          porcentaje < 50 ? 'warning' :
                          'success'
                        }
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={alertaConfig.icon}
                        label={alertaConfig.label}
                        color={alertaConfig.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Configurar stock fijo">
                        <IconButton
                          size="small"
                          onClick={() => handleConfigurarStock(item)}
                          color="primary"
                        >
                          <SettingsIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogos */}
      {configurarDialog.open && (
        <ConfigurarStockDialog
          open={configurarDialog.open}
          item={configurarDialog.item}
          onClose={handleCloseConfigurar}
        />
      )}

      {reposicionDialog && (
        <NuevaReposicionDialog
          open={reposicionDialog}
          onClose={handleCloseReposicion}
        />
      )}

      {cuadreDialog && (
        <CuadreDiarioDialog
          open={cuadreDialog}
          onClose={handleCloseCuadre}
          stockData={stock}
        />
      )}

      {historialDialog && (
        <HistorialReposicionesDialog
          open={historialDialog}
          onClose={() => setHistorialDialog(false)}
        />
      )}
    </Box>
  );
};

export default Stock24h;
