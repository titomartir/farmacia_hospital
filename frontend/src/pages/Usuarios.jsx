import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress, Chip,
  Stack, alpha, useTheme, InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon,
  People as PeopleIcon, Lock as LockIcon,
} from '@mui/icons-material';
import api from '../services/api';

const Usuarios = () => {
  const theme = useTheme();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  
  // Estados para modales
  const [openCrear, setOpenCrear] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openCambiarPassword, setOpenCambiarPassword] = useState(false);
  const [openEliminar, setOpenEliminar] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  // Estados para formularios
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    contrasena: '',
    rol: 'asistente',
    tipo_turno: 'diurno',
    // Datos de personal
    nombres: '',
    apellidos: '',
    dpi: '',
    cargo: '',
    telefono: '',
    email: ''
  });
  const [nuevaContrasena, setNuevaContrasena] = useState('');

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/usuarios');
      if (response.data.success) {
        setUsuarios(response.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearUsuario = async () => {
    try {
      setLoading(true);
      const response = await api.post('/auth/usuarios', formData);
      if (response.data.success) {
        setSuccess('Usuario creado exitosamente');
        setOpenCrear(false);
        cargarUsuarios();
        resetForm();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleEditarUsuario = async () => {
    try {
      setLoading(true);
      const response = await api.put(`/auth/usuarios/${usuarioSeleccionado.id_usuario}`, {
        rol: formData.rol,
        tipo_turno: formData.tipo_turno,
      });
      if (response.data.success) {
        setSuccess('Usuario actualizado exitosamente');
        setOpenEditar(false);
        cargarUsuarios();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarPassword = async () => {
    try {
      setLoading(true);
      const response = await api.put(`/auth/usuarios/${usuarioSeleccionado.id_usuario}/password`, {
        nueva_contrasena: nuevaContrasena
      });
      if (response.data.success) {
        setSuccess('Contraseña actualizada exitosamente');
        setOpenCambiarPassword(false);
        setNuevaContrasena('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordUsuario = async (usuario) => {
    const confirmar = window.confirm(`¿Resetear la contraseña de ${usuario.nombre_usuario} a 'usuario'?`);
    if (!confirmar) return;
    try {
      setLoading(true);
      const response = await api.put(`/auth/usuarios/${usuario.id_usuario}/password`, {
        nueva_contrasena: 'usuario'
      });
      if (response.data.success) {
        setSuccess(`Contraseña de ${usuario.nombre_usuario} reseteada a 'usuario'`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al resetear contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarUsuario = async () => {
    try {
      setLoading(true);
      const response = await api.delete(`/auth/usuarios/${usuarioSeleccionado.id_usuario}`);
      if (response.data.success) {
        setSuccess('Usuario eliminado exitosamente');
        setOpenEliminar(false);
        cargarUsuarios();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleActivarUsuario = async (usuario) => {
    try {
      setLoading(true);
      const response = await api.put(`/auth/usuarios/${usuario.id_usuario}/activar`);
      if (response.data.success) {
        setSuccess('Usuario activado exitosamente');
        cargarUsuarios();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al activar usuario');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre_usuario: '',
      contrasena: '',
      rol: 'asistente',
      tipo_turno: 'diurno',
      nombres: '',
      apellidos: '',
      dpi: '',
      cargo: '',
      telefono: '',
      email: ''
    });
  };

  const abrirEditar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setFormData({
      rol: usuario.rol,
      tipo_turno: usuario.tipo_turno || 'diurno'
    });
    setOpenEditar(true);
  };

  const abrirCambiarPassword = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setOpenCambiarPassword(true);
  };

  const abrirEliminar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setOpenEliminar(true);
  };

  const usuariosFiltrados = usuarios.filter(usuario => {
    const coincideBusqueda = usuario.nombre_usuario?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideRol = filtroRol === '' || usuario.rol === filtroRol;
    return coincideBusqueda && coincideRol;
  });

  const getRolColor = (rol) => {
    const colores = {
      administrador: 'error',
      farmaceutico: 'primary',
      bodeguero: 'warning',
      turnista: 'info',
      asistente: 'secondary'
    };
    return colores[rol] || 'default';
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center' }}>
          <PeopleIcon sx={{ mr: 1 }} /> Administración de Usuarios
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gestión de usuarios del sistema
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      <Card elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Buscar usuario..."
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
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filtrar por Rol</InputLabel>
              <Select
                value={filtroRol}
                label="Filtrar por Rol"
                onChange={(e) => setFiltroRol(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="administrador">Administrador</MenuItem>
                <MenuItem value="farmaceutico">Farmacéutico</MenuItem>
                <MenuItem value="bodeguero">Bodeguero</MenuItem>
                <MenuItem value="turnista">Turnista</MenuItem>
                <MenuItem value="asistente">Asistente</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCrear(true)}
              sx={{ minWidth: 180 }}
            >
              Nuevo Usuario
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                <TableCell sx={{ fontWeight: 600 }}>Usuario</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Rol</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tipo Turno</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : usuariosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No se encontraron usuarios
                  </TableCell>
                </TableRow>
              ) : (
                usuariosFiltrados.map((usuario) => (
                  <TableRow key={usuario.id_usuario} hover>
                    <TableCell>{usuario.nombre_usuario}</TableCell>
                    <TableCell>
                      <Chip
                        label={usuario.rol}
                        color={getRolColor(usuario.rol)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{usuario.tipo_turno || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={usuario.estado ? 'Activo' : 'Inactivo'}
                        color={usuario.estado ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => abrirEditar(usuario)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => abrirCambiarPassword(usuario)}
                        color="warning"
                        title="Cambiar contraseña"
                      >
                        <LockIcon fontSize="small" />
                      </IconButton>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleResetPasswordUsuario(usuario)}
                        sx={{ ml: 1 }}
                      >
                        Reset 'usuario'
                      </Button>
                      {usuario.estado ? (
                        <IconButton
                          size="small"
                          onClick={() => abrirEliminar(usuario)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleActivarUsuario(usuario)}
                        >
                          Activar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Modal Crear Usuario */}
      <Dialog open={openCrear} onClose={() => setOpenCrear(false)} maxWidth="md" fullWidth>
        <DialogTitle>Crear Nuevo Usuario y Personal</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>Datos de Usuario</Typography>
            <TextField
              fullWidth
              label="Nombre de Usuario"
              value={formData.nombre_usuario}
              onChange={(e) => setFormData({ ...formData, nombre_usuario: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              value={formData.contrasena}
              onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={formData.rol}
                  label="Rol"
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                >
                  <MenuItem value="administrador">Administrador</MenuItem>
                  <MenuItem value="farmaceutico">Farmacéutico</MenuItem>
                  <MenuItem value="bodeguero">Bodeguero</MenuItem>
                  <MenuItem value="turnista">Turnista</MenuItem>
                  <MenuItem value="asistente">Asistente</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Tipo Turno</InputLabel>
                <Select
                  value={formData.tipo_turno}
                  label="Tipo Turno"
                  onChange={(e) => setFormData({ ...formData, tipo_turno: e.target.value })}
                >
                  <MenuItem value="24_horas">24 Horas</MenuItem>
                  <MenuItem value="diurno">Diurno</MenuItem>
                  <MenuItem value="nocturno">Nocturno</MenuItem>
                  <MenuItem value="administrativo">Administrativo</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, mt: 2 }}>Datos Personales</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Nombres"
                value={formData.nombres}
                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Apellidos"
                value={formData.apellidos}
                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                required
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="DPI"
                value={formData.dpi}
                onChange={(e) => setFormData({ ...formData, dpi: e.target.value })}
              />
              <TextField
                fullWidth
                label="Cargo"
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                required
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Teléfono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCrear(false)}>Cancelar</Button>
          <Button onClick={handleCrearUsuario} variant="contained">Crear Usuario y Personal</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Editar Usuario */}
      <Dialog open={openEditar} onClose={() => setOpenEditar(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Nombre de Usuario"
              value={usuarioSeleccionado?.nombre_usuario || ''}
              disabled
            />
            <FormControl fullWidth>
              <InputLabel>Rol</InputLabel>
              <Select
                value={formData.rol}
                label="Rol"
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
              >
                <MenuItem value="administrador">Administrador</MenuItem>
                <MenuItem value="farmaceutico">Farmacéutico</MenuItem>
                <MenuItem value="bodeguero">Bodeguero</MenuItem>
                <MenuItem value="turnista">Turnista</MenuItem>
                <MenuItem value="asistente">Asistente</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Tipo Turno</InputLabel>
              <Select
                value={formData.tipo_turno}
                label="Tipo Turno"
                onChange={(e) => setFormData({ ...formData, tipo_turno: e.target.value })}
              >
                <MenuItem value="24_horas">24 Horas</MenuItem>
                <MenuItem value="diurno">Diurno</MenuItem>
                <MenuItem value="nocturno">Nocturno</MenuItem>
                <MenuItem value="administrativo">Administrativo</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditar(false)}>Cancelar</Button>
          <Button onClick={handleEditarUsuario} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Cambiar Contraseña */}
      <Dialog open={openCambiarPassword} onClose={() => setOpenCambiarPassword(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Nombre de Usuario"
              value={usuarioSeleccionado?.nombre_usuario || ''}
              disabled
            />
            <TextField
              fullWidth
              label="Nueva Contraseña"
              type="password"
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCambiarPassword(false)}>Cancelar</Button>
          <Button onClick={handleCambiarPassword} variant="contained">Cambiar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Eliminar Usuario */}
      <Dialog open={openEliminar} onClose={() => setOpenEliminar(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea eliminar el usuario <strong>{usuarioSeleccionado?.nombre_usuario}</strong>?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEliminar(false)}>Cancelar</Button>
          <Button onClick={handleEliminarUsuario} variant="contained" color="error">Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Usuarios;
