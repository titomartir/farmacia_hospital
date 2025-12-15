const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { verificarToken } = require('../middleware/auth.middleware');
const { validarResultados } = require('../middleware/validate.middleware');

// Validaciones
const validacionLogin = [
  body('nombre_usuario').notEmpty().withMessage('El nombre de usuario es requerido'),
  body('password').notEmpty().withMessage('La contraseña es requerida')
];

const validacionCambiarPassword = [
  body('password_actual').notEmpty().withMessage('La contraseña actual es requerida'),
  body('password_nueva')
    .notEmpty().withMessage('La nueva contraseña es requerida')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
];

// Rutas públicas
router.post('/login', validacionLogin, validarResultados, authController.login);

// Rutas protegidas
router.get('/perfil', verificarToken, authController.obtenerPerfil);
router.get('/usuarios', verificarToken, authController.listarUsuarios);
router.post('/cambiar-password', verificarToken, validacionCambiarPassword, validarResultados, authController.cambiarPassword);
router.post('/logout', verificarToken, authController.logout);

// Rutas de administración de usuarios (solo admin)
router.post('/usuarios', verificarToken, authController.crearUsuario);
router.put('/usuarios/:id', verificarToken, authController.actualizarUsuario);
router.put('/usuarios/:id/password', verificarToken, authController.cambiarPasswordUsuario);
router.delete('/usuarios/:id', verificarToken, authController.eliminarUsuario);
router.put('/usuarios/:id/activar', verificarToken, authController.activarUsuario);

module.exports = router;
