// Configuración global para todas las pruebas
require('dotenv').config({ path: '.env.test.local' });

// Configurar timeout global para pruebas
jest.setTimeout(30000);

// Configurar variables de entorno para pruebas
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key_for_testing_only_very_long_and_secure_key_for_jwt_tokens_in_test_environment';

// Configurar variables de base de datos para pruebas
process.env.DB_HOST = process.env.DB_HOST || 'test-db';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'Ntc0394**';
process.env.DB_NAME = process.env.DB_NAME || 'miapp_test';

// Configurar console.log para pruebas (opcional)
if (process.env.NODE_ENV === 'test') {
  // console.log = jest.fn(); // Comentado para ver logs durante debugging
}

// Configuración global para manejo de errores en pruebas
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
}); 