// tests/utils/testHelpers.js

/**
 * Test Helpers - Utilidades para pruebas unitarias
 * 
 * Este archivo contiene funciones auxiliares para facilitar
 * la escritura y mantenimiento de pruebas unitarias.
 */

/**
 * Crea un mock de request para pruebas
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Mock de request
 */
const createMockRequest = (options = {}) => {
  return {
    body: options.body || {},
    query: options.query || {},
    params: options.params || {},
    headers: options.headers || {},
    user: options.user || null,
    ...options
  };
};

/**
 * Crea un mock de response para pruebas
 * @returns {Object} Mock de response
 */
const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis()
  };
  
  // Agregar getters para facilitar testing
  Object.defineProperty(res, 'statusCode', {
    get: () => res.status.mock.calls[res.status.mock.calls.length - 1]?.[0] || 200
  });
  
  return res;
};

/**
 * Crea un mock de next function para pruebas
 * @returns {Function} Mock de next function
 */
const createMockNext = () => {
  return jest.fn();
};

/**
 * Crea datos de prueba para usuarios
 * @param {Object} overrides - Datos a sobrescribir
 * @returns {Object} Datos de usuario de prueba
 */
const createTestUser = (overrides = {}) => {
  return {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    role: 'empleado',
    created_at: new Date(),
    ...overrides
  };
};

/**
 * Crea datos de prueba para empleados
 * @param {Object} overrides - Datos a sobrescribir
 * @returns {Object} Datos de empleado de prueba
 */
const createTestEmpleado = (overrides = {}) => {
  return {
    id: 1,
    nombre: 'Juan Pérez',
    fecha_ingreso: '2023-01-15',
    salario: 3000000,
    id_usuario: 1,
    created_at: new Date(),
    ...overrides
  };
};

/**
 * Crea datos de prueba para solicitudes
 * @param {Object} overrides - Datos a sobrescribir
 * @returns {Object} Datos de solicitud de prueba
 */
const createTestSolicitud = (overrides = {}) => {
  return {
    id: 1,
    codigo: 'SOL-001',
    descripcion: 'Solicitud de prueba',
    resumen: 'Resumen de la solicitud',
    id_empleado: 1,
    empleado: {
      id: 1,
      nombre: 'Juan Pérez'
    },
    created_at: new Date(),
    ...overrides
  };
};

/**
 * Crea un token JWT de prueba
 * @param {Object} payload - Payload del token
 * @returns {string} Token JWT
 */
const createTestToken = (payload = {}) => {
  const defaultPayload = {
    userId: 1,
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  };
  
  const finalPayload = { ...defaultPayload, ...payload };
  
  // Simular estructura de JWT (header.payload.signature)
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payloadStr = Buffer.from(JSON.stringify(finalPayload)).toString('base64');
  const signature = 'test_signature';
  
  return `${header}.${payloadStr}.${signature}`;
};

/**
 * Configura variables de entorno para pruebas
 */
const setupTestEnvironment = () => {
  process.env.JWT_SECRET = 'test_secret_key_for_unit_testing';
  process.env.NODE_ENV = 'test';
  process.env.DB_HOST = 'localhost';
  process.env.DB_PORT = '5432';
  process.env.DB_USER = 'test_user';
  process.env.DB_PASSWORD = 'test_password';
  process.env.DB_NAME = 'test_db';
};

/**
 * Limpia variables de entorno después de las pruebas
 */
const cleanupTestEnvironment = () => {
  delete process.env.JWT_SECRET;
  delete process.env.NODE_ENV;
  delete process.env.DB_HOST;
  delete process.env.DB_PORT;
  delete process.env.DB_USER;
  delete process.env.DB_PASSWORD;
  delete process.env.DB_NAME;
};

/**
 * Crea un mock de resultado de base de datos
 * @param {Array} rows - Filas de datos
 * @param {number} rowCount - Número de filas afectadas
 * @returns {Object} Mock de resultado de DB
 */
const createDbResult = (rows = [], rowCount = 0) => {
  return {
    rows,
    rowCount,
    command: 'SELECT',
    fields: []
  };
};

