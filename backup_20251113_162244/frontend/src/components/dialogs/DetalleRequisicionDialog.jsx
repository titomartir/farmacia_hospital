import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import { Print as PrintIcon } from '@mui/icons-material';

const DetalleRequisicionDialog = ({ open, requisicion, onClose }) => {
  if (!requisicion) return null;

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: 'warning',
      aprobada: 'info',
      entregada: 'success',
      rechazada: 'error',
    };
    return colores[estado] || 'default';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Requisición #{requisicion.id_requisicion}
        <Chip
          label={requisicion.estado}
          color={getEstadoColor(requisicion.estado)}
          size="small"
          sx={{ ml: 2 }}
        />
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Información General
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Servicio:</strong> {requisicion.servicio?.nombre_servicio}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Fecha y Hora Solicitud:</strong>{' '}
            {new Date(requisicion.fecha_solicitud).toLocaleString('es-GT', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Prioridad:</strong>{' '}
            <Chip label={requisicion.prioridad} size="small" />
          </Typography>
          {requisicion.observaciones && (
            <Typography variant="body2" color="text.secondary">
              <strong>Observaciones:</strong> {requisicion.observaciones}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Personal
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Solicitante:</strong>{' '}
            {requisicion.usuarioSolicita?.personal?.nombres}{' '}
            {requisicion.usuarioSolicita?.personal?.apellidos}
          </Typography>
          {requisicion.usuarioAutoriza && (
            <>
              <Typography variant="body2" color="text.secondary">
                <strong>Autorizado por:</strong>{' '}
                {requisicion.usuarioAutoriza?.personal?.nombres}{' '}
                {requisicion.usuarioAutoriza?.personal?.apellidos}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Fecha y Hora Autorización:</strong>{' '}
                {new Date(requisicion.fecha_autorizacion).toLocaleString('es-GT', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </>
          )}
          {requisicion.usuarioEntrega && (
            <>
              <Typography variant="body2" color="text.secondary">
                <strong>Entregado por:</strong>{' '}
                {requisicion.usuarioEntrega?.personal?.nombres}{' '}
                {requisicion.usuarioEntrega?.personal?.apellidos}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Fecha y Hora Entrega:</strong>{' '}
                {new Date(requisicion.fecha_entrega).toLocaleString('es-GT', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Detalles de Medicamentos
        </Typography>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Medicamento</TableCell>
                <TableCell>Presentación</TableCell>
                <TableCell align="right">Solicitado</TableCell>
                {requisicion.estado !== 'pendiente' && (
                  <TableCell align="right">Autorizado</TableCell>
                )}
                {requisicion.estado === 'entregada' && (
                  <>
                    <TableCell align="right">Entregado</TableCell>
                    <TableCell align="right">Precio Unit.</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {requisicion.detalles?.map((detalle, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {detalle.insumoPresentacion?.insumo?.nombre_generico || '-'}
                  </TableCell>
                  <TableCell>
                    {detalle.insumoPresentacion?.presentacion
                      ?.nombre_presentacion || '-'}
                  </TableCell>
                  <TableCell align="right">
                    {detalle.cantidad_solicitada}
                  </TableCell>
                  {requisicion.estado !== 'pendiente' && (
                    <TableCell align="right">
                      {detalle.cantidad_autorizada || 0}
                    </TableCell>
                  )}
                  {requisicion.estado === 'entregada' && (
                    <>
                      <TableCell align="right">
                        {detalle.cantidad_entregada || 0}
                      </TableCell>
                      <TableCell align="right">
                        Q{(detalle.precio_unitario || 0).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        Q
                        {(
                          (detalle.cantidad_entregada || 0) *
                          (detalle.precio_unitario || 0)
                        ).toFixed(2)}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {requisicion.estado === 'entregada' && (
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Typography variant="h6">
              Total: Q
              {requisicion.detalles
                ?.reduce(
                  (sum, d) =>
                    sum +
                    (d.cantidad_entregada || 0) * (d.precio_unitario || 0),
                  0
                )
                .toFixed(2)}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button 
          startIcon={<PrintIcon />}
          onClick={() => window.print()}
          variant="outlined"
        >
          Imprimir
        </Button>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DetalleRequisicionDialog;
