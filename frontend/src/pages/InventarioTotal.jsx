import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon, Inventory as InventoryIcon } from '@mui/icons-material';
import axios from 'axios';

const InventarioTotal = () => {
  const [inventario, setInventario] = useState([]);
  const [filtrado, setFiltrado] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarInventario();
  }, []);

  useEffect(() => {
    if (busqueda.trim() === '') {
      setFiltrado(inventario);
    } else {
      const termino = busqueda.toLowerCase();
      const resultados = inventario.filter(item => 
        item.insumo.nombre.toLowerCase().includes(termino) ||
        item.insumo.descripcion?.toLowerCase().includes(termino) ||
        item.presentacion.nombre.toLowerCase().includes(termino)
      );
      setFiltrado(resultados);
    }
  }, [busqueda, inventario]);

  const cargarInventario = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/insumos/inventario/total', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setInventario(response.data.data);
        setFiltrado(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  const getStockColor = (stockTotal) => {
    if (stockTotal === 0) return 'error';
    if (stockTotal < 10) return 'warning';
    return 'success';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <InventoryIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Inventario Total
        </Typography>
      </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <TextField
              fullWidth
              placeholder="Buscar medicamento..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </CardContent>
        </Card>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Medicamento</strong></TableCell>
                  <TableCell><strong>Presentación</strong></TableCell>
                  <TableCell><strong>Clasificación</strong></TableCell>
                  <TableCell align="right"><strong>Bodega General</strong></TableCell>
                  <TableCell align="right"><strong>Stock 24h</strong></TableCell>
                  <TableCell align="right"><strong>Total</strong></TableCell>
                  <TableCell align="center"><strong>Estado</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtrado.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No se encontraron medicamentos
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtrado.map((item) => (
                    <TableRow key={item.id_insumo_presentacion} hover>
                      <TableCell>{item.insumo.nombre}</TableCell>
                      <TableCell>
                        {item.presentacion.nombre}
                        {' '}
                        ({item.unidadMedida.abreviatura})
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" display="block">
                          {item.insumo.clasificacion}
                        </Typography>
                        {item.insumo.subclasificacion && (
                          <Typography variant="caption" color="text.secondary">
                            {item.insumo.subclasificacion}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {item.stock_general}
                      </TableCell>
                      <TableCell align="right">
                        {item.tiene_stock_24h ? (
                          <Chip 
                            label={item.stock_24h} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <strong>{item.stock_total}</strong>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={
                            item.stock_total === 0
                              ? 'Sin Stock'
                              : item.stock_total < 10
                              ? 'Bajo'
                              : 'Disponible'
                          }
                          color={getStockColor(item.stock_total)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!loading && filtrado.length > 0 && (
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              Total de medicamentos: {filtrado.length}
            </Typography>
          </Box>
        )}
    </Box>
  );
};

export default InventarioTotal;
