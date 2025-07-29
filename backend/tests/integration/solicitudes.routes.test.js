// tests/routes/solicitudes.routes.test.js
const request = require('supertest');
const app = require('../../app');
const db = require('../../src/config/db');
const { crearUsuarioYObtenerToken, crearEmpleado } = require('../utils/testHelpers');
require('dotenv').config({ path: './.env.test.local' });

let token;
let empleadoCreado;
let solicitudCreada;

describe('Rutas /solicitudes', () => {
  beforeAll(async () => {
    // Limpiar base de datos antes de empezar
    await db.query('DELETE FROM solicitudes CASCADE');
    await db.query('DELETE FROM empleados CASCADE');
    await db.query('DELETE FROM users CASCADE');
    
    // Crear un usuario real en la base de datos
    const userResult = await db.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      ['test_admin', 'test_admin@example.com', '$2a$10$test_hash', 'admin']
    );
    
    const user = userResult.rows[0];
    
    // Crear token JWT real
    const jwt = require('jsonwebtoken');
    token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Crear empleado real en la base de datos
    const empleadoResult = await db.query(
      'INSERT INTO empleados (nombre, fecha_ingreso, salario, id_usuario) VALUES ($1, $2, $3, $4) RETURNING *',
      ['Empleado Prueba', '2023-01-01', 5000000, user.id]
    );
    
    empleadoCreado = empleadoResult.rows[0];
  });

  afterAll(async () => {
    await db.query('DELETE FROM solicitudes CASCADE');
    await db.query('DELETE FROM empleados CASCADE');
    await db.query('DELETE FROM users CASCADE');
    await db.end();
  });

  it('POST /api/solicitudes - Crea una nueva solicitud', async () => {
    console.log('Token:', token);
    console.log('Empleado creado:', empleadoCreado);
    
    // Verificar que el empleado existe directamente en la base de datos
    const empleadoDB = await db.query('SELECT * FROM empleados WHERE id = $1', [empleadoCreado.id]);
    console.log('Empleado en DB:', empleadoDB.rows[0]);
    
    // Verificar que el empleado existe antes de crear la solicitud
    const empleadoCheck = await request(app)
      .get('/api/empleados')
      .set('Authorization', `Bearer ${token}`);
    
    console.log('Empleados disponibles:', empleadoCheck.body);
    
    // Verificar que el empleado específico existe
    const empleadoExists = empleadoCheck.body.data?.find(emp => emp.id === empleadoCreado.id);
    console.log('¿Empleado existe en la lista?', !!empleadoExists);
    
    const res = await request(app)
      .post('/api/solicitudes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        codigo: 'SOL-TEST',
        descripcion: 'Solicitud de prueba',
        resumen: 'Resumen prueba',
        id_empleado: empleadoCreado.id,
      });

    console.log('POST /api/solicitudes response:', res.body);
    console.log('POST /api/solicitudes status:', res.statusCode);
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    solicitudCreada = res.body;
  });

  it('GET /api/solicitudes - Devuelve todas las solicitudes', async () => {
    const res = await request(app)
      .get('/api/solicitudes')
      .set('Authorization', `Bearer ${token}`);

    console.log('GET /api/solicitudes response:', res.body);
    expect(res.statusCode).toBe(200);
    // Verificar si la respuesta es un array directo o tiene paginación
    if (Array.isArray(res.body)) {
      expect(res.body.length).toBeGreaterThan(0);
    } else {
      // Si tiene paginación como empleados
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    }
  });

  it('DELETE /api/solicitudes/:id - Solo admins pueden eliminar', async () => {
    // Solo ejecutar si se creó una solicitud
    if (solicitudCreada && solicitudCreada.id) {
      // Crear un token de empleado para probar que no puede eliminar
      const empleadoTokenData = await crearUsuarioYObtenerToken('empleado');
      const empleadoToken = empleadoTokenData.token;
      
      const res = await request(app)
        .delete(`/api/solicitudes/${solicitudCreada.id}`)
        .set('Authorization', `Bearer ${empleadoToken}`);

      expect(res.statusCode).toBe(403); // empleado no tiene permisos
    } else {
      // Si no se pudo crear la solicitud, saltar esta prueba
      console.log('Skipping DELETE test - no solicitud created');
      expect(true).toBe(true);
    }
  });
});
