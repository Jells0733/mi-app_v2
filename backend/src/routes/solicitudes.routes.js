const express = require('express');
const router = express.Router();

const {
  getSolicitudes,
  createSolicitud,
  deleteSolicitud,
  putSolicitud
} = require('../controllers/solicitudes.controller');

const {
  authenticateToken,
  authorizeRole
} = require('../middlewares/auth.middleware');

// Obtener todas las solicitudes (usuarios autenticados)
router.get('/', authenticateToken, getSolicitudes);

// Crear solicitud (usuarios autenticados, cualquier rol)
router.post('/', authenticateToken, createSolicitud);

// Actualizar solicitud (usuarios autenticados, cualquier rol)
router.put('/:id', authenticateToken, putSolicitud);

// Eliminar solicitud (solo admins)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), deleteSolicitud);

module.exports = router;
