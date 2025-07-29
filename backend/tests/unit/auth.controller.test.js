// tests/unit/auth.controller.test.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { register, login } = require('../../src/controllers/auth.controller');

// Mock de los modelos
jest.mock('../../src/models/userModel');
jest.mock('../../src/models/empleadoModel');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const { createUser, getUserByEmail } = require('../../src/models/userModel');
const { createEmpleado, getEmpleadoByUserId } = require('../../src/models/empleadoModel');

describe('auth.controller', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar JWT_SECRET para pruebas
    process.env.JWT_SECRET = 'test_secret_key';
    
    // Mock de request, response y next
    mockReq = {
      body: {}
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();
  });

  describe('register', () => {
    it('debería registrar un nuevo usuario exitosamente', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123456',
        role: 'empleado',
        salario: '3000000'
      };

      mockReq.body = userData;

      const hashedPassword = 'hashedpassword123';
      const createdUser = {
        id: 1,
        username: userData.username,
        email: userData.email,
        role: userData.role
      };

      bcrypt.hash.mockResolvedValue(hashedPassword);
      createUser.mockResolvedValue(createdUser);
      createEmpleado.mockResolvedValue({ id: 1 });

      await register(mockReq, mockRes);

      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(createUser).toHaveBeenCalledWith({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role
      });
      expect(createEmpleado).toHaveBeenCalledWith({
        nombre: userData.username,
        fecha_ingreso: expect.any(String),
        salario: Number(userData.salario),
        id_usuario: createdUser.id
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        id: createdUser.id,
        username: createdUser.username,
        role: createdUser.role
      });
    });

    it('debería registrar un usuario admin sin crear empleado', async () => {
      const userData = {
        username: 'adminuser',
        email: 'admin@example.com',
        password: '123456',
        role: 'admin'
      };

      mockReq.body = userData;

      const hashedPassword = 'hashedpassword123';
      const createdUser = {
        id: 1,
        username: userData.username,
        email: userData.email,
        role: userData.role
      };

      bcrypt.hash.mockResolvedValue(hashedPassword);
      createUser.mockResolvedValue(createdUser);

      await register(mockReq, mockRes);

      expect(createUser).toHaveBeenCalled();
      expect(createEmpleado).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('debería fallar al registrar sin campos obligatorios', async () => {
      const userData = {
        username: 'testuser',
        // email faltante
        password: '123456'
        // role faltante
      };

      mockReq.body = userData;

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Todos los campos son obligatorios'
      });
    });

    it('debería manejar error de usuario duplicado', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123456',
        role: 'empleado'
      };

      mockReq.body = userData;

      const duplicateError = new Error('Duplicate key');
      duplicateError.code = '23505';

      bcrypt.hash.mockResolvedValue('hashedpassword');
      createUser.mockRejectedValue(duplicateError);

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Usuario o correo ya registrado'
      });
    });

    it('debería manejar errores del servidor', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123456',
        role: 'empleado'
      };

      mockReq.body = userData;

      const serverError = new Error('Database connection failed');

      bcrypt.hash.mockResolvedValue('hashedpassword');
      createUser.mockRejectedValue(serverError);

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Error del servidor'
      });
    });
  });

  describe('login', () => {
    it('debería iniciar sesión con credenciales válidas', async () => {
      const loginData = {
        email: 'test@example.com',
        password: '123456'
      };

      mockReq.body = loginData;

      const user = {
        id: 1,
        username: 'testuser',
        email: loginData.email,
        password: 'hashedpassword',
        role: 'empleado'
      };

      const token = 'jwt.token.here';

      getUserByEmail.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      getEmpleadoByUserId.mockResolvedValue({ id: 1 });
      jwt.sign.mockReturnValue(token);

      await login(mockReq, mockRes);

      expect(getUserByEmail).toHaveBeenCalledWith(loginData.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, user.password);
      expect(getEmpleadoByUserId).toHaveBeenCalledWith(user.id);
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    });

    it('debería iniciar sesión como admin sin verificar empleado', async () => {
      const loginData = {
        email: 'admin@example.com',
        password: '123456'
      };

      mockReq.body = loginData;

      const user = {
        id: 1,
        username: 'adminuser',
        email: loginData.email,
        password: 'hashedpassword',
        role: 'admin'
      };

      const token = 'jwt.token.here';

      getUserByEmail.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue(token);

      await login(mockReq, mockRes);

      expect(getUserByEmail).toHaveBeenCalledWith(loginData.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, user.password);
      expect(getEmpleadoByUserId).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    });

    it('debería fallar login sin email y contraseña', async () => {
      const loginData = {
        email: 'test@example.com'
        // password faltante
      };

      mockReq.body = loginData;

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Email y contraseña son obligatorios'
      });
    });

    it('debería fallar login con usuario no registrado', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: '123456'
      };

      mockReq.body = loginData;

      getUserByEmail.mockResolvedValue(null);

      await login(mockReq, mockRes);

      expect(getUserByEmail).toHaveBeenCalledWith(loginData.email);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Credenciales inválidas'
      });
    });

    it('debería fallar login con contraseña incorrecta', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      mockReq.body = loginData;

      const user = {
        id: 1,
        username: 'testuser',
        email: loginData.email,
        password: 'hashedpassword',
        role: 'empleado'
      };

      getUserByEmail.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(false);

      await login(mockReq, mockRes);

      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, user.password);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Credenciales inválidas'
      });
    });

    it('debería fallar login para empleado sin registro de empleado', async () => {
      const loginData = {
        email: 'empleado@example.com',
        password: '123456'
      };

      mockReq.body = loginData;

      const user = {
        id: 1,
        username: 'empleado',
        email: loginData.email,
        password: 'hashedpassword',
        role: 'empleado'
      };

      getUserByEmail.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      getEmpleadoByUserId.mockResolvedValue(null);

      await login(mockReq, mockRes);

      expect(getEmpleadoByUserId).toHaveBeenCalledWith(user.id);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'No se pudo identificar tu registro de empleado'
      });
    });

    it('debería manejar error cuando JWT_SECRET no está definido', async () => {
      const loginData = {
        email: 'test@example.com',
        password: '123456'
      };

      mockReq.body = loginData;

      const user = {
        id: 1,
        username: 'testuser',
        email: loginData.email,
        password: 'hashedpassword',
        role: 'empleado'
      };

      delete process.env.JWT_SECRET;

      getUserByEmail.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      getEmpleadoByUserId.mockResolvedValue({ id: 1 });

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Error del servidor'
      });
    });

    it('debería manejar errores del servidor', async () => {
      const loginData = {
        email: 'test@example.com',
        password: '123456'
      };

      mockReq.body = loginData;

      const serverError = new Error('Database connection failed');

      getUserByEmail.mockRejectedValue(serverError);

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Error del servidor'
      });
    });
  });
});
