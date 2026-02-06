import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Divider,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Inventory,
  LocalShipping,
  Assessment,
  AccountCircle,
  Logout,
  Inventory2 as Inventory2Icon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  Warehouse as WarehouseIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { toggleSidebar } from '../../redux/slices/uiSlice';
import { logout } from '../../redux/slices/authSlice';

const drawerWidth = 260;


// Definición de módulos por rol
const modulesByRole = {
  administrador: [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Medicamentos', icon: <Inventory />, path: '/insumos' },
    { text: 'Ingresos', icon: <LocalShipping />, path: '/ingresos' },
    { text: 'Stock 24h', icon: <Inventory2Icon />, path: '/stock-24h' },
    { text: 'Requisiciones', icon: <AssignmentIcon />, path: '/requisiciones' },
    { text: 'Consolidados', icon: <DescriptionIcon />, path: '/consolidados' },
    { text: 'Inventario Total', icon: <WarehouseIcon />, path: '/inventario-total' },
    { text: 'Reportes', icon: <Assessment />, path: '/reportes' },
    { text: 'Usuarios', icon: <PeopleIcon />, path: '/usuarios' },
  ],
  asistente: [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Medicamentos', icon: <Inventory />, path: '/insumos' },
    { text: 'Ingresos', icon: <LocalShipping />, path: '/ingresos' },
    { text: 'Stock 24h', icon: <Inventory2Icon />, path: '/stock-24h' },
    { text: 'Requisiciones', icon: <AssignmentIcon />, path: '/requisiciones' },
    { text: 'Consolidados', icon: <DescriptionIcon />, path: '/consolidados' },
    { text: 'Inventario Total', icon: <WarehouseIcon />, path: '/inventario-total' },
    { text: 'Reportes', icon: <Assessment />, path: '/reportes' },
  ],
  bodeguero: [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Medicamentos', icon: <Inventory />, path: '/insumos' },
    { text: 'Ingresos', icon: <LocalShipping />, path: '/ingresos' },
    { text: 'Stock 24h', icon: <Inventory2Icon />, path: '/stock-24h' },
    { text: 'Requisiciones', icon: <AssignmentIcon />, path: '/requisiciones' },
    { text: 'Consolidados', icon: <DescriptionIcon />, path: '/consolidados' },
    { text: 'Inventario Total', icon: <WarehouseIcon />, path: '/inventario-total' },
    { text: 'Reportes', icon: <Assessment />, path: '/reportes' },
  ],
  farmaceutico: [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Stock 24h', icon: <Inventory2Icon />, path: '/stock-24h' },
    { text: 'Requisiciones', icon: <AssignmentIcon />, path: '/requisiciones' },
    { text: 'Consolidados', icon: <DescriptionIcon />, path: '/consolidados' },
    { text: 'Inventario Total', icon: <WarehouseIcon />, path: '/inventario-total' },
    { text: 'Reportes', icon: <Assessment />, path: '/reportes' },
  ],
  turnista: [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Stock 24h', icon: <Inventory2Icon />, path: '/stock-24h' },
    { text: 'Requisiciones', icon: <AssignmentIcon />, path: '/requisiciones' },
    { text: 'Consolidados', icon: <DescriptionIcon />, path: '/consolidados' },
    { text: 'Inventario Total', icon: <WarehouseIcon />, path: '/inventario-total' },
    { text: 'Reportes', icon: <Assessment />, path: '/reportes' },
  ],
};

const Layout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { usuario } = useSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    dispatch(toggleSidebar());
  };

  const handleMenuClick = (path) => {
    navigate(path);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'white',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) },
              }}
            >
              <MenuIcon />
            </IconButton>
            <Box
              component="img"
              src="/hospital-logo.svg"
              alt="Logo del hospital"
              sx={{
                width: 36,
                height: 36,
                objectFit: 'contain',
              }}
            />
            <Box>
              <Typography 
                variant="h6" 
                noWrap 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Sistema de Farmacia
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Gestión de Medicamentos
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {usuario?.nombre_usuario}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {usuario?.rol?.nombre_rol}
              </Typography>
            </Box>
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) },
              }}
            >
              <AccountCircle sx={{ fontSize: 28 }} />
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              elevation: 3,
              sx: { mt: 1.5, minWidth: 200, borderRadius: 2 },
            }}
          >
            <MenuItem disabled sx={{ opacity: 1 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {usuario?.nombre_usuario}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {usuario?.rol?.nombre_rol}
                </Typography>
              </Box>
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main', gap: 1 }}>
              <Logout fontSize="small" />
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant="persistent"
        open={sidebarOpen}
        sx={{
          width: sidebarOpen ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: 'none',
            background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', py: 2, px: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 1,
              py: 1.2,
              mb: 2,
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.12)',
            }}
          >
            <Box
              component="img"
              src="/hospital-logo.svg"
              alt="Logo del hospital"
              sx={{
                width: 40,
                height: 40,
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))',
              }}
            />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Sistema de Farmacia
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Hospital
              </Typography>
            </Box>
          </Box>
          <List sx={{ gap: 0.5, display: 'flex', flexDirection: 'column' }}>
            {(modulesByRole[usuario?.rol] || []).map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => handleMenuClick(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    py: 1.5,
                    color: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      color: 'white',
                      transform: 'translateX(4px)',
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: 500,
                      fontSize: '0.95rem',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content - SIN MARGEN IZQUIERDO */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          minHeight: '100vh',
          bgcolor: '#f8f9fa',
          // NO marginLeft aquí
        }}
      >
        <Toolbar />
        <Box className="print-header">
          <Box
            component="img"
            src="/hospital-logo.svg"
            alt="Logo del hospital"
            sx={{ width: 54, height: 54, objectFit: 'contain' }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Sistema de Farmacia
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hospital
            </Typography>
          </Box>
        </Box>
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;