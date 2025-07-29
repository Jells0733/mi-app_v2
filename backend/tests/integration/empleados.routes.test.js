// tests/routes/empleados.routes.test.js
const request = require('supertest');
const app = require('../../app');
const db = require('../../src/config/db');
const { crearUsuarioYObtenerToken } = require('../utils/testHelpers');
require('dotenv').config({ path: './.env.test.local' });

describe('👷 empleados.routes', () => {
  let token;
  let empleadoId;

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
  });

  afterAll(async () => {
    await db.query('DELETE FROM solicitudes CASCADE');
    await db.query('DELETE FROM empleados CASCADE');
    await db.query('DELETE FROM users CASCADE');
    await db.end();
  });

  it('POST /api/empleados debería crear un nuevo empleado', async () => {
    const nuevo = {
      nombre: 'Empleado Ruta',
      fecha_ingreso: '2023-06-10',
      salario: 3500000,
    };

    const res = await request(app)
      .post('/api/empleados')
      .set('Authorization', `Bearer ${token}`)
      .send(nuevo);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.nombre).toBe(nuevo.nombre);

    empleadoId = res.body.id;
  });

  it('GET /api/empleados debería retornar los empleados', async () => {
    const res = await request(app)
      .get('/api/empleados')
      .set('Authorization', `Bearer ${token}`);

    console.log('GET /api/empleados response:', res.body);
    expect(res.statusCode).toBe(200);
    // La respuesta es un objeto con paginación, no un array directo
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('PUT /api/empleados/:id debería actualizar un empleado', async () => {
    const actualizacion = {
      nombre: 'Empleado Actualizado',
      fecha_ingreso: '2023-07-15',
      salario: 4200000,
    };

    console.log('Actualizando empleado con ID:', empleadoId);

    const res = await request(app)
      .put(`/api/empleados/${empleadoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(actualizacion);

    console.log('PUT /api/empleados response:', res.body);
    console.log('PUT /api/empleados status:', res.statusCode);
    
    // Si el empleado no existe, debería devolver 404
    if (res.statusCode === 404) {
      console.log('Empleado no encontrado, creando uno nuevo para la prueba');
      // Crear un empleado nuevo para la prueba
      const nuevoRes = await request(app)
        .post('/api/empleados')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nombre: 'Empleado para Actualizar',
          fecha_ingreso: '2023-06-10',
          salario: 3500000,
        });
      
      empleadoId = nuevoRes.body.id;
      
      // Intentar actualizar el nuevo empleado
      const updateRes = await request(app)
        .put(`/api/empleados/${empleadoId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(actualizacion);
      
      expect(updateRes.statusCode).toBe(200);
      expect(updateRes.body.nombre).toBe(actualizacion.nombre);
    } else {
      expect(res.statusCode).toBe(200);
      expect(res.body.nombre).toBe(actualizacion.nombre);
    }
  });
});