/**
 * Crea un mock de error de base de datos
 * @param {string} message - Mensaje de error
 * @param {string} code - Código de error
 * @returns {Error} Error de base de datos
 */
const createDbError = (message = 'Database connection failed', code = 'ECONNREFUSED') => {
  const error = new Error(message);
  error.code = code;
  return error;
};

/**
 * Valida que una respuesta HTTP tenga el formato correcto
 * @param {Object} response - Mock de response
 * @param {number} expectedStatus - Status code esperado
 * @param {Object} expectedBody - Body esperado
 */
const validateHttpResponse = (response, expectedStatus, expectedBody) => {
  expect(response.status).toHaveBeenCalledWith(expectedStatus);
  expect(response.json).toHaveBeenCalledWith(expectedBody);
};

/**
 * Valida que una función haya sido llamada con parámetros específicos
 * @param {Function} mockFunction - Función mock
 * @param {Array} expectedParams - Parámetros esperados
 */
const validateFunctionCall = (mockFunction, expectedParams) => {
  expect(mockFunction).toHaveBeenCalledWith(...expectedParams);
};

/**
 * Crea un mock de paginación
 * @param {Array} data - Datos
 * @param {Object} options - Opciones de paginación
 * @returns {Object} Respuesta paginada
 */
const createPaginatedResponse = (data = [], options = {}) => {
  const {
    page = 1,
    limit = 10,
    total = data.length
  } = options;
  
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data
  };
};

/**
 * Crea un usuario y obtiene su token para pruebas de integración
 * @param {string} role - Rol del usuario ('admin' o 'empleado')
 * @returns {Promise<Object>} Objeto con token y datos del usuario
 */
const crearUsuarioYObtenerToken = async (role = 'admin') => {
  const jwt = require('jsonwebtoken');
  
  const userData = {
    username: `test_${role}_${Date.now()}`,
    email: `test_${role}_${Date.now()}@example.com`,
    password: 'testpassword123',
    role: role
  };

  // Simular creación de usuario
  const user = {
    id: Math.floor(Math.random() * 1000) + 1,
    ...userData,
    created_at: new Date()
  };

  // Crear token JWT real
  const token = jwt.sign(
    { 
      userId: user.id, 
      role: user.role,
      email: user.email
    },
    process.env.JWT_SECRET || 'test_secret_key_for_testing_only_very_long_and_secure_key_for_jwt_tokens_in_test_environment',
    { expiresIn: '1h' }
  );

  return {
    user,
    token,
    userData
  };
};

/**
 * Crea un empleado para pruebas de integración
 * @param {Object} empleadoData - Datos del empleado
 * @returns {Promise<Object>} Empleado creado
 */
const crearEmpleado = async (empleadoData = {}) => {
  const defaultData = {
    nombre: 'Empleado Test',
    fecha_ingreso: '2023-01-15',
    salario: 3000000,
    id_usuario: 1
  };

  const empleado = {
    id: Math.floor(Math.random() * 1000) + 1,
    ...defaultData,
    ...empleadoData,
    created_at: new Date()
  };

  return empleado;
};

/**
 * Factory para crear múltiples instancias de prueba
 */
const TestFactory = {
  user: createTestUser,
  empleado: createTestEmpleado,
  solicitud: createTestSolicitud,
  token: createTestToken,
  request: createMockRequest,
  response: createMockResponse,
  next: createMockNext,
  dbResult: createDbResult,
  dbError: createDbError,
  paginated: createPaginatedResponse,
  crearUsuarioYObtenerToken,
  crearEmpleado
};

module.exports = {
  // Funciones principales
  createMockRequest,
  createMockResponse,
  createMockNext,
  
  // Factories de datos
  createTestUser,
  createTestEmpleado,
  createTestSolicitud,
  createTestToken,
  
  // Utilidades de entorno
  setupTestEnvironment,
  cleanupTestEnvironment,
  
  // Utilidades de base de datos
  createDbResult,
  createDbError,
  
  // Utilidades de validación
  validateHttpResponse,
  validateFunctionCall,
  createPaginatedResponse,
  
  // Funciones para pruebas de integración
  crearUsuarioYObtenerToken,
  crearEmpleado,
  
  // Factory principal
  TestFactory
};
