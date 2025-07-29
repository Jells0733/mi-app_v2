require('dotenv').config({ path: '.env.test.local' });

const request = require('supertest');
const app = require('../../app');
const db = require('../../src/config/db');

afterAll(async () => {
  await db.query('DELETE FROM solicitudes CASCADE');
  await db.query('DELETE FROM empleados CASCADE');
  await db.query('DELETE FROM users CASCADE');
  await db.end();
});

describe('Pruebas de autenticación', () => {
  let testUser;

  beforeAll(() => {
    const timestamp = Date.now();
    testUser = {
      username: `usuario_${timestamp}`,
      email: `usuario_${timestamp}@correo.com`,
      password: '123456',
      role: 'empleado',
    };
  });

  it('Debería registrar un nuevo usuario', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.username).toBe(testUser.username);
  });

  it('Debería iniciar sesión con un usuario válido', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', testUser.email);
  });

  it('No debería iniciar sesión con credenciales inválidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'clave_incorrecta',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});
