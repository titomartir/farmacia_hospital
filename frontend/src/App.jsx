import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import store from './redux/store';
import theme from './styles/theme';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Insumos from './pages/Insumos';
import Ingresos from './pages/Ingresos';
import Stock24h from './pages/Stock24h';
import Requisiciones from './pages/Requisiciones';
import Consolidados from './pages/Consolidados';
import Compras from './pages/Compras';
import Reportes from './pages/Reportes';
import InventarioTotal from './pages/InventarioTotal';
import Usuarios from './pages/Usuarios';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="insumos" element={<Insumos />} />
              <Route path="ingresos" element={<Ingresos />} />
              <Route path="stock-24h" element={<Stock24h />} />
              <Route path="requisiciones" element={<Requisiciones />} />
              <Route path="consolidados" element={<Consolidados />} />
              <Route path="compras" element={<Compras />} />
              <Route path="reportes" element={<Reportes />} />
              <Route path="inventario-total" element={<InventarioTotal />} />
              <Route path="usuarios" element={<Usuarios />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
