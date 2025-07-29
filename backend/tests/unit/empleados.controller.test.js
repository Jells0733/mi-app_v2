// tests/unit/empleados.controller.test.js
const {
  getEmpleados,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado
} = require('../../src/controllers/empleados.controller');

// Mock de los modelos
jest.mock('../../src/models/empleadoModel');
jest.mock('../../src/models/solicitudModel');

const { 
  getEmpleados: getEmpleadosModel,
  createEmpleado: createEmpleadoModel,
  updateEmpleadoById,
  deleteEmpleadoById,
  getEmpleadoById
} = require('../../src/models/empleadoModel');

const { getSolicitudesByEmpleado } = require('../../src/models/solicitudModel');

describe('empleados.controller', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock de request, response y next
    mockReq = {
      query: {},
      body: {},
      params: {}
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();
  });

  describe('getEmpleados', () => {
    it('debería obtener empleados con paginación por defecto', async () => {
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

      getEmpleadosModel.mockResolvedValue(empleados);

      await getEmpleados(mockReq, mockRes);

      expect(getEmpleadosModel).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        total: empleados.length,
        totalPages: 1,
        data: empleados
      });
    });

    it('debería filtrar empleados por nombre', async () => {
      mockReq.query = { nombre: 'Juan' };
      
      const empleados = [
        {
          id: 1,
          nombre: 'Juan Pérez',
          fecha_ingreso: '2023-01-15',
          salario: 3000000,
          id_usuario: 1
        }
      ];

      getEmpleadosModel.mockResolvedValue(empleados);

      await getEmpleados(mockReq, mockRes);

      expect(getEmpleadosModel).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        total: empleados.length,
        totalPages: 1,
        data: empleados
      });
    });

    it('debería manejar paginación personalizada', async () => {
      mockReq.query = { page: 2, limit: 5 };
      
      const empleados = [
        {
          id: 6,
          nombre: 'Empleado 6',
          fecha_ingreso: '2023-01-01',
          salario: 3000000,
          id_usuario: 6
        }
      ];

      getEmpleadosModel.mockResolvedValue(empleados);

      await getEmpleados(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        total: empleados.length,
        totalPages: 1,
        data: []
      });
    });

    it('debería manejar parámetros de paginación inválidos', async () => {
      mockReq.query = { page: -1, limit: 0 };
      
      const empleados = [
        {
          id: 1,
          nombre: 'Juan Pérez',
          fecha_ingreso: '2023-01-15',
          salario: 3000000,
          id_usuario: 1
        }
      ];

      getEmpleadosModel.mockResolvedValue(empleados);

      await getEmpleados(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        total: empleados.length,
        totalPages: 1,
        data: empleados
      });
    });

    it('debería manejar errores de base de datos', async () => {
      const dbError = new Error('Database connection failed');
      getEmpleadosModel.mockRejectedValue(dbError);

      await getEmpleados(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Error al obtener empleados'
      });
    });
  });

  describe('createEmpleado', () => {
    it('debería crear un nuevo empleado con datos válidos', async () => {
      const empleadoData = {
        nombre: 'Nuevo Empleado',
        fecha_ingreso: '2023-06-15',
        salario: '2500000'
      };

      mockReq.body = empleadoData;

      const createdEmpleado = {
        id: 3,
        ...empleadoData,
        salario: Number(empleadoData.salario),
        id_usuario: null,
        created_at: new Date()
      };

      createEmpleadoModel.mockResolvedValue(createdEmpleado);

      await createEmpleado(mockReq, mockRes);

      expect(createEmpleadoModel).toHaveBeenCalledWith({
        nombre: empleadoData.nombre,
        fecha_ingreso: empleadoData.fecha_ingreso,
        salario: empleadoData.salario
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(createdEmpleado);
    });

    it('debería fallar al crear empleado sin nombre', async () => {
      const empleadoInvalido = {
        fecha_ingreso: '2023-06-15',
        salario: '2500000'
      };

      mockReq.body = empleadoInvalido;

      await createEmpleado(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Todos los campos son obligatorios'
      });
    });

    it('debería fallar al crear empleado sin fecha_ingreso', async () => {
      const empleadoInvalido = {
        nombre: 'Empleado Sin Fecha',
        salario: '2500000'
      };

      mockReq.body = empleadoInvalido;

      await createEmpleado(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Todos los campos son obligatorios'
      });
    });

    it('debería fallar al crear empleado sin salario', async () => {
      const empleadoInvalido = {
        nombre: 'Empleado Sin Salario',
        fecha_ingreso: '2023-06-15'
      };

      mockReq.body = empleadoInvalido;

      await createEmpleado(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Todos los campos son obligatorios'
      });
    });

    it('debería manejar errores de base de datos', async () => {
      const empleadoData = {
        nombre: 'Test User',
        fecha_ingreso: '2023-06-15',
        salario: '2500000'
      };

      mockReq.body = empleadoData;

      const dbError = new Error('Database connection failed');
      createEmpleadoModel.mockRejectedValue(dbError);

      await createEmpleado(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Error al crear empleado'
      });
    });
  });

  describe('updateEmpleado', () => {
    it('debería actualizar un empleado existente', async () => {
      const empleadoId = 1;
      const datosActualizados = {
        nombre: 'Empleado Actualizado',
        fecha_ingreso: '2023-07-01',
        salario: '3500000'
      };

      mockReq.params = { id: empleadoId };
      mockReq.body = datosActualizados;

      const existingEmpleado = {
        id: empleadoId,
        nombre: 'Empleado Original',
        fecha_ingreso: '2023-01-01',
        salario: 3000000,
        id_usuario: 1
      };

      const updatedEmpleado = {
        id: empleadoId,
        ...datosActualizados,
        salario: Number(datosActualizados.salario),
        id_usuario: 1,
        created_at: new Date()
      };

      getEmpleadoById.mockResolvedValue(existingEmpleado);
      updateEmpleadoById.mockResolvedValue(updatedEmpleado);

      await updateEmpleado(mockReq, mockRes);

      expect(updateEmpleadoById).toHaveBeenCalledWith(empleadoId, {
        nombre: datosActualizados.nombre,
        fecha_ingreso: datosActualizados.fecha_ingreso,
        salario: datosActualizados.salario
      });
      expect(mockRes.json).toHaveBeenCalledWith(updatedEmpleado);
    });

    it('debería fallar al actualizar empleado sin nombre', async () => {
      const empleadoId = 1;
      const datosIncompletos = {
        fecha_ingreso: '2023-07-01',
        salario: '3500000'
      };

      mockReq.params = { id: empleadoId };
      mockReq.body = datosIncompletos;

      await updateEmpleado(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Todos los campos son obligatorios'
      });
    });

    it('debería fallar al actualizar empleado inexistente', async () => {
      const empleadoId = 999;
      const datosActualizados = {
        nombre: 'Empleado Inexistente',
        fecha_ingreso: '2023-07-01',
        salario: '3500000'
      };

      mockReq.params = { id: empleadoId };
      mockReq.body = datosActualizados;

      updateEmpleadoById.mockResolvedValue(null);

      await updateEmpleado(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Empleado no encontrado'
      });
    });

    it('debería manejar errores de base de datos', async () => {
      const empleadoId = 1;
      const datosActualizados = {
        nombre: 'Test User',
        fecha_ingreso: '2023-07-01',
        salario: '3500000'
      };

      mockReq.params = { id: empleadoId };
      mockReq.body = datosActualizados;

      const existingEmpleado = {
        id: empleadoId,
        nombre: 'Empleado Existente',
        fecha_ingreso: '2023-01-01',
        salario: 3000000,
        id_usuario: 1
      };

      getEmpleadoById.mockResolvedValue(existingEmpleado);
      const dbError = new Error('Database connection failed');
      updateEmpleadoById.mockRejectedValue(dbError);

      await updateEmpleado(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Error al actualizar empleado'
      });
    });
  });

  describe('deleteEmpleado', () => {
    it('debería eliminar un empleado exitosamente', async () => {
      const empleadoId = 1;
      const empleado = {
        id: empleadoId,
        nombre: 'Empleado a eliminar',
        fecha_ingreso: '2023-01-01',
        salario: 3000000
      };

      mockReq.params = { id: empleadoId };

      getEmpleadoById.mockResolvedValue(empleado);
      deleteEmpleadoById.mockResolvedValue(empleado);

      await deleteEmpleado(mockReq, mockRes);

      expect(getEmpleadoById).toHaveBeenCalledWith(empleadoId);
      expect(deleteEmpleadoById).toHaveBeenCalledWith(empleadoId);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Empleado eliminado exitosamente'
      });
    });

    it('debería fallar al eliminar empleado inexistente', async () => {
      const empleadoId = 999;

      mockReq.params = { id: empleadoId };

      getEmpleadoById.mockResolvedValue(null);

      await deleteEmpleado(mockReq, mockRes);

      expect(getEmpleadoById).toHaveBeenCalledWith(empleadoId);
      expect(deleteEmpleadoById).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Empleado no encontrado'
      });
    });

    it('debería manejar errores de base de datos', async () => {
      const empleadoId = 1;

      mockReq.params = { id: empleadoId };

      const dbError = new Error('Database connection failed');
      getEmpleadoById.mockRejectedValue(dbError);

      await deleteEmpleado(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Error al eliminar empleado'
      });
    });
  });
}); 