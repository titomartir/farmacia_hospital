import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Autocomplete,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon
} from '@mui/icons-material';
import api from '../services/api';

const Compras = () => {
  const [ingresos, setIngresos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [insumosPresentaciones, setInsumosPresentaciones] = useState([]);
  const [presentaciones, setPresentaciones] = useState([]);
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedIngreso, setSelectedIngreso] = useState(null);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    tipo_ingreso: 'COMPRA',
    id_proveedor: null,
    numero_factura: '',
    fecha_ingreso: new Date().toISOString().split('T')[0],
    observaciones: '',
    detalles: []
  });

  // Estado para nuevo detalle
  const [nuevoDetalle, setNuevoDetalle] = useState({
    id_insumo_presentacion: null,
    registrar_nuevo_insumo: false,
    nombre_insumo: '',
    id_presentacion: null,
    id_unidad_medida: null,
    cantidad: '',
    precio_unitario: '',
    numero_lote: '',
    fecha_vencimiento: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [ingresosRes, provRes, insPresRes, presRes, unidRes] = await Promise.all([
        api.get('/ingresos'),
        api.get('/proveedores').catch(() => ({ data: { data: [] } })),
        api.get('/insumos').catch(() => ({ data: { data: [] } })),
        api.get('/catalogos/presentaciones').catch(() => ({ data: { data: [] } })),
        api.get('/catalogos/unidades-medida').catch(() => ({ data: { data: [] } }))
      ]);

      if (ingresosRes.data.success) setIngresos(ingresosRes.data.data);
      if (provRes.data.success) setProveedores(provRes.data.data);
      if (insPresRes.data.success) setInsumosPresentaciones(insPresRes.data.data);
      if (presRes.data.success) setPresentaciones(presRes.data.data);
      if (unidRes.data.success) setUnidadesMedida(unidRes.data.data);
    } catch (err) {
      setError('Error al cargar datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarDetalle = () => {
    if (nuevoDetalle.registrar_nuevo_insumo) {
      if (!nuevoDetalle.nombre_insumo || !nuevoDetalle.id_presentacion || !nuevoDetalle.id_unidad_medida) {
        setError('Complete todos los campos del nuevo insumo');
        return;
      }
    } else {
      if (!nuevoDetalle.id_insumo_presentacion) {
        setError('Seleccione un insumo');
        return;
      }
    }

    if (!nuevoDetalle.cantidad || !nuevoDetalle.precio_unitario || !nuevoDetalle.numero_lote) {
      setError('Complete todos los campos requeridos');
      return;
    }

    setFormData({
      ...formData,
      detalles: [...formData.detalles, { ...nuevoDetalle }]
    });

    setNuevoDetalle({
      id_insumo_presentacion: null,
      registrar_nuevo_insumo: false,
      nombre_insumo: '',
      id_presentacion: null,
      id_unidad_medida: null,
      cantidad: '',
      precio_unitario: '',
      numero_lote: '',
      fecha_vencimiento: ''
    });
  };

  const handleEliminarDetalle = (index) => {
    setFormData({
      ...formData,
      detalles: formData.detalles.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.detalles.length === 0) {
      setError('Debe agregar al menos un medicamento');
      return;
    }

    if (formData.tipo_ingreso === 'COMPRA' && !formData.id_proveedor) {
      setError('Seleccione un proveedor');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.post('/ingresos', formData);
      
      // Resetear formulario
      setFormData({
        tipo_ingreso: 'COMPRA',
        id_proveedor: null,
        numero_factura: '',
        fecha_ingreso: new Date().toISOString().split('T')[0],
        observaciones: '',
        detalles: []
      });

      cargarDatos();
      setTabValue(1); // Cambiar a pestaña de listado
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar ingreso');
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = (ingreso) => {
    setSelectedIngreso(ingreso);
    setOpenDialog(true);
  };

  const calcularTotal = () => {
    return formData.detalles.reduce((sum, det) => 
      sum + (parseFloat(det.cantidad || 0) * parseFloat(det.precio_unitario || 0)), 0
    );
  };

  const getEstadoColor = (estado) => {
    return estado === 'COMPLETADO' ? 'success' : estado === 'ANULADO' ? 'error' : 'default';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gestión de Compras e Ingresos
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label="Nueva Compra" icon={<ShoppingCartIcon />} />
        <Tab label="Historial" icon={<LocalShippingIcon />} />
      </Tabs>

      {/* PESTAÑA: NUEVA COMPRA */}
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Tipo de Ingreso"
                    value={formData.tipo_ingreso}
                    onChange={(e) => setFormData({ ...formData, tipo_ingreso: e.target.value })}
                  >
                    <MenuItem value="COMPRA">Compra</MenuItem>
                    <MenuItem value="DEVOLUCION">Devolución</MenuItem>
                  </TextField>
                </Grid>

                {formData.tipo_ingreso === 'COMPRA' && (
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      options={proveedores}
                      getOptionLabel={(option) => option.nombre || ''}
                      value={proveedores.find(p => p.id_proveedor === formData.id_proveedor) || null}
                      onChange={(e, value) => setFormData({ ...formData, id_proveedor: value?.id_proveedor || null })}
                      renderInput={(params) => <TextField {...params} label="Proveedor *" />}
                    />
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Número de Factura"
                    value={formData.numero_factura}
                    onChange={(e) => setFormData({ ...formData, numero_factura: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha"
                    value={formData.fecha_ingreso}
                    onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
                    InputLabelProps={{ shrink: true }}
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

              {/* AGREGAR MEDICAMENTOS */}
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Agregar Medicamento
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="¿Medicamento nuevo?"
                      value={nuevoDetalle.registrar_nuevo_insumo}
                      onChange={(e) => setNuevoDetalle({ ...nuevoDetalle, registrar_nuevo_insumo: e.target.value === 'true' })}
                    >
                      <MenuItem value={false}>No, seleccionar existente</MenuItem>
                      <MenuItem value={true}>Sí, registrar nuevo</MenuItem>
                    </TextField>
                  </Grid>

                  {nuevoDetalle.registrar_nuevo_insumo ? (
                    <>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Nombre del Medicamento *"
                          value={nuevoDetalle.nombre_insumo}
                          onChange={(e) => setNuevoDetalle({ ...nuevoDetalle, nombre_insumo: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Autocomplete
                          options={presentaciones}
                          getOptionLabel={(option) => option.nombre || ''}
                          value={presentaciones.find(p => p.id_presentacion === nuevoDetalle.id_presentacion) || null}
                          onChange={(e, value) => setNuevoDetalle({ ...nuevoDetalle, id_presentacion: value?.id_presentacion || null })}
                          renderInput={(params) => <TextField {...params} label="Presentación *" />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Autocomplete
                          options={unidadesMedida}
                          getOptionLabel={(option) => option.nombre || ''}
                          value={unidadesMedida.find(u => u.id_unidad_medida === nuevoDetalle.id_unidad_medida) || null}
                          onChange={(e, value) => setNuevoDetalle({ ...nuevoDetalle, id_unidad_medida: value?.id_unidad_medida || null })}
                          renderInput={(params) => <TextField {...params} label="Unidad *" />}
                        />
                      </Grid>
                    </>
                  ) : (
                    <Grid item xs={12}>
                      <Autocomplete
                        options={insumosPresentaciones}
                        getOptionLabel={(option) => option.nombre || `Insumo ${option.id_insumo}`}
                        value={insumosPresentaciones.find(ip => ip.id_insumo === nuevoDetalle.id_insumo_presentacion) || null}
                        onChange={(e, value) => setNuevoDetalle({ ...nuevoDetalle, id_insumo_presentacion: value?.id_insumo || null })}
                        renderInput={(params) => <TextField {...params} label="Medicamento *" />}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Cantidad *"
                      value={nuevoDetalle.cantidad}
                      onChange={(e) => setNuevoDetalle({ ...nuevoDetalle, cantidad: e.target.value })}
                    />
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Precio Unitario *"
                      value={nuevoDetalle.precio_unitario}
                      onChange={(e) => setNuevoDetalle({ ...nuevoDetalle, precio_unitario: e.target.value })}
                    />
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Número de Lote *"
                      value={nuevoDetalle.numero_lote}
                      onChange={(e) => setNuevoDetalle({ ...nuevoDetalle, numero_lote: e.target.value })}
                    />
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Fecha Vencimiento"
                      value={nuevoDetalle.fecha_vencimiento}
                      onChange={(e) => setNuevoDetalle({ ...nuevoDetalle, fecha_vencimiento: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleAgregarDetalle}
                      fullWidth
                    >
                      Agregar a la Lista
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {/* LISTA DE MEDICAMENTOS */}
              {formData.detalles.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Medicamentos Agregados ({formData.detalles.length})
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Medicamento</TableCell>
                          <TableCell align="right">Cantidad</TableCell>
                          <TableCell align="right">Precio Unit.</TableCell>
                          <TableCell align="right">Subtotal</TableCell>
                          <TableCell>Lote</TableCell>
                          <TableCell align="center">Acción</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formData.detalles.map((det, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {det.registrar_nuevo_insumo ? det.nombre_insumo : 
                                insumosPresentaciones.find(ip => ip.id_insumo === det.id_insumo_presentacion)?.nombre || 'N/A'}
                            </TableCell>
                            <TableCell align="right">{det.cantidad}</TableCell>
                            <TableCell align="right">Q{parseFloat(det.precio_unitario).toFixed(2)}</TableCell>
                            <TableCell align="right">
                              Q{(parseFloat(det.cantidad) * parseFloat(det.precio_unitario)).toFixed(2)}
                            </TableCell>
                            <TableCell>{det.numero_lote}</TableCell>
                            <TableCell align="center">
                              <IconButton size="small" color="error" onClick={() => handleEliminarDetalle(index)}>
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} align="right"><strong>TOTAL:</strong></TableCell>
                          <TableCell align="right">
                            <strong>Q{calcularTotal().toFixed(2)}</strong>
                          </TableCell>
                          <TableCell colSpan={2}></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || formData.detalles.length === 0}
                  startIcon={loading ? <CircularProgress size={20} /> : <ShoppingCartIcon />}
                >
                  {loading ? 'Registrando...' : 'Registrar Ingreso'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      )}

      {/* PESTAÑA: HISTORIAL */}
      {tabValue === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Proveedor</TableCell>
                <TableCell>Factura</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : ingresos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No hay ingresos registrados
                  </TableCell>
                </TableRow>
              ) : (
                ingresos.map((ingreso) => (
                  <TableRow key={ingreso.id_ingreso}>
                    <TableCell>{ingreso.id_ingreso}</TableCell>
                    <TableCell>
                      {ingreso.fecha_ingreso ? new Date(ingreso.fecha_ingreso).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={ingreso.tipo_ingreso} 
                        color={ingreso.tipo_ingreso === 'COMPRA' ? 'primary' : 'secondary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{ingreso.proveedor?.nombre || '-'}</TableCell>
                    <TableCell>{ingreso.numero_factura || '-'}</TableCell>
                    <TableCell align="right">Q{parseFloat(ingreso.costo_total || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={ingreso.estado}
                        color={getEstadoColor(ingreso.estado)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary" onClick={() => handleVerDetalle(ingreso)}>
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* DIALOG: DETALLE */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Detalle de Ingreso #{selectedIngreso?.id_ingreso}
        </DialogTitle>
        <DialogContent>
          {selectedIngreso && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">Tipo</Typography>
                <Chip label={selectedIngreso.tipo_ingreso} size="small" />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">Estado</Typography>
                <Chip label={selectedIngreso.estado} color={getEstadoColor(selectedIngreso.estado)} size="small" />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Proveedor</Typography>
                <Typography>{selectedIngreso.proveedor?.nombre || '-'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Medicamentos</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Medicamento</TableCell>
                        <TableCell align="right">Cantidad</TableCell>
                        <TableCell align="right">Precio</TableCell>
                        <TableCell align="right">Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedIngreso.detalles?.map((det, index) => (
                        <TableRow key={index}>
                          <TableCell>{det.insumoPresentacion?.insumo?.nombre || 'N/A'}</TableCell>
                          <TableCell align="right">{det.cantidad}</TableCell>
                          <TableCell align="right">Q{parseFloat(det.precio_unitario).toFixed(2)}</TableCell>
                          <TableCell align="right">Q{parseFloat(det.subtotal).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Compras;
