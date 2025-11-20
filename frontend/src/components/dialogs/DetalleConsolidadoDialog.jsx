import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Print as PrintIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import consolidadoService from '../../services/consolidadoService';

const DetalleConsolidadoDialog = ({ open, consolidado, onClose }) => {
  const [detalleCompleto, setDetalleCompleto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && consolidado) {
      cargarDetalle();
    }
  }, [open, consolidado]);

  const cargarDetalle = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Cargando detalle del consolidado:', consolidado.id_consolidado);
      const data = await consolidadoService.obtenerConsolidado(consolidado.id_consolidado);
      console.log('Datos recibidos:', data);
      setDetalleCompleto(data);
    } catch (err) {
      console.error('Error al cargar detalle:', err);
      setError(err.response?.data?.message || 'Error al cargar el detalle del consolidado');
    } finally {
      setLoading(false);
    }
  };

  if (!consolidado) return null;

  const getEstadoColor = (estado) => {
    const colores = {
      activo: 'primary',
      cerrado: 'success',
      anulado: 'error',
    };
    return colores[estado] || 'default';
  };

  // Organizar datos por cama y medicamento
  const organizarDatos = () => {
    if (!detalleCompleto?.detalles || !Array.isArray(detalleCompleto.detalles)) {
      console.log('No hay detalles válidos');
      return { camas: [], medicamentos: [], matriz: {} };
    }

    console.log('Total detalles:', detalleCompleto.detalles.length);
    if (detalleCompleto.detalles.length > 0) {
      console.log('Primer detalle completo:', JSON.stringify(detalleCompleto.detalles[0], null, 2));
    }

    const camasSet = new Set();
    const medicamentosMap = new Map();

    detalleCompleto.detalles.forEach(det => {
      if (det.numero_cama) {
        camasSet.add(det.numero_cama);
      }
      if (det.id_insumo_presentacion && !medicamentosMap.has(det.id_insumo_presentacion)) {
        // Intentar varias formas de acceder a los datos
        let nombreInsumo = 'Medicamento desconocido';
        let nombrePresentacion = '';

        // Verificar estructura de datos
        if (det.insumoPresentacion) {
          nombreInsumo = det.insumoPresentacion.insumo?.nombre || nombreInsumo;
          nombrePresentacion = det.insumoPresentacion.presentacion?.nombre || '';
        }

        medicamentosMap.set(det.id_insumo_presentacion, {
          id: det.id_insumo_presentacion,
          nombre: nombreInsumo,
          presentacion: nombrePresentacion,
        });
      }
    });

    const camas = Array.from(camasSet).sort((a, b) => parseInt(a) - parseInt(b));
    const medicamentos = Array.from(medicamentosMap.values());

    console.log('Camas procesadas:', camas);
    console.log('Medicamentos procesados:', medicamentos);

    // Crear matriz de datos
    const matriz = {};
    detalleCompleto.detalles.forEach(det => {
      const key = `${det.numero_cama}-${det.id_insumo_presentacion}`;
      matriz[key] = {
        cantidad: parseFloat(det.cantidad) || 0,
        paciente: det.nombre_paciente || '',
        expediente: det.numero_registro || '',
        costo: parseFloat(det.precio_unitario) || 0,
      };
    });

    return { camas, medicamentos, matriz };
  };

  const { camas, medicamentos, matriz } = detalleCompleto ? organizarDatos() : { camas: [], medicamentos: [], matriz: {} };

  const calcularTotalMedicamento = (idInsumo) => {
    let total = 0;
    camas.forEach(cama => {
      const key = `${cama}-${idInsumo}`;
      if (matriz[key]) {
        total += matriz[key].cantidad;
      }
    });
    return total;
  };

  const calcularCostoTotal = () => {
    let total = 0;
    Object.values(matriz).forEach(item => {
      total += (item.cantidad * (item.costo || 0));
    });
    return total;
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <>
      <style>
        {`
          @media print {
            .no-print-cost {
              display: none !important;
            }
          }
        `}
      </style>
      <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Consolidado #{consolidado.id_consolidado}
          </Typography>
          <Chip
            label={consolidado.estado}
            color={getEstadoColor(consolidado.estado)}
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : !detalleCompleto ? (
          <Alert severity="info">
            No se encontraron datos del consolidado
          </Alert>
        ) : (
          <>
            {/* Información general */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Servicio
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {consolidado.servicio?.nombre_servicio || '-'}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Fecha y Hora
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {new Date(consolidado.fecha_consolidado).toLocaleString('es-GT', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Turno
                  </Typography>
                  <Typography variant="body1" component="div" gutterBottom>
                    <Chip
                      label={consolidado.turno}
                      size="small"
                      color={consolidado.turno === 'diurno' ? 'primary' : 'secondary'}
                    />
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Creado por
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {consolidado.usuario?.personal?.nombres || ''}{' '}
                    {consolidado.usuario?.personal?.apellidos || ''}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Fecha y Hora Creación
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {consolidado.fecha_creacion ? new Date(consolidado.fecha_creacion).toLocaleString('es-GT', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '-'}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Total medicamentos
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {consolidado.total_medicamentos || 0}
                  </Typography>
                </Grid>

                {consolidado.observaciones && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Observaciones
                    </Typography>
                    <Typography variant="body1">
                      {consolidado.observaciones}
                    </Typography>
                  </Grid>
                )}

                {consolidado.estado === 'anulado' && consolidado.motivo_anulacion && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="error">
                      Motivo de anulación
                    </Typography>
                    <Typography variant="body1" color="error">
                      {consolidado.motivo_anulacion}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Matriz de datos */}
            {medicamentos.length > 0 && (
              <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', minWidth: 80 }}>Cama</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>Paciente</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', minWidth: 150 }}>No. Expediente</TableCell>
                      {medicamentos.map((med) => (
                        <TableCell key={med.id} align="center" sx={{ fontWeight: 'bold', minWidth: 120 }}>
                          {med.nombre}
                          <Typography variant="caption" display="block">
                            {med.presentacion}
                          </Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {camas.map((cama) => {
                      // Buscar el nombre del paciente y expediente en cualquier medicamento de esta cama
                      let nombrePaciente = '';
                      let numeroExpediente = '';
                      for (const med of medicamentos) {
                        const key = `${cama}-${med.id}`;
                        if (matriz[key] && matriz[key].paciente) {
                          nombrePaciente = matriz[key].paciente;
                          numeroExpediente = matriz[key].expediente;
                          break;
                        }
                      }

                      return (
                        <TableRow key={`cama-${cama}`}>
                          <TableCell>{cama}</TableCell>
                          <TableCell>{nombrePaciente}</TableCell>
                          <TableCell>{numeroExpediente}</TableCell>
                          {medicamentos.map((med) => {
                            const key = `${cama}-${med.id}`;
                            const dato = matriz[key];
                            return (
                              <TableCell key={`${key}-cell`} align="center">
                                {dato && dato.cantidad ? dato.cantidad.toFixed(1) : '-'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}

                    {/* Fila de totales */}
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>
                        TOTALES
                      </TableCell>
                      {medicamentos.map((med) => (
                        <TableCell key={`total-${med.id}`} align="center" sx={{ fontWeight: 'bold' }}>
                          {calcularTotalMedicamento(med.id).toFixed(1)}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Resumen de costos */}
            <Paper 
              elevation={2} 
              sx={{ p: 2, mt: 3, backgroundColor: '#f5f5f5' }}
              className="no-print-cost"
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Total unidades administradas
                  </Typography>
                  <Typography variant="h6">
                    {consolidado.total_medicamentos || 0}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Camas ocupadas
                  </Typography>
                  <Typography variant="h6">
                    {camas.length}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Costo total estimado
                  </Typography>
                  <Typography variant="h6" color="primary">
                    Q{calcularCostoTotal().toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          startIcon={<PrintIcon />}
          onClick={handleImprimir}
        >
          Imprimir
        </Button>
        <Button
          variant="contained"
          startIcon={<CloseIcon />}
          onClick={onClose}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default DetalleConsolidadoDialog;
