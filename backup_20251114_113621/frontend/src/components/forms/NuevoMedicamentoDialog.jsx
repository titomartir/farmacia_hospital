import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Typography,
  Box
} from '@mui/material';
import { LocalPharmacy as LocalPharmacyIcon } from '@mui/icons-material';
import api from '../../services/api';

const NuevoMedicamentoDialog = ({ open, onClose, onMedicamentoCreado }) => {
  const [formData, setFormData] = useState({
    // Datos del insumo
    nombre: '',
    descripcion: '',
    id_unidad_medida: '',
    stock_minimo: '',
    // Datos de la presentación
    id_presentacion: '',
    cantidad_presentacion: ''
  });

  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [presentaciones, setPresentaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      cargarCatalogos();
    }
  }, [open]);

  const cargarCatalogos = async () => {
    try {
      setLoading(true);
      const [unidadesRes, presentacionesRes] = await Promise.all([
        api.get('/catalogos/unidades-medida'),
        api.get('/catalogos/presentaciones')
      ]);
      
      if (unidadesRes.data.success) {
        setUnidadesMedida(unidadesRes.data.data);
      }
      if (presentacionesRes.data.success) {
        setPresentaciones(presentacionesRes.data.data);
      }
    } catch (err) {
      console.error('Error cargando catálogos:', err);
      setError('Error al cargar los catálogos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validarFormulario = () => {
    if (!formData.nombre.trim()) {
      setError('El nombre del medicamento es obligatorio');
      return false;
    }
    if (!formData.id_unidad_medida) {
      setError('Debe seleccionar una unidad de medida');
      return false;
    }
    if (!formData.id_presentacion) {
      setError('Debe seleccionar una presentación');
      return false;
    }
    if (!formData.cantidad_presentacion || parseFloat(formData.cantidad_presentacion) <= 0) {
      setError('La cantidad por presentación debe ser mayor a cero');
      return false;
    }
    if (!formData.stock_minimo || parseInt(formData.stock_minimo) < 0) {
      setError('El stock mínimo no puede ser negativo');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) return;

    try {
      setLoading(true);
      setError(null);

      const payload = {
        // Datos del insumo
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        stock_minimo: parseInt(formData.stock_minimo) || 0,
        dias_alerta_vencimiento: 30,
        requiere_stock_24h: false,
        tipo_documento: 'RECETA',
        // Datos de la presentación
        id_presentacion: parseInt(formData.id_presentacion),
        id_unidad_medida: parseInt(formData.id_unidad_medida),
        cantidad_presentacion: parseFloat(formData.cantidad_presentacion),
        precio_unitario: 0,
        codigo_barras: null
      };

      const response = await api.post('/insumos/con-presentacion', payload);
      
      if (response.data.success) {
        // El backend devuelve { data: { insumo, id_insumo_presentacion } }
        const insumo = response.data.data.insumo;
        const idPresentacion = response.data.data.id_insumo_presentacion;
        
        // Llamar callback con los datos del nuevo medicamento
        // Incluir la presentación completa para el selector
        if (onMedicamentoCreado) {
          const medicamentoConPresentacion = {
            id_insumo_presentacion: idPresentacion,
            insumo: insumo,
            presentacion: presentaciones.find(p => p.id_presentacion === formData.id_presentacion),
            unidadMedida: unidadesMedida.find(u => u.id_unidad_medida === formData.id_unidad_medida),
            cantidad_presentacion: formData.cantidad_presentacion
          };
          onMedicamentoCreado(medicamentoConPresentacion);
        }
        handleCerrar();
      }
    } catch (err) {
      console.error('Error al crear medicamento:', err);
      setError(err.response?.data?.message || 'Error al registrar el medicamento');
    } finally {
      setLoading(false);
    }
  };

  const handleCerrar = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      id_unidad_medida: '',
      stock_minimo: '',
      id_presentacion: '',
      cantidad_presentacion: ''
    });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCerrar} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <LocalPharmacyIcon color="primary" />
          <Typography variant="h6">Registrar Nuevo Medicamento</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} />}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Datos del Medicamento
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Nombre del Medicamento"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="Ej: Paracetamol, Ibuprofeno, etc."
              helperText="Nombre genérico o comercial del medicamento"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Descripción"
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="Indicaciones, concentración, etc. (opcional)"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Unidad de Medida</InputLabel>
              <Select
                value={formData.id_unidad_medida}
                onChange={(e) => handleChange('id_unidad_medida', e.target.value)}
                label="Unidad de Medida"
              >
                {unidadesMedida.map(um => (
                  <MenuItem key={um.id_unidad_medida} value={um.id_unidad_medida}>
                    {um.nombre} ({um.abreviatura})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              type="number"
              label="Stock Mínimo"
              value={formData.stock_minimo}
              onChange={(e) => handleChange('stock_minimo', e.target.value)}
              inputProps={{ min: 0, step: 1 }}
              helperText="Cantidad mínima en inventario"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 2 }}>
              Datos de la Presentación
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Presentación</InputLabel>
              <Select
                value={formData.id_presentacion}
                onChange={(e) => handleChange('id_presentacion', e.target.value)}
                label="Presentación"
              >
                {presentaciones.map(p => (
                  <MenuItem key={p.id_presentacion} value={p.id_presentacion}>
                    {p.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              type="number"
              label="Cantidad por Presentación"
              value={formData.cantidad_presentacion}
              onChange={(e) => handleChange('cantidad_presentacion', e.target.value)}
              inputProps={{ min: 0, step: 1 }}
              helperText="Unidades en cada presentación"
            />
          </Grid>

          <Grid item xs={12}>
            <Alert severity="info" sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>Ejemplo:</strong> Si el medicamento es "Paracetamol" en presentación "Caja", 
                y cada caja contiene 100 tabletas, ingrese 100 en "Cantidad por Presentación".
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCerrar} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Registrar Medicamento'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NuevoMedicamentoDialog;
