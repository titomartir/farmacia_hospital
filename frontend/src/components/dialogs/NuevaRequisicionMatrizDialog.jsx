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
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Autocomplete,
  Typography,
  Stack,
  Divider,
  Alert,
  Chip,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import servicioService from '../../services/servicioService';
import insumoService from '../../services/insumoService';
import requisicionService from '../../services/requisicionService';
import { authService } from '../../services/authService';

const NuevaRequisicionMatrizDialog = ({ open, onClose, onSuccess }) => {
  const [servicios, setServicios] = useState([]);
  const [insumosPresentaciones, setInsumosPresentaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usuarioActual, setUsuarioActual] = useState(null);

  // Encabezado de la requisición
  const [formData, setFormData] = useState({
    id_servicio: '',
    fecha_solicitud: new Date().toISOString(),
    prioridad: 'normal',
    observaciones: '',
    origen_despacho: 'general',
  });

  // Medicamentos seleccionados (columnas)
  const [medicamentosColumnas, setMedicamentosColumnas] = useState([]);

  // Matriz de datos: pacientes × medicamentos
  const [pacientes, setPacientes] = useState([
    {
      id: 1,
      numero_cama: '',
      nombre_paciente: '',
      medicamentos: {},
    }
  ]);

  useEffect(() => {
    if (open) {
      cargarServicios();
      cargarInsumos();
      const usuario = authService.getCurrentUser();
      setUsuarioActual(usuario);
      resetForm();
    }
  }, [open]);

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
      const response = await insumoService.getInsumosPresentaciones();
      setInsumosPresentaciones(response.data || response || []);
    } catch (err) {
      console.error('Error al cargar insumos:', err);
      setError('Error al cargar medicamentos');
    }
  };

  const resetForm = () => {
    setFormData({
      id_servicio: '',
      fecha_solicitud: new Date().toISOString(),
      prioridad: 'normal',
      observaciones: '',
      origen_despacho: 'general',
    });
    setMedicamentosColumnas([]);
    setPacientes([
      {
        id: 1,
        numero_cama: '',
        nombre_paciente: '',
        medicamentos: {},
      }
    ]);
    setError('');
  };

  const handleChange = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  // Agregar medicamento como columna
  const handleAgregarMedicamento = (medicamento) => {
    if (!medicamento) return;

    // Verificar que no esté ya agregado
    const yaExiste = medicamentosColumnas.some(
      m => m.id_insumo_presentacion === medicamento.id_insumo_presentacion
    );

    if (yaExiste) {
      setError('Este medicamento ya fue agregado');
      return;
    }

    setMedicamentosColumnas(prev => [...prev, medicamento]);
    
    // Agregar columna vacía a todos los pacientes
    setPacientes(prev =>
      prev.map(p => ({
        ...p,
        medicamentos: {
          ...p.medicamentos,
          [medicamento.id_insumo_presentacion]: '',
        },
      }))
    );
  };

  // Eliminar medicamento columna
  const handleEliminarMedicamento = (idMedicamento) => {
    setMedicamentosColumnas(prev =>
      prev.filter(m => m.id_insumo_presentacion !== idMedicamento)
    );

    // Eliminar de todos los pacientes
    setPacientes(prev =>
      prev.map(p => {
        const { [idMedicamento]: removed, ...rest } = p.medicamentos;
        return { ...p, medicamentos: rest };
      })
    );
  };

  // Agregar paciente (fila)
  const handleAgregarPaciente = () => {
    const nuevoId = Math.max(...pacientes.map(p => p.id), 0) + 1;
    const medicamentos = {};
    medicamentosColumnas.forEach(med => {
      medicamentos[med.id_insumo_presentacion] = '';
    });

    setPacientes(prev => [
      ...prev,
      {
        id: nuevoId,
        numero_cama: '',
        nombre_paciente: '',
        medicamentos,
      },
    ]);
  };

  // Eliminar paciente
  const handleEliminarPaciente = (id) => {
    if (pacientes.length === 1) {
      setError('Debe haber al menos un paciente');
      return;
    }
    setPacientes(prev => prev.filter(p => p.id !== id));
  };

  // Actualizar dato del paciente
  const handleCambioPaciente = (id, campo, valor) => {
    setPacientes(prev =>
      prev.map(p =>
        p.id === id ? { ...p, [campo]: valor } : p
      )
    );
  };

  // Actualizar cantidad de medicamento
  const handleCambioCantidad = (idPaciente, idMedicamento, cantidad) => {
    setPacientes(prev =>
      prev.map(p =>
        p.id === idPaciente
          ? {
              ...p,
              medicamentos: {
                ...p.medicamentos,
                [idMedicamento]: cantidad,
              },
            }
          : p
      )
    );
  };

  // Calcular total por medicamento
  const calcularTotalMedicamento = (idMedicamento) => {
    return pacientes.reduce((total, paciente) => {
      const cantidad = parseFloat(paciente.medicamentos[idMedicamento] || 0);
      return total + cantidad;
    }, 0);
  };

  const handleSubmit = async () => {
    try {
      // Validaciones
      if (!formData.id_servicio) {
        setError('Seleccione un servicio');
        return;
      }

      if (medicamentosColumnas.length === 0) {
        setError('Agregue al menos un medicamento');
        return;
      }

      // Verificar que al menos un paciente tenga datos
      const tieneDatos = pacientes.some(p => 
        p.numero_cama || p.nombre_paciente || 
        Object.values(p.medicamentos).some(cant => parseFloat(cant || 0) > 0)
      );

      if (!tieneDatos) {
        setError('Debe ingresar al menos un paciente con medicamentos');
        return;
      }

      setLoading(true);
      setError('');

      // Crear una requisición por cada paciente que tenga medicamentos
      const requisiciones = [];

      for (const paciente of pacientes) {
        // Filtrar medicamentos con cantidad > 0
        const detalles = [];
        medicamentosColumnas.forEach(med => {
          const cantidad = parseFloat(paciente.medicamentos[med.id_insumo_presentacion] || 0);
          if (cantidad > 0) {
            detalles.push({
              id_insumo_presentacion: med.id_insumo_presentacion,
              cantidad_solicitada: cantidad,
              observaciones: '',
            });
          }
        });

        // Solo crear requisición si hay medicamentos
        if (detalles.length > 0) {
          const payload = {
            id_servicio: formData.id_servicio,
            fecha_solicitud: formData.fecha_solicitud,
            prioridad: formData.prioridad,
            observaciones: formData.observaciones,
            origen_despacho: formData.origen_despacho,
            numero_cama: paciente.numero_cama || null,
            nombre_paciente: paciente.nombre_paciente || null,
            detalles,
          };

          const result = await requisicionService.crearRequisicion(payload);
          requisiciones.push(result);
        }
      }

      if (requisiciones.length === 0) {
        setError('No hay medicamentos para solicitar');
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error al crear requisiciones:', err);
      setError(err.response?.data?.message || 'Error al crear las requisiciones');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Typography variant="h5">Nueva Requisición - Formato Matriz</Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Encabezado */}
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Información General
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Servicio *"
                value={formData.id_servicio}
                onChange={(e) => handleChange('id_servicio', e.target.value)}
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
                value={formData.fecha_solicitud.slice(0, 16)}
                onChange={(e) =>
                  handleChange('fecha_solicitud', new Date(e.target.value).toISOString())
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Prioridad"
                value={formData.prioridad}
                onChange={(e) => handleChange('prioridad', e.target.value)}
              >
                <MenuItem value="urgente">Urgente</MenuItem>
                <MenuItem value="alta">Alta</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="baja">Baja</MenuItem>
              </TextField>
            </Grid>

            {/* Origen de Despacho - Solo para turnistas */}
            {usuarioActual?.es_turnista && (
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Origen de Despacho</FormLabel>
                  <RadioGroup
                    row
                    value={formData.origen_despacho}
                    onChange={(e) => handleChange('origen_despacho', e.target.value)}
                  >
                    <FormControlLabel
                      value="general"
                      control={<Radio />}
                      label="Inventario General"
                    />
                    <FormControlLabel
                      value="stock_24h"
                      control={<Radio />}
                      label="Stock 24 Horas"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Observaciones"
                value={formData.observaciones}
                onChange={(e) => handleChange('observaciones', e.target.value)}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Selección de Medicamentos */}
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Medicamentos a Solicitar</Typography>
            <Chip label={`${medicamentosColumnas.length} seleccionados`} color="primary" />
          </Stack>

          <Autocomplete
            options={insumosPresentaciones}
            getOptionLabel={(option) =>
              `${option.insumo?.nombre || ''} - ${option.presentacion?.nombre || ''}`
            }
            onChange={(_, newValue) => handleAgregarMedicamento(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Agregar medicamento" placeholder="Buscar..." />
            )}
            value={null}
            isOptionEqualToValue={(option, value) =>
              option.id_insumo_presentacion === value?.id_insumo_presentacion
            }
          />

          {medicamentosColumnas.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {medicamentosColumnas.map((med) => (
                  <Chip
                    key={med.id_insumo_presentacion}
                    label={`${med.insumo?.nombre} - ${med.presentacion?.nombre}`}
                    onDelete={() => handleEliminarMedicamento(med.id_insumo_presentacion)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Paper>

        {/* Matriz de Pacientes × Medicamentos */}
        {medicamentosColumnas.length > 0 && (
          <Paper elevation={2} sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">Pacientes y Cantidades</Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAgregarPaciente}
                size="small"
              >
                Agregar Paciente
              </Button>
            </Stack>

            <TableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}>Cama</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>Paciente</TableCell>
                    {medicamentosColumnas.map((med) => (
                      <TableCell
                        key={med.id_insumo_presentacion}
                        align="center"
                        sx={{ fontWeight: 'bold', minWidth: 100 }}
                      >
                        <Typography variant="caption" display="block">
                          {med.insumo?.nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {med.presentacion?.nombre}
                        </Typography>
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pacientes.map((paciente) => (
                    <TableRow key={paciente.id}>
                      <TableCell>
                        <TextField
                          size="small"
                          value={paciente.numero_cama}
                          onChange={(e) =>
                            handleCambioPaciente(paciente.id, 'numero_cama', e.target.value)
                          }
                          placeholder="Ej: 101"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={paciente.nombre_paciente}
                          onChange={(e) =>
                            handleCambioPaciente(paciente.id, 'nombre_paciente', e.target.value)
                          }
                          placeholder="Nombre del paciente"
                        />
                      </TableCell>
                      {medicamentosColumnas.map((med) => (
                        <TableCell key={med.id_insumo_presentacion} align="center">
                          <TextField
                            size="small"
                            type="number"
                            value={paciente.medicamentos[med.id_insumo_presentacion] || ''}
                            onChange={(e) =>
                              handleCambioCantidad(
                                paciente.id,
                                med.id_insumo_presentacion,
                                e.target.value
                              )
                            }
                            inputProps={{ min: 0, step: 1 }}
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                      ))}
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleEliminarPaciente(paciente.id)}
                          disabled={pacientes.length === 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Fila de totales */}
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>
                      TOTALES
                    </TableCell>
                    {medicamentosColumnas.map((med) => (
                      <TableCell
                        key={med.id_insumo_presentacion}
                        align="center"
                        sx={{ fontWeight: 'bold' }}
                      >
                        {calcularTotalMedicamento(med.id_insumo_presentacion).toFixed(0)}
                      </TableCell>
                    ))}
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={loading || medicamentosColumnas.length === 0}
        >
          {loading ? 'Guardando...' : 'Crear Requisiciones'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NuevaRequisicionMatrizDialog;
