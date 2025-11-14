require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/database');
const logger = require('./config/logger');
const routes = require('./routes');
const { errorHandler } = require('./middleware/error.middleware');
const notFound = require('./middleware/notFound.middleware');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// MIDDLEWARES
// ============================================================================

// Seguridad
app.use(helmet());

// CORS - Permitir múltiples orígenes para desarrollo
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 peticiones por IP
  message: 'Demasiadas peticiones desde esta IP, por favor intente más tarde.'
});
app.use('/api/', limiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger HTTP
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// ============================================================================
// RUTAS
// ============================================================================

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API del Sistema de Gestión de Farmacia',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Rutas de la API
app.use('/api', routes);

// ============================================================================
// MANEJO DE ERRORES
// ============================================================================

// Ruta no encontrada
app.use(notFound);

// Error handler
app.use(errorHandler);

// ============================================================================
// INICIAR SERVIDOR
// ============================================================================

const iniciarServidor = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info('═══════════════════════════════════════════════════');
      logger.info(`🚀 Servidor iniciado en http://localhost:${PORT}`);
      logger.info(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 API: http://localhost:${PORT}/api`);
      logger.info('═══════════════════════════════════════════════════');
    });
  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION!', err);
  // No apagar el servidor en desarrollo
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION!', err);
  // No apagar el servidor en desarrollo
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Iniciar
iniciarServidor();

module.exports = app;
