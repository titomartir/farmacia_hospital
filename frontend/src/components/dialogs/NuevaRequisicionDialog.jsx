import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Autocomplete,
  Typography,
  Alert,
  Stack,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import requisicionService from '../../services/requisicionService';
import servicioService from '../../services/servicioService';
import insumoService from '../../services/insumoService';

const NuevaRequisicionDialog = ({ open, onClose, onSuccess, requisicionEditar = null }) => {
  const [servicios, setServicios] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [esEdicion, setEsEdicion] = useState(false);

  // Encabezado de la requisición
  const [formData, setFormData] = useState({
    id_servicio: '',
    fecha_solicitud: new Date().toISOString(),
    prioridad: 'normal',
    observaciones: '',
  });

  // Medicamentos seleccionados (columnas)
  const [medicamentosColumnas, setMedicamentosColumnas] = useState([]);

  // Matriz de datos: medicamentos × filas de datos del paciente
  const [datosMatriz, setDatosMatriz] = useState(
    Array(10).fill(null).map(() => ({
      numero_cama: '',
      numero_registro: '',
      nombre_paciente: '',
      sexo: '',
      medicamentos: {},
    }))
  );

  const [medicamentoActual, setMedicamentoActual] = useState(null);

  useEffect(() => {
    if (open) {
      cargarServicios();
      cargarInsumos();
      if (requisicionEditar && requisicionEditar.id_requisicion) {
        cargarRequisicionParaEdicion();
      } else {
        resetForm();
      }
    }
  }, [open, requisicionEditar?.id_requisicion]);

  const cargarServicios = async () => {
    try {
      const data = await servicioService.listarServicios();
      setServicios(data);
    } catch (err) {
      console.error('Error al cargar servicios:', err);
    }
  };

  const cargarInsumos = async () => {
    try {
      const data = await insumoService.getInsumosPresentaciones();
      setInsumos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar insumos:', err);
      setInsumos([]);
      setError('Error al cargar medicamentos');
    }
  };

  const resetForm = () => {
    setFormData({
      id_servicio: '',
      fecha_solicitud: new Date().toISOString(),
      prioridad: 'normal',
      observaciones: '',
    });
    setMedicamentosColumnas([]);
    setDatosMatriz(
      Array(10).fill(null).map(() => ({
        numero_cama: '',
        numero_registro: '',
        nombre_paciente: '',
        sexo: '',
        medicamentos: {},
      }))
    );
    setError('');
    setEsEdicion(false);
  };

  const cargarRequisicionParaEdicion = async () => {
    try {
      setLoading(true);
      const requisicion = await requisicionService.obtenerRequisicion(requisicionEditar.id_requisicion);
      
      setFormData({
        id_servicio: requisicion.id_servicio || '',
        fecha_solicitud: requisicion.fecha_solicitud || new Date().toISOString(),
        prioridad: requisicion.prioridad || 'normal',
        observaciones: requisicion.observaciones || '',
      });

      // Reconstruir medicamentos y matriz desde detalles
      const medicamentosMap = {};
      const datosMap = {};

      if (requisicion.detalles && requisicion.detalles.length > 0) {
        requisicion.detalles.forEach((detalle, idx) => {
          const insumoData = detalle.insumoPresentacion?.insumo;
          if (insumoData && insumoData.id_insumo) {
            if (!medicamentosMap[insumoData.id_insumo]) {
              medicamentosMap[insumoData.id_insumo] = {
                id_insumo: insumoData.id_insumo,
                id_insumo_presentacion: detalle.id_insumo_presentacion,
                nombre: insumoData.nombre || '',
                presentaciones: detalle.insumoPresentacion ? [detalle.insumoPresentacion] : [],
              };
            }
          }

          if (!datosMap[idx]) {
            datosMap[idx] = {
              numero_cama: detalle.numero_cama || '',
              numero_registro: detalle.numero_expediente || '',
              nombre_paciente: detalle.nombre_paciente || '',
              sexo: detalle.sexo || '',
              medicamentos: {}
            };
          }

          if (insumoData && insumoData.id_insumo) {
            datosMap[idx].medicamentos[insumoData.id_insumo] = detalle.cantidad_solicitada;
          }
        });
      }

      setMedicamentosColumnas(Object.values(medicamentosMap));
      
      const nuevaMatriz = Array(10).fill(null).map((_, idx) => {
        return datosMap[idx] || {
          numero_cama: '',
          numero_registro: '',
          nombre_paciente: '',
          sexo: '',
          medicamentos: {}
        };
      });
      setDatosMatriz(nuevaMatriz);
      setEsEdicion(true);
      setError('');
    } catch (err) {
      console.error('Error cargando requisición:', err);
      setError('Error al cargar requisición para editar');
      setEsEdicion(false);
      setDatosMatriz(
        Array(10).fill(null).map(() => ({
          numero_cama: '',
          numero_registro: '',
          nombre_paciente: '',
          sexo: '',
          medicamentos: {},
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarMedicamento = (insumo) => {
    if (!insumo) return;
    if (medicamentosColumnas.find(m => m.id_insumo === insumo.id_insumo)) {
      setError('Este medicamento ya está agregado');
      return;
    }

    const presentacion = insumo.presentaciones && insumo.presentaciones.length > 0 
      ? insumo.presentaciones[0] 
      : null;
    
    if (!presentacion) {
      setError('Este medicamento no tiene presentaciones disponibles');
      return;
    }

    setMedicamentosColumnas([...medicamentosColumnas, {
      ...insumo,
      id_insumo_presentacion: presentacion.id_insumo_presentacion,
    }]);
    setMedicamentoActual(null);
    setError('');
  };

  const handleEliminarMedicamento = (id_insumo) => {
    setMedicamentosColumnas(medicamentosColumnas.filter(m => m.id_insumo !== id_insumo));
    
    setDatosMatriz(datosMatriz.map(fila => {
      const nuevosMedicamentos = { ...fila.medicamentos };
      delete nuevosMedicamentos[id_insumo];
      return { ...fila, medicamentos: nuevosMedicamentos };
    }));
  };

  const handleCambiarCantidad = (index, idInsumo, cantidad) => {
    setDatosMatriz(datosMatriz.map((fila, i) => {
      if (i === index) {
        return {
          ...fila,
          medicamentos: {
            ...fila.medicamentos,
            [idInsumo]: parseFloat(cantidad) || 0,
          },
        };
      }
      return fila;
    }));
  };

  const handleCambiarNumeroCama = (index, valor) => {
    setDatosMatriz(datosMatriz.map((fila, i) => {
      if (i === index) {
        return { ...fila, numero_cama: valor };
      }
      return fila;
    }));
  };

  const handleCambiarExpediente = (index, valor) => {
    setDatosMatriz(datosMatriz.map((fila, i) => {
      if (i === index) {
        return { ...fila, numero_registro: valor };
      }
      return fila;
    }));
  };

  const handleCambiarNombrePaciente = (index, valor) => {
    setDatosMatriz(datosMatriz.map((fila, i) => {
      if (i === index) {
        return { ...fila, nombre_paciente: valor };
      }
      return fila;
    }));
  };

  const handleCambiarSexo = (index, valor) => {
    setDatosMatriz(datosMatriz.map((fila, i) => {
      if (i === index) {
        return { ...fila, sexo: valor };
      }
      return fila;
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.id_servicio) {
        setError('Seleccione un servicio');
        return;
      }

      if (medicamentosColumnas.length === 0) {
        setError('Agregue al menos un medicamento');
        return;
      }

      // Construir detalles desde la matriz
      const detalles = [];
      datosMatriz.forEach((fila, index) => {
        if (fila.nombre_paciente || fila.numero_cama) {
          medicamentosColumnas.forEach(med => {
            const cantidad = fila.medicamentos[med.id_insumo];
            if (cantidad && cantidad > 0) {
              detalles.push({
                id_insumo_presentacion: med.id_insumo_presentacion,
                cantidad_solicitada: cantidad,
                numero_cama: fila.numero_cama,
                numero_expediente: fila.numero_registro,
                nombre_paciente: fila.nombre_paciente,
                sexo: fila.sexo,
              });
            }
          });
        }
      });

      if (detalles.length === 0) {
        setError('Ingrese al menos una cantidad de medicamento para un paciente');
        return;
      }

      setLoading(true);
      setError('');

      const payload = {
        id_servicio: formData.id_servicio,
        fecha_solicitud: formData.fecha_solicitud,
        prioridad: formData.prioridad,
        observaciones: formData.observaciones,
        detalles,
      };

      if (esEdicion && requisicionEditar) {
        await requisicionService.actualizarRequisicion(requisicionEditar.id_requisicion, payload);
      } else {
        await requisicionService.crearRequisicion(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || `Error al ${esEdicion ? 'actualizar' : 'crear'} requisición`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>{esEdicion ? 'Editar Requisición' : 'Nueva Requisición'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Encabezado */}
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Servicio"
                value={formData.id_servicio}
                onChange={(e) => setFormData({ ...formData, id_servicio: e.target.value })}
                required
              >
                {servicios.map((serv) => (
                  <MenuItem key={serv.id_servicio} value={serv.id_servicio}>
                    {serv.nombre_servicio}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Fecha y Hora"
                value={formData.fecha_solicitud ? formData.fecha_solicitud.slice(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, fecha_solicitud: new Date(e.target.value).toISOString() })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Prioridad"
                value={formData.prioridad}
                onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
              >
                <MenuItem value="urgente">Urgente</MenuItem>
                <MenuItem value="alta">Alta</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="baja">Baja</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Observaciones"
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Agregar medicamentos */}
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="flex-end">
            <Autocomplete
              sx={{ flex: 1 }}
              options={insumos}
              getOptionLabel={(option) => {
                const nombreInsumo = option.insumo?.nombre || 'Sin nombre';
                const presentacion = option.presentacion?.nombre || '';
                return `${nombreInsumo}${presentacion ? ' - ' + presentacion : ''}`;
              }}
              value={medicamentoActual}
              onChange={(_, newValue) => setMedicamentoActual(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Buscar medicamento..." size="small" />
              )}
              isOptionEqualToValue={(option, value) => 
                option.id_insumo_presentacion === value?.id_insumo_presentacion
              }
              noOptionsText="No se encontraron medicamentos"
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleAgregarMedicamento(medicamentoActual)}
              sx={{ height: '40px' }}
            >
              Agregar
            </Button>
          </Stack>
        </Paper>

        {/* Matriz de datos */}
        {medicamentosColumnas.length > 0 && (
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600, minWidth: 80 }}>CAMA</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>EXPEDIENTE</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>PACIENTE</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 80 }}>SEXO</TableCell>
                  {medicamentosColumnas.map((med) => (
                    <TableCell key={med.id_insumo} sx={{ fontWeight: 600, minWidth: 120, textAlign: 'center' }}>
                      <Box>
                        <Typography variant="caption" display="block">
                          {med.nombre}
                        </Typography>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleEliminarMedicamento(med.id_insumo)}
                          sx={{ p: 0 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {datosMatriz.map((fila, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <TextField
                        size="small"
                        value={fila.numero_cama}
                        onChange={(e) => handleCambiarNumeroCama(index, e.target.value)}
                        placeholder="Cama"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={fila.numero_registro}
                        onChange={(e) => handleCambiarExpediente(index, e.target.value)}
                        placeholder="Expediente"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={fila.nombre_paciente}
                        onChange={(e) => handleCambiarNombrePaciente(index, e.target.value)}
                        placeholder="Nombre"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <RadioGroup
                        row
                        value={fila.sexo}
                        onChange={(e) => handleCambiarSexo(index, e.target.value)}
                        sx={{ justifyContent: 'space-around' }}
                      >
                        <FormControlLabel value="M" control={<Radio size="small" />} label="M" />
                        <FormControlLabel value="F" control={<Radio size="small" />} label="F" />
                      </RadioGroup>
                    </TableCell>
                    {medicamentosColumnas.map((med) => (
                      <TableCell key={med.id_insumo} align="center">
                        <TextField
                          size="small"
                          type="number"
                          value={fila.medicamentos[med.id_insumo] || ''}
                          onChange={(e) => handleCambiarCantidad(index, med.id_insumo, e.target.value)}
                          placeholder="0"
                          variant="outlined"
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || medicamentosColumnas.length === 0}
        >
          {loading ? (esEdicion ? 'Actualizando...' : 'Guardando...') : (esEdicion ? 'Actualizar Requisición' : 'Crear Requisición')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NuevaRequisicionDialog;
