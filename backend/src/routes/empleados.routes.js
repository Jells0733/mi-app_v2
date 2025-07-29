// backend/src/routes/empleados.routes.js

const express = require('express');
const router = express.Router();

const {
  getEmpleados,
  createEmpleado,
  updateEmpleado 
} = require('../controllers/empleados.controller');

const {
  authenticateToken,
  authorizeRole
} = require('../middlewares/auth.middleware');

const {
  getEmpleadoIdByUsuario
} = require('../models/empleadoModel');

// Ruta: Obtener todos los empleados (solo autenticados)
router.get('/', authenticateToken, getEmpleados);

// Ruta: Obtener ID del empleado vinculado al usuario actual (depuración incluida)
router.get('/mi-id', authenticateToken, async (req, res) => {
  console.log('[GET /mi-id] req.user:', req.user);

  try {
    if (!req.user || !req.user.userId) {
      console.warn('Token válido pero sin userId en payload.');
      return res.status(400).json({ error: 'Token inválido: falta userId' });
    }

    const id = await getEmpleadoIdByUsuario(req.user.userId);
    console.log(`ID de empleado encontrado para userId ${req.user.userId}: ${id}`);

    if (!id) {
      console.warn(`No se encontró un empleado con id_usuario = ${req.user.userId}`);
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    res.json({ id });
  } catch (error) {
    console.error('Error al obtener ID de empleado:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Crear empleado
router.post('/', authenticateToken, authorizeRole(['admin']), createEmpleado);

// Nueva ruta: Actualizar empleado
router.put('/:id', authenticateToken, authorizeRole(['admin']), updateEmpleado);

// Exportar el router correctamente
module.exports = router;
