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
  Autocomplete,
  Typography,
  Alert,
  Stack,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  Chip,
} from '@mui/material';
import requisicionService from '../../services/requisicionService';
import servicioService from '../../services/servicioService';
import insumoService from '../../services/insumoService';

const NuevaRequisicionDialog = ({ open, onClose, onSuccess, requisicionEditar = null }) => {
  const [servicios, setServicios] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [esEdicion, setEsEdicion] = useState(false);

  // Encabezado
  const [formData, setFormData] = useState({
    id_servicio: '',
    fecha_solicitud: new Date().toISOString(),
    prioridad: 'normal',
    observaciones: '',
  });

  // Medicamentos seleccionados (columnas)
  const [medicamentosColumnas, setMedicamentosColumnas] = useState([]);

  // Matriz de datos: 30 camas
  const [datosMatriz, setDatosMatriz] = useState(
    Array(30).fill(null).map((_, idx) => ({
      numero_cama: idx + 1,
      numero_expediente: '',
      nombre_paciente: '',
      sexo: '',
      medicamentos: {},
    }))
  );

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
      const data = await insumoService.getInsumos({ activo: true });
      const insumosArray = data.data || data;
      setInsumos(Array.isArray(insumosArray) ? insumosArray : []);
    } catch (err) {
      console.error('Error al cargar insumos:', err);
      setInsumos([]);
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
      Array(30).fill(null).map((_, idx) => ({
        numero_cama: idx + 1,
        numero_expediente: '',
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
      
      console.log('📥 Requisición cargada para edición:', requisicion);
      
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
        requisicion.detalles.forEach(detalle => {
          const insumoData = detalle.insumoPresentacion?.insumo;
          const presentacionData = detalle.insumoPresentacion?.presentacion;
          
          if (insumoData && insumoData.id_insumo) {
            if (!medicamentosMap[insumoData.id_insumo]) {
              medicamentosMap[insumoData.id_insumo] = {
                id_insumo: insumoData.id_insumo,
                id_insumo_presentacion: detalle.id_insumo_presentacion,
                nombre: insumoData.nombre || '',
                presentacion: presentacionData?.nombre || '',
                presentaciones: detalle.insumoPresentacion ? [detalle.insumoPresentacion] : [],
              };
            }
          }

          const cama = detalle.numero_cama;
          if (cama && !datosMap[cama]) {
            datosMap[cama] = {
              numero_cama: cama,
              numero_expediente: detalle.numero_expediente || '',
              nombre_paciente: detalle.nombre_paciente || '',
              sexo: detalle.sexo || '',
              medicamentos: {}
            };
          }
          
          if (cama && insumoData && insumoData.id_insumo) {
            datosMap[cama].medicamentos[insumoData.id_insumo] = detalle.cantidad_solicitada;
          }
        });
      }

      console.log('📊 Medicamentos mapa:', medicamentosMap);
      console.log('📋 Datos mapa:', datosMap);
      
      setMedicamentosColumnas(Object.values(medicamentosMap));
      
      const nuevaMatriz = Array(30).fill(null).map((_, idx) => {
        const cama = idx + 1;
        return datosMap[cama] || {
          numero_cama: cama,
          numero_expediente: '',
          nombre_paciente: '',
          sexo: '',
          medicamentos: {}
        };
      });
      
      console.log('🔄 Nueva matriz:', nuevaMatriz);
      
      setDatosMatriz(nuevaMatriz);
      setEsEdicion(true);
      setError('');
    } catch (err) {
      console.error('Error cargando requisición:', err);
      setError('Error al cargar requisición para editar');
      setEsEdicion(false);
      setDatosMatriz(
        Array(30).fill(null).map((_, idx) => ({
          numero_cama: idx + 1,
          numero_expediente: '',
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

    const id_insumo_presentacion = insumo.id_insumo_presentacion || 
      (insumo.presentaciones && insumo.presentaciones.length > 0 
        ? insumo.presentaciones[0].id_insumo_presentacion 
        : null);

    if (!id_insumo_presentacion) {
      setError('Este medicamento no tiene presentación disponible');
      return;
    }

    setMedicamentosColumnas([...medicamentosColumnas, {
      ...insumo,
      id_insumo_presentacion,
    }]);
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

  const handleCambiarCantidad = (numeroCama, idInsumo, cantidad) => {
    setDatosMatriz(datosMatriz.map(fila => {
      if (fila.numero_cama === numeroCama) {
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

  const handleCambiarExpediente = (numeroCama, expediente) => {
    // Solo permitir números
    const soloNumeros = expediente.replace(/[^0-9]/g, '');
    setDatosMatriz(datosMatriz.map(fila => {
      if (fila.numero_cama === numeroCama) {
        return { ...fila, numero_expediente: soloNumeros };
      }
      return fila;
    }));
  };

  const handleCambiarNombrePaciente = (numeroCama, nombre) => {
    // No permitir números
    const sinNumeros = nombre.replace(/[0-9]/g, '');
    setDatosMatriz(datosMatriz.map(fila => {
      if (fila.numero_cama === numeroCama) {
        return { ...fila, nombre_paciente: sinNumeros };
      }
      return fila;
    }));
  };

  const handleCambiarSexo = (numeroCama, sexo) => {
    setDatosMatriz(datosMatriz.map(fila => {
      if (fila.numero_cama === numeroCama) {
        return { ...fila, sexo };
      }
      return fila;
    }));
  };

  const calcularTotalPorMedicamento = (idInsumo) => {
    if (!idInsumo || !datosMatriz) return 0;
    try {
      return datosMatriz.reduce((sum, fila) => {
        return sum + (parseFloat(fila?.medicamentos?.[idInsumo]) || 0);
      }, 0);
    } catch (err) {
      console.warn('Error al calcular total:', err);
      return 0;
    }
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
      datosMatriz.forEach(fila => {
        medicamentosColumnas.forEach(med => {
          const cantidad = fila.medicamentos[med.id_insumo];
          if (cantidad && cantidad > 0) {
            detalles.push({
              id_insumo_presentacion: med.id_insumo_presentacion,
              cantidad_solicitada: cantidad,
              numero_cama: fila.numero_cama,
              numero_expediente: fila.numero_expediente,
              nombre_paciente: fila.nombre_paciente,
              sexo: fila.sexo,
            });
          }
        });
      });

      if (detalles.length === 0) {
        setError('Ingrese al menos una cantidad de medicamento');
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

      console.log('📤 Payload being sent:', JSON.stringify(payload, null, 2));

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

        {/* Selector de medicamentos */}
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Medicamentos a Solicitar
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Autocomplete
              options={insumos}
              getOptionLabel={(option) => {
                const nombre = option.nombre || option.nombre_generico || 'Sin nombre';
                return nombre;
              }}
              onChange={(e, value) => handleAgregarMedicamento(value)}
              renderInput={(params) => (
                <TextField {...params} label="Buscar medicamento..." placeholder="Escriba para buscar" />
              )}
              isOptionEqualToValue={(option, value) => option.id_insumo === value?.id_insumo}
              noOptionsText={insumos.length === 0 ? "No hay medicamentos disponibles" : "No se encontraron resultados"}
              sx={{ flex: 1 }}
            />
          </Stack>

          <Box sx={{ mt: 2 }}>
            {medicamentosColumnas.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Agregue los medicamentos que desea solicitar
              </Typography>
            ) : (
              medicamentosColumnas.map((med) => (
                <Chip
                  key={med.id_insumo}
                  label={med.nombre || med.nombre_generico}
                  onDelete={() => handleEliminarMedicamento(med.id_insumo)}
                  color="primary"
                  variant="outlined"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))
            )}
          </Box>
        </Paper>

        {/* Matriz de requisición */}
        {medicamentosColumnas.length > 0 && (
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: 60 }}>CAMA</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 120 }}>EXPEDIENTE</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 190 }}>PACIENTE</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 80, textAlign: 'center' }}>SEXO</TableCell>
                  {medicamentosColumnas.map((med) => (
                    <TableCell key={med.id_insumo} align="center" sx={{ fontWeight: 'bold', minWidth: 100 }}>
                      {med.nombre || med.nombre_generico}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {datosMatriz.map((fila) => (
                  <TableRow key={fila.numero_cama}>
                    <TableCell sx={{ fontSize: '0.875rem' }}>{fila.numero_cama}</TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={fila.numero_expediente}
                        onChange={(e) => handleCambiarExpediente(fila.numero_cama, e.target.value)}
                        placeholder="Expediente"
                        inputProps={{ 
                          maxLength: 11,
                          style: { fontSize: '0.8rem' }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={fila.nombre_paciente}
                        onChange={(e) => handleCambiarNombrePaciente(fila.numero_cama, e.target.value)}
                        placeholder="Nombre"
                        inputProps={{
                          pattern: '[A-Za-záéíóúÁÉÍÓÚ\\s]*',
                          style: { fontSize: '0.8rem' }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ px: 0.5 }}>
                      <RadioGroup
                        row
                        value={fila.sexo}
                        onChange={(e) => handleCambiarSexo(fila.numero_cama, e.target.value)}
                        sx={{ justifyContent: 'center', gap: 0.5 }}
                      >
                        <FormControlLabel 
                          value="H" 
                          control={<Radio size="small" sx={{ p: 0.5 }} />} 
                          label="H" 
                          sx={{ 
                            mr: 1, 
                            '& .MuiFormControlLabel-label': { 
                              fontSize: '0.875rem',
                              ml: 0.3
                            } 
                          }}
                        />
                        <FormControlLabel 
                          value="M" 
                          control={<Radio size="small" sx={{ p: 0.5 }} />} 
                          label="M" 
                          sx={{ 
                            mr: 0, 
                            '& .MuiFormControlLabel-label': { 
                              fontSize: '0.875rem',
                              ml: 0.3
                            } 
                          }}
                        />
                      </RadioGroup>
                    </TableCell>
                    {medicamentosColumnas.map((med) => (
                      <TableCell key={med.id_insumo} align="center">
                        <TextField
                          type="number"
                          size="small"
                          value={fila.medicamentos[med.id_insumo] || ''}
                          onChange={(e) => handleCambiarCantidad(fila.numero_cama, med.id_insumo, e.target.value)}
                          inputProps={{ min: 0, step: 0.5, style: { textAlign: 'center' } }}
                          sx={{ width: 80 }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

                {/* Fila de totales */}
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell colSpan={4} sx={{ fontWeight: 'bold' }}>
                    TOTALES
                  </TableCell>
                  {medicamentosColumnas.map((med) => {
                    const total = calcularTotalPorMedicamento(med.id_insumo);
                    return (
                      <TableCell key={med.id_insumo} align="center" sx={{ fontWeight: 'bold' }}>
                        {(total || 0).toFixed(1)}
                      </TableCell>
                    );
                  })}
                </TableRow>
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
