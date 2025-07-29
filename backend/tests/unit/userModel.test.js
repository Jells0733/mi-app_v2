// tests/unit/userModel.test.js
const { createUser, getUserByEmail } = require('../../src/models/userModel');

// Mock de la base de datos
jest.mock('../../src/config/db', () => ({
  query: jest.fn()
}));

const db = require('../../src/config/db');

describe('userModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('debería crear un usuario exitosamente', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'empleado'
      };

      const expectedUser = {
        id: 1,
        ...userData,
        created_at: new Date()
      };

      db.query.mockResolvedValueOnce({ rows: [expectedUser] });

      const result = await createUser(userData);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        [userData.username, userData.email, userData.password, userData.role]
      );
      expect(result).toEqual(expectedUser);
    });

    it('debería manejar errores de base de datos', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'empleado'
      };

      const dbError = new Error('Database connection failed');
      db.query.mockRejectedValueOnce(dbError);

      await expect(createUser(userData)).rejects.toThrow('Database connection failed');
    });

    it('debería manejar errores de validación de datos', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'hashedpassword',
        role: 'empleado'
      };

      const validationError = new Error('Invalid email format');
      db.query.mockRejectedValueOnce(validationError);

      await expect(createUser(userData)).rejects.toThrow('Invalid email format');
    });
  });

  describe('getUserByEmail', () => {
    it('debería obtener un usuario por email exitosamente', async () => {
      const email = 'test@example.com';
      const expectedUser = {
        id: 1,
        username: 'testuser',
        email: email,
        password: 'hashedpassword',
        role: 'empleado',
        created_at: new Date()
      };

      db.query.mockResolvedValueOnce({ rows: [expectedUser] });

      const result = await getUserByEmail(email);

      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      expect(result).toEqual(expectedUser);
    });

    it('debería retornar null cuando el usuario no existe', async () => {
      const email = 'nonexistent@example.com';

      db.query.mockResolvedValueOnce({ rows: [] });

      const result = await getUserByEmail(email);

      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      expect(result).toBeUndefined();
    });

    it('debería manejar errores de base de datos', async () => {
      const email = 'test@example.com';
      const dbError = new Error('Database connection failed');

      db.query.mockRejectedValueOnce(dbError);

      await expect(getUserByEmail(email)).rejects.toThrow('Database connection failed');
    });

    it('debería manejar email vacío o inválido', async () => {
      const email = '';
      const dbError = new Error('Invalid email parameter');

      db.query.mockRejectedValueOnce(dbError);

      await expect(getUserByEmail(email)).rejects.toThrow('Invalid email parameter');
    });
  });
}); 