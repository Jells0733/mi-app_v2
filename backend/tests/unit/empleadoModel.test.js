// tests/unit/empleadoModel.test.js
const {
  createEmpleado,
  getEmpleados,
  getEmpleadoById,
  updateEmpleadoById,
  deleteEmpleadoById,
  getEmpleadoByUserId
} = require('../../src/models/empleadoModel');

// Mock de la base de datos
jest.mock('../../src/config/db', () => ({
  query: jest.fn()
}));

const db = require('../../src/config/db');

describe('empleadoModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createEmpleado', () => {
    it('debería crear un empleado exitosamente', async () => {
      const empleadoData = {
        nombre: 'Juan Pérez',
        fecha_ingreso: '2023-01-15',
        salario: 3000000,
        id_usuario: 1
      };

      const expectedEmpleado = {
        id: 1,
        ...empleadoData,
        created_at: new Date()
      };

      db.query.mockResolvedValueOnce({ rows: [expectedEmpleado] });

      const result = await createEmpleado(empleadoData);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO empleados'),
        [empleadoData.nombre, empleadoData.fecha_ingreso, empleadoData.salario, empleadoData.id_usuario]
      );
      expect(result).toEqual(expectedEmpleado);
    });

    it('debería crear empleado sin id_usuario', async () => {
      const empleadoData = {
        nombre: 'María García',
        fecha_ingreso: '2023-02-20',
        salario: 2500000
      };

      const expectedEmpleado = {
        id: 2,
        ...empleadoData,
        id_usuario: null,
        created_at: new Date()
      };

      db.query.mockResolvedValueOnce({ rows: [expectedEmpleado] });

      const result = await createEmpleado(empleadoData);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO empleados'),
        [empleadoData.nombre, empleadoData.fecha_ingreso, empleadoData.salario, null]
      );
      expect(result).toEqual(expectedEmpleado);
    });

    it('debería manejar errores de base de datos', async () => {
      const empleadoData = {
        nombre: 'Test User',
        fecha_ingreso: '2023-01-01',
        salario: 3000000
      };

      const dbError = new Error('Database connection failed');
      db.query.mockRejectedValueOnce(dbError);

      await expect(createEmpleado(empleadoData)).rejects.toThrow('Database connection failed');
    });

    it('debería manejar errores de validación', async () => {
      const empleadoData = {
        nombre: '', // nombre vacío
        fecha_ingreso: '2023-01-01',
        salario: 3000000
      };

      const validationError = new Error('Invalid employee data');
      db.query.mockRejectedValueOnce(validationError);

      await expect(createEmpleado(empleadoData)).rejects.toThrow('Invalid employee data');
    });
  });

  describe('getEmpleados', () => {
    it('debería obtener todos los empleados', async () => {
      const empleados = [
        {
          id: 1,
          nombre: 'Juan Pérez',
          fecha_ingreso: '2023-01-15',
          salario: 3000000,
          id_usuario: 1
        },
        {
          id: 2,
          nombre: 'María García',
          fecha_ingreso: '2023-02-20',
          salario: 2500000,
          id_usuario: 2
        }
      ];

      db.query.mockResolvedValueOnce({ rows: empleados });

      const result = await getEmpleados();

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM empleados ORDER BY id');
      expect(result).toEqual(empleados);
    });

    it('debería retornar array vacío cuando no hay empleados', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const result = await getEmpleados();

      expect(result).toEqual([]);
    });

    it('debería manejar errores de base de datos', async () => {
      const dbError = new Error('Database connection failed');
      db.query.mockRejectedValueOnce(dbError);

      await expect(getEmpleados()).rejects.toThrow('Database connection failed');
    });
  });

  describe('getEmpleadoById', () => {
    it('debería obtener un empleado por ID', async () => {
      const empleadoId = 1;
      const empleado = {
        id: empleadoId,
        nombre: 'Juan Pérez',
        fecha_ingreso: '2023-01-15',
        salario: 3000000,
        id_usuario: 1
      };

      db.query.mockResolvedValueOnce({ rows: [empleado] });

      const result = await getEmpleadoById(empleadoId);

      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM empleados WHERE id = $1',
        [empleadoId]
      );
      expect(result).toEqual(empleado);
    });

    it('debería retornar null cuando el empleado no existe', async () => {
      const empleadoId = 999;

      db.query.mockResolvedValueOnce({ rows: [] });

      const result = await getEmpleadoById(empleadoId);

      expect(result).toBeUndefined();
    });

    it('debería manejar errores de base de datos', async () => {
      const empleadoId = 1;
      const dbError = new Error('Database connection failed');

      db.query.mockRejectedValueOnce(dbError);

      await expect(getEmpleadoById(empleadoId)).rejects.toThrow('Database connection failed');
    });
  });

  describe('getEmpleadoByUserId', () => {
    it('debería obtener un empleado por ID de usuario', async () => {
      const userId = 1;
      const empleado = {
        id: 1,
        nombre: 'Juan Pérez',
        fecha_ingreso: '2023-01-15',
        salario: 3000000,
        id_usuario: userId
      };

      db.query.mockResolvedValueOnce({ rows: [empleado] });

      const result = await getEmpleadoByUserId(userId);

      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM empleados WHERE id_usuario = $1',
        [userId]
      );
      expect(result).toEqual(empleado);
    });

    it('debería retornar null cuando no hay empleado para el usuario', async () => {
      const userId = 999;

      db.query.mockResolvedValueOnce({ rows: [] });

      const result = await getEmpleadoByUserId(userId);

      expect(result).toBeNull();
    });
  });

  describe('updateEmpleadoById', () => {
    it('debería actualizar un empleado exitosamente', async () => {
      const empleadoId = 1;
      const updateData = {
        nombre: 'Juan Pérez Actualizado',
        fecha_ingreso: '2023-03-01',
        salario: 3500000
      };

      const updatedEmpleado = {
        id: empleadoId,
        ...updateData,
        id_usuario: 1,
        created_at: new Date()
      };

      db.query.mockResolvedValueOnce({ rows: [updatedEmpleado] });

      const result = await updateEmpleadoById(empleadoId, updateData);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE empleados'),
        [updateData.nombre, updateData.fecha_ingreso, updateData.salario, empleadoId]
      );
      expect(result).toEqual(updatedEmpleado);
    });

    it('debería manejar errores cuando el empleado no existe', async () => {
      const empleadoId = 999;
      const updateData = {
        nombre: 'Empleado Inexistente',
        fecha_ingreso: '2023-01-01',
        salario: 3000000
      };

      db.query.mockResolvedValueOnce({ rows: [] });

      const result = await updateEmpleadoById(empleadoId, updateData);

      expect(result).toBeUndefined();
    });

    it('debería manejar errores de base de datos', async () => {
      const empleadoId = 1;
      const updateData = {
        nombre: 'Test User',
        fecha_ingreso: '2023-01-01',
        salario: 3000000
      };

      const dbError = new Error('Database connection failed');
      db.query.mockRejectedValueOnce(dbError);

      await expect(updateEmpleadoById(empleadoId, updateData)).rejects.toThrow('Database connection failed');
    });
  });

  describe('deleteEmpleadoById', () => {
    it('debería eliminar un empleado exitosamente', async () => {
      const empleadoId = 1;

      db.query.mockResolvedValueOnce({ rowCount: 1 });

      await deleteEmpleadoById(empleadoId);

      expect(db.query).toHaveBeenCalledWith(
        'DELETE FROM empleados WHERE id = $1 RETURNING *',
        [empleadoId]
      );
    });

    it('debería manejar cuando el empleado no existe', async () => {
      const empleadoId = 999;

      db.query.mockResolvedValueOnce({ rowCount: 0 });

      await deleteEmpleadoById(empleadoId);

      expect(db.query).toHaveBeenCalledWith(
        'DELETE FROM empleados WHERE id = $1 RETURNING *',
        [empleadoId]
      );
    });

    it('debería manejar errores de base de datos', async () => {
      const empleadoId = 1;
      const dbError = new Error('Database connection failed');

      db.query.mockRejectedValueOnce(dbError);

      await expect(deleteEmpleadoById(empleadoId)).rejects.toThrow('Database connection failed');
    });
  });
});
