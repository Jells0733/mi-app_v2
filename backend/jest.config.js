module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  rootDir: '.',
  
  // Configuración para cobertura de código
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/config/db.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  
  // Configuración para tests
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000,
  
  // Configuración para verbose output
  verbose: true,
  
  // Configuración para detectar cambios
  watchPathIgnorePatterns: ['node_modules', 'coverage'],
  
  // Configuración para manejo de errores
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  
  // Configuración para ejecutar pruebas en serie (evita conflictos de BD)
  maxWorkers: 1,
};