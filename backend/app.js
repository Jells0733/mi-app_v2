const express = require('express');
const cors = require('cors');
const pool = require('./src/config/db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Ruta de prueba solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/test-db', async (req, res) => {
    try {
      const result = await pool.query('SELECT NOW()');
      res.json({ ok: true, dbTime: result.rows[0].now });
    } catch (error) {
      console.error('Error en test-db:', error);
      res.status(500).json({ ok: false, error: 'Error al conectar con la base de datos' });
    }
  });
}

// Rutas
const authRoutes = require('./src/routes/auth.routes');
const empleadosRoutes = require('./src/routes/empleados.routes');
const solicitudesRoutes = require('./src/routes/solicitudes.routes');

app.use('/api/auth', authRoutes);
app.use('/api/empleados', empleadosRoutes);
app.use('/api/solicitudes', solicitudesRoutes);

module.exports = app;
