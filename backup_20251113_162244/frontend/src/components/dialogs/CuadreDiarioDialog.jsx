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
  Paper,
  Stepper,
  Step,
  StepLabel,
  Chip,
  LinearProgress,
  Autocomplete
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import stock24hService from '../../services/stock24hService';

const CuadreDiarioDialog = ({ open, onClose, stockData }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [cuadreActual, setCuadreActual] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Datos del cuadre
  const [personalTurnista, setPersonalTurnista] = useState('');
  const [personalBodeguero, setPersonalBodeguero] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Personal disponible (en producción vendría de API)
  const [personalList] = useState([
    { id: 10, nombre: 'Personal Turnista 1' },
    { id: 11, nombre: 'Personal Bodeguero 1' },
    { id: 12, nombre: 'Personal Turnista 2' },
    { id: 13, nombre: 'Personal Bodeguero 2' }
  ]);

  const steps = ['Iniciar Cuadre', 'Registrar Conteos', 'Finalizar'];

  useEffect(() => {
    if (open && activeStep === 0) {
      // Reset al abrir
      setCuadreActual(null);
      setDetalles([]);
      setError(null);
      setSuccess(null);
    }
  }, [open, activeStep]);

  const handleIniciarCuadre = async () => {
    if (!personalTurnista || !personalBodeguero) {
      setError('Debe seleccionar el personal turnista y bodeguero');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await stock24hService.iniciarCuadre({
        id_personal_turnista: parseInt(personalTurnista),
        id_personal_bodeguero: parseInt(personalBodeguero),
        observaciones
      });

      const cuadre = response.data;
      setCuadreActual(cuadre);
      setDetalles(cuadre.detalles || []);
      setActiveStep(1);
      setSuccess('Cuadre iniciado exitosamente');
    } catch (err) {
      console.error('Error al iniciar cuadre:', err);
      setError(err.response?.data?.message || 'Error al iniciar el cuadre');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarConteo = async (index, cantidadFisica) => {
    const detalle = detalles[index];
    
    try {
      await stock24hService.registrarConteo(
        cuadreActual.id_cuadre_stock,
        detalle.id_detalle_cuadre,
        { cantidad_fisica: parseFloat(cantidadFisica) }
      );

      // Actualizar el detalle localmente
      const nuevosDetalles = [...detalles];
      nuevosDetalles[index] = {
        ...detalle,
        cantidad_fisica: parseFloat(cantidadFisica),
        diferencia: parseFloat(cantidadFisica) - parseFloat(detalle.cantidad_teorica)
      };
      setDetalles(nuevosDetalles);
      
    } catch (err) {
      console.error('Error al registrar conteo:', err);
      setError(err.response?.data?.message || 'Error al registrar el conteo');
    }
  };

  const handleFinalizarCuadre = async () => {
    // Verificar que todos los items estén contados
    const sinContar = detalles.filter(d => d.cantidad_fisica === null || d.cantidad_fisica === undefined);
    
    if (sinContar.length > 0) {
      setError(`Faltan ${sinContar.length} medicamentos por contar`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await stock24hService.finalizarCuadre(cuadreActual.id_cuadre_stock);
      
      setSuccess('Cuadre finalizado exitosamente. El stock ha sido ajustado.');
      setActiveStep(2);
      
      setTimeout(() => {
        onClose(true); // true indica que se finalizó
      }, 2000);
    } catch (err) {
      console.error('Error al finalizar cuadre:', err);
      setError(err.response?.data?.message || 'Error al finalizar el cuadre');
    } finally {
      setLoading(false);
    }
  };

  const getConteoProgreso = () => {
    const contados = detalles.filter(d => d.cantidad_fisica !== null && d.cantidad_fisica !== undefined).length;
    return (contados / detalles.length) * 100;
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="body2" color="textSecondary" paragraph>
              El cuadre diario permite verificar físicamente el stock de medicamentos y ajustar
              el sistema según las diferencias encontradas.
            </Typography>

            <Box display="flex" flexDirection="column" gap={2} mt={3}>
              <Autocomplete
                options={personalList}
                getOptionLabel={(option) => option.nombre}
                onChange={(e, value) => setPersonalTurnista(value?.id || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Personal Turnista"
                    required
                  />
                )}
              />

              <Autocomplete
                options={personalList}
                getOptionLabel={(option) => option.nombre}
                onChange={(e, value) => setPersonalBodeguero(value?.id || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Personal Bodeguero"
                    required
                  />
                )}
              />

              <TextField
                fullWidth
                label="Observaciones"
                multiline
                rows={2}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              Se registrarán <strong>{stockData?.length || 0} medicamentos</strong> para el conteo físico.
            </Alert>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Box mb={2}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Progreso del conteo
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={getConteoProgreso()} 
                sx={{ height: 8, borderRadius: 1 }}
              />
              <Typography variant="caption" color="textSecondary" mt={0.5}>
                {detalles.filter(d => d.cantidad_fisica !== null).length} de {detalles.length} medicamentos contados
              </Typography>
            </Box>

            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Medicamento</TableCell>
                    <TableCell align="center">Cant. Teórica</TableCell>
                    <TableCell align="center">Cant. Física</TableCell>
                    <TableCell align="center">Diferencia</TableCell>
                    <TableCell align="center">Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detalles.map((detalle, index) => {
                    const contado = detalle.cantidad_fisica !== null && detalle.cantidad_fisica !== undefined;
                    const diferencia = contado ? detalle.diferencia : null;
                    
                    return (
                      <TableRow key={detalle.id_detalle_cuadre}>
                        <TableCell>
                          <Typography variant="body2">
                            {detalle.insumo_presentacion?.insumo?.nombre_insumo || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {detalle.insumo_presentacion?.presentacion?.nombre_presentacion || ''}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight="medium">
                            {parseFloat(detalle.cantidad_teorica || 0).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            size="small"
                            value={detalle.cantidad_fisica || ''}
                            onChange={(e) => {
                              const nuevosDetalles = [...detalles];
                              nuevosDetalles[index].cantidad_fisica = e.target.value;
                              setDetalles(nuevosDetalles);
                            }}
                            onBlur={(e) => {
                              if (e.target.value) {
                                handleRegistrarConteo(index, e.target.value);
                              }
                            }}
                            inputProps={{ 
                              min: 0, 
                              step: 0.01,
                              style: { textAlign: 'center', width: '80px' }
                            }}
                            disabled={loading}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {diferencia !== null && (
                            <Chip
                              label={diferencia >= 0 ? `+${diferencia.toFixed(2)}` : diferencia.toFixed(2)}
                              color={
                                diferencia === 0 ? 'success' :
                                diferencia > 0 ? 'info' :
                                'error'
                              }
                              size="small"
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {contado ? (
                            <CheckCircleIcon color="success" fontSize="small" />
                          ) : (
                            <PendingIcon color="disabled" fontSize="small" />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Importante:</strong> Ingrese la cantidad física encontrada en cada medicamento.
                Las diferencias se ajustarán automáticamente al finalizar el cuadre.
              </Typography>
            </Alert>
          </Box>
        );

      case 2:
        return (
          <Box textAlign="center" py={4}>
            <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              ¡Cuadre Finalizado!
            </Typography>
            <Typography variant="body2" color="textSecondary">
              El stock 24h ha sido ajustado según los conteos físicos realizados.
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  const handleClose = () => {
    if (activeStep === 0 || activeStep === 2) {
      onClose(activeStep === 2);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      disableEscapeKeyDown={activeStep === 1}
    >
      <DialogTitle>
        Cuadre Diario de Stock 24h
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

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

        {renderStepContent()}
      </DialogContent>

      <DialogActions>
        {activeStep === 0 && (
          <>
            <Button onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              onClick={handleIniciarCuadre}
              disabled={loading || !personalTurnista || !personalBodeguero}
            >
              {loading ? 'Iniciando...' : 'Iniciar Cuadre'}
            </Button>
          </>
        )}

        {activeStep === 1 && (
          <>
            <Button onClick={() => setActiveStep(0)} disabled={loading}>
              Volver
            </Button>
            <Button 
              variant="contained" 
              onClick={handleFinalizarCuadre}
              disabled={loading || getConteoProgreso() < 100}
            >
              {loading ? 'Finalizando...' : 'Finalizar Cuadre'}
            </Button>
          </>
        )}

        {activeStep === 2 && (
          <Button variant="contained" onClick={handleClose}>
            Cerrar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CuadreDiarioDialog;
