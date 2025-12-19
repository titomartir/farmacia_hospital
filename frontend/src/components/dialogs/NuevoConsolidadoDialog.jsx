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
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import servicioService from '../../services/servicioService';
import insumoService from '../../services/insumoService';
import consolidadoService from '../../services/consolidadoService';
import { authService } from '../../services/authService';

const NuevoConsolidadoDialog = ({ open, onClose, onSuccess, consolidadoEditar = null }) => {
  const [servicios, setServicios] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [esEdicion, setEsEdicion] = useState(false);

  // Encabezado del consolidado
  const [formData, setFormData] = useState({
    id_servicio: '',
    fecha_consolidado: new Date().toISOString(),
    turno: 'diurno',
    encargado: '',
    observaciones: '',
  });

  // Medicamentos seleccionados (columnas)
  const [medicamentosColumnas, setMedicamentosColumnas] = useState([]);

  // Matriz de datos: 30 camas × medicamentos
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
      if (consolidadoEditar && consolidadoEditar.id_consolidado) {
        cargarConsolidadoParaEdicion();
      } else {
        resetForm();
      }
    }
  }, [open, consolidadoEditar?.id_consolidado]);

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
      console.log('Insumos cargados:', data);
      // Verificar la estructura de la respuesta
      const insumosArray = data.data || data;
      setInsumos(Array.isArray(insumosArray) ? insumosArray : []);
    } catch (err) {
      console.error('Error al cargar insumos:', err);
      setInsumos([]);
      setError('Error al cargar medicamentos');
    }
  };

  const resetForm = () => {
    const usuario = authService.getCurrentUser();
    setFormData({
      id_servicio: '',
      fecha_consolidado: new Date().toISOString(),
      turno: 'diurno',
      encargado: usuario?.nombre_completo || usuario?.nombre_usuario || '',
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

  const cargarConsolidadoParaEdicion = async () => {
    try {
      setLoading(true);
      const consolidado = await consolidadoService.obtenerConsolidado(consolidadoEditar.id_consolidado);
      console.log('📥 Consolidado cargado para edición:', consolidado);
      
      setFormData({
        id_servicio: consolidado.id_servicio || '',
        fecha_consolidado: consolidado.fecha_consolidado || new Date().toISOString(),
        turno: consolidado.turno || 'diurno',
        encargado: consolidado.encargado || '',
        observaciones: consolidado.observaciones || '',
      });

      // Reconstruir medicamentos y matriz desde detalles
      // Crear un mapa de id_insumo -> todas las presentaciones usadas
      const medicamentosMap = {};
      const datosMap = {};

      if (consolidado.detalles && consolidado.detalles.length > 0) {
        consolidado.detalles.forEach(detalle => {
          const insumoData = detalle.insumoPresentacion?.insumo;
          const presentacionData = detalle.insumoPresentacion?.presentacion;
          
          if (insumoData && insumoData.id_insumo) {
            // Almacenar cada medicamento con su presentación específica
            if (!medicamentosMap[insumoData.id_insumo]) {
              medicamentosMap[insumoData.id_insumo] = {
                id_insumo: insumoData.id_insumo,
                id_insumo_presentacion: detalle.id_insumo_presentacion,
                nombre: insumoData.nombre || '',
                presentacion: presentacionData?.nombre || '',
                presentaciones: detalle.insumoPresentacion ? [detalle.insumoPresentacion] : [],
                precio_unitario: detalle.precio_unitario || 0
              };
            }
          }

          const cama = detalle.numero_cama;
          const sexoNormalizado = detalle.sexo === 'H' ? 'M' : (detalle.sexo === 'F' ? 'F' : '');

          if (cama && !datosMap[cama]) {
            datosMap[cama] = {
              numero_cama: cama,
              numero_expediente: detalle.numero_registro || '',
              nombre_paciente: detalle.nombre_paciente || '',
              sexo: sexoNormalizado,
              medicamentos: {}
            };
          }
          
          if (cama && insumoData && insumoData.id_insumo) {
            datosMap[cama].medicamentos[insumoData.id_insumo] = detalle.cantidad;
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
      console.error('Error cargando consolidado:', err);
      setError('Error al cargar consolidado para editar');
      setEsEdicion(false);
      // Ensure datosMatriz is initialized even if load fails
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

    // Obtener la primera presentación disponible
    const presentacion = insumo.presentaciones && insumo.presentaciones.length > 0 
      ? insumo.presentaciones[0] 
      : null;
    
    if (!presentacion) {
      setError('Este medicamento no tiene presentaciones disponibles');
      return;
    }

    // Agregar insumo con datos de presentación
    setMedicamentosColumnas([...medicamentosColumnas, {
      ...insumo,
      id_insumo_presentacion: presentacion.id_insumo_presentacion,
      precio_unitario: presentacion.precio_unitario || 0
    }]);
    setError('');
  };

  const handleEliminarMedicamento = (id_insumo) => {
    setMedicamentosColumnas(medicamentosColumnas.filter(m => m.id_insumo !== id_insumo));
    
    // Limpiar datos de ese medicamento en la matriz
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

  const handleCambiarSexo = (numeroCama, sexo) => {
    setDatosMatriz(datosMatriz.map(fila => {
      if (fila.numero_cama === numeroCama) {
        return { ...fila, sexo: sexo };
      }
      return fila;
    }));
  };

  const calcularTotalPorMedicamento = (idInsumo) => {
    if (!idInsumo || !datosMatriz) {
      console.warn('calcularTotalPorMedicamento: idInsumo o datosMatriz faltando', { idInsumo, datosMatriz: !!datosMatriz });
      return 0;
    }
    try {
      const total = datosMatriz.reduce((sum, fila) => {
        return sum + (parseFloat(fila?.medicamentos?.[idInsumo]) || 0);
      }, 0);
      return isNaN(total) ? 0 : total;
    } catch (err) {
      console.error('Error calculando total:', err);
      return 0;
    }
  };

  const handleGuardar = async () => {
    try {
      setLoading(true);
      setError('');

      // Validaciones
      if (!formData.id_servicio) {
        setError('Debe seleccionar un servicio');
        return;
      }
      if (!formData.encargado.trim()) {
        setError('Debe ingresar el nombre del encargado');
        return;
      }
      if (medicamentosColumnas.length === 0) {
        setError('Debe agregar al menos un medicamento');
        return;
      }

      // Validar sexo obligatorio en filas con pacientes y cantidades
      for (const fila of datosMatriz) {
        if (fila.nombre_paciente.trim()) {
          const tieneCantidad = medicamentosColumnas.some(med => {
            const cantidad = fila.medicamentos?.[med.id_insumo];
            return cantidad && parseFloat(cantidad) > 0;
          });

          if (tieneCantidad && (!fila.sexo || !['M', 'F'].includes(fila.sexo))) {
            setError(`Debe seleccionar sexo (M/F) para la cama ${fila.numero_cama}`);
            return;
          }
        }
      }

      // Construir detalles para el backend
      const detalles = [];
      datosMatriz.forEach(fila => {
        if (fila.nombre_paciente.trim()) {
          medicamentosColumnas.forEach(med => {
            const cantidad = fila.medicamentos[med.id_insumo] || 0;
            if (cantidad > 0) {
              detalles.push({
                numero_cama: fila.numero_cama,
                numero_registro: fila.numero_expediente || '',
                nombre_paciente: fila.nombre_paciente,
                sexo: fila.sexo,
                id_insumo_presentacion: med.id_insumo_presentacion || med.id_insumo,
                cantidad: parseFloat(cantidad),
                precio_unitario: med.precio_unitario || 0,
                observaciones: ''
              });
            }
          });
        }
      });

      if (detalles.length === 0) {
        setError('Debe ingresar al menos una administración de medicamento');
        return;
      }

      const data = {
        ...formData,
        detalles,
      };

      console.log('📤 Enviando datos al backend:', data);
      console.log('💊 Medicamentos columnas:', medicamentosColumnas);
      console.log('📋 Detalles siendo enviados:', detalles);

      if (esEdicion && consolidadoEditar) {
        await consolidadoService.actualizarConsolidado(consolidadoEditar.id_consolidado, data);
      } else {
        await consolidadoService.crearConsolidado(data);
      }
      onSuccess();
    } catch (err) {
      setError(err.message || `Error al ${esEdicion ? 'actualizar' : 'crear'} consolidado`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>{esEdicion ? 'Editar Consolidado de Medicamentos' : 'Nuevo Consolidado de Medicamentos'}</DialogTitle>
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
                value={formData.fecha_consolidado ? formData.fecha_consolidado.slice(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, fecha_consolidado: new Date(e.target.value).toISOString() })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Turno"
                value={formData.turno}
                onChange={(e) => setFormData({ ...formData, turno: e.target.value })}
                required
              >
                <MenuItem value="diurno">Diurno</MenuItem>
                <MenuItem value="nocturno">Nocturno (24h)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Encargado"
                value={formData.encargado}
                onChange={(e) => setFormData({ ...formData, encargado: e.target.value })}
                placeholder="Nombre del encargado"
                required
              />
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
            Medicamentos a Administrar
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
                Agregue los medicamentos que se van a administrar
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

        {/* Matriz de administración */}
        {medicamentosColumnas.length > 0 && (
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: 60 }}>Cama</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 120 }}>Expediente</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 190 }}>Paciente</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 80, textAlign: 'center' }}>Sexo</TableCell>
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
                          value="M" 
                          control={<Radio size="small" sx={{ p: 0.5 }} />} 
                          label="M" 
                          sx={{ 
                            mr: 1, 
                            '& .MuiFormControlLabel-label': { 
                              fontSize: '0.875rem',
                              ml: 0.3
                            } 
                          }}
                        />
                        <FormControlLabel 
                          value="F" 
                          control={<Radio size="small" sx={{ p: 0.5 }} />} 
                          label="F" 
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
          variant="contained"
          onClick={handleGuardar}
          disabled={loading}
          startIcon={<SaveIcon />}
        >
          {loading ? (esEdicion ? 'Actualizando...' : 'Guardando...') : (esEdicion ? 'Actualizar Consolidado' : 'Guardar Consolidado')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NuevoConsolidadoDialog;
