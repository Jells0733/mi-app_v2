// tests/unit/solicitudes.controller.test.js
const {
  getSolicitudes,
  createSolicitud,
  putSolicitud,
  deleteSolicitud
} = require('../../src/controllers/solicitudes.controller');

// Mock de los modelos
jest.mock('../../src/models/solicitudModel');
jest.mock('../../src/models/empleadoModel');

const { 
  getSolicitudes: getSolicitudesModel,
  createSolicitud: createSolicitudModel,
  updateSolicitudById,
  deleteSolicitud: deleteSolicitudModel,
  getSolicitudById
} = require('../../src/models/solicitudModel');

const { getEmpleadoById, getEmpleadoByUserId } = require('../../src/models/empleadoModel');

describe('solicitudes.controller', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock de request, response y next
    mockReq = {
      query: {},
      body: {},
      params: {},
      user: { userId: 1, role: 'admin' }
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();
  });

  describe('getSolicitudes', () => {
    it('debería obtener solicitudes con paginación por defecto', async () => {
      const solicitudes = [
        {
          id: 1,
          codigo: 'SOL-001',
          descripcion: 'Solicitud 1',
          resumen: 'Resumen 1',
          id_empleado: 1
        },
        {
          id: 2,
          codigo: 'SOL-002',
          descripcion: 'Solicitud 2',
          resumen: 'Resumen 2',
          id_empleado: 2
        }
      ];

      getSolicitudesModel.mockResolvedValue(solicitudes);

      await getSolicitudes(mockReq, mockRes);

      expect(getSolicitudesModel).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        total: solicitudes.length,
        totalPages: 1,
        data: solicitudes
      });
    });

    it('debería manejar paginación personalizada', async () => {
      mockReq.query = { page: 2, limit: 5 };
      
      const solicitudes = [
        {
          id: 6,
          codigo: 'SOL-006',
          descripcion: 'Solicitud 6',
          resumen: 'Resumen 6',
          id_empleado: 6
        }
      ];

      getSolicitudesModel.mockResolvedValue(solicitudes);

      await getSolicitudes(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        total: solicitudes.length,
        totalPages: 1,
        data: []
      });
    });

    it('debería manejar parámetros de paginación inválidos', async () => {
      mockReq.query = { page: -1, limit: 0 };
      
      const solicitudes = [
        {
          id: 1,
          codigo: 'SOL-001',
          descripcion: 'Solicitud 1',
          resumen: 'Resumen 1',
          id_empleado: 1
        }
      ];

      getSolicitudesModel.mockResolvedValue(solicitudes);

      await getSolicitudes(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        total: solicitudes.length,
        totalPages: 1,
        data: solicitudes
      });
    });

    it('debería manejar errores de base de datos', async () => {
      const dbError = new Error('Database connection failed');
      getSolicitudesModel.mockRejectedValue(dbError);

      await getSolicitudes(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Error del servidor'
      });
    });
  });

  describe('createSolicitud', () => {
    it('debería crear una nueva solicitud como admin', async () => {
      const solicitudData = {
        codigo: 'SOL-ADMIN-TEST',
        descripcion: 'Solicitud creada por admin',
        resumen: 'Resumen admin',
        id_empleado: 1
      };

      mockReq.body = solicitudData;

      const createdSolicitud = {
        id: 1,
        ...solicitudData,
        created_at: new Date()
      };

      createSolicitudModel.mockResolvedValue(createdSolicitud);

      await createSolicitud(mockReq, mockRes);

      expect(createSolicitudModel).toHaveBeenCalledWith(solicitudData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(createdSolicitud);
    });

    it('debería crear solicitud como empleado usando su ID', async () => {
      mockReq.user = { userId: 2, role: 'empleado' };
      
      const solicitudData = {
        codigo: 'SOL-EMPLEADO-TEST',
        descripcion: 'Solicitud creada por empleado',
        resumen: 'Resumen empleado'
      };

      mockReq.body = solicitudData;

      const empleado = {
        id: 2,
        nombre: 'Empleado Test',
        id_usuario: 2
      };

      const createdSolicitud = {
        id: 1,
        ...solicitudData,
        id_empleado: empleado.id,
        created_at: new Date()
      };

      getEmpleadoByUserId.mockResolvedValue(empleado);
      createSolicitudModel.mockResolvedValue(createdSolicitud);

      await createSolicitud(mockReq, mockRes);

      expect(getEmpleadoByUserId).toHaveBeenCalledWith(2);
      expect(createSolicitudModel).toHaveBeenCalledWith({
        ...solicitudData,
        id_empleado: empleado.id
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('debería fallar al crear solicitud sin codigo', async () => {
      const solicitudInvalida = {
        descripcion: 'Solicitud sin código',
        resumen: 'Resumen sin código',
        id_empleado: 1
      };

      mockReq.body = solicitudInvalida;

      await createSolicitud(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Todos los campos son obligatorios'
      });
    });

    it('debería fallar al crear solicitud sin descripcion', async () => {
      const solicitudInvalida = {
        codigo: 'SOL-SIN-DESC',
        resumen: 'Resumen sin descripción',
        id_empleado: 1
      };

      mockReq.body = solicitudInvalida;

      await createSolicitud(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Todos los campos son obligatorios'
      });
    });

    it('debería fallar al crear solicitud sin resumen', async () => {
      const solicitudInvalida = {
        codigo: 'SOL-SIN-RESUMEN',
        descripcion: 'Descripción sin resumen',
        id_empleado: 1
      };

      mockReq.body = solicitudInvalida;

      await createSolicitud(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Todos los campos son obligatorios'
      });
    });

    it('debería fallar al crear solicitud como admin sin id_empleado', async () => {
      const solicitudInvalida = {
        codigo: 'SOL-ADMIN-SIN-EMPLEADO',
        descripcion: 'Solicitud admin sin empleado',
        resumen: 'Resumen sin empleado'
      };

      mockReq.body = solicitudInvalida;

      await createSolicitud(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'El admin debe especificar un id_empleado'
      });
    });

    it('debería fallar al crear solicitud como empleado sin registro de empleado', async () => {
      mockReq.user = { userId: 999, role: 'empleado' };
      
      const solicitudData = {
        codigo: 'SOL-EMPLEADO-TEST',
        descripcion: 'Solicitud creada por empleado',
        resumen: 'Resumen empleado'
      };

      mockReq.body = solicitudData;

      getEmpleadoByUserId.mockResolvedValue(null);

      await createSolicitud(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'No se encontró empleado asociado al usuario'
      });
    });

    it('debería manejar errores de base de datos', async () => {
      const solicitudData = {
        codigo: 'SOL-TEST',
        descripcion: 'Solicitud de prueba',
        resumen: 'Resumen de prueba',
        id_empleado: 1
      };

      mockReq.body = solicitudData;

      const dbError = new Error('Database connection failed');
      createSolicitudModel.mockRejectedValue(dbError);

      await createSolicitud(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Error del servidor'
      });
    });
  });

  describe('putSolicitud', () => {
    it('debería actualizar una solicitud existente', async () => {
      const solicitudId = 1;
      const datosActualizados = {
        codigo: 'SOL-UPDATED',
        descripcion: 'Solicitud actualizada',
        resumen: 'Resumen actualizado',
        id_empleado: 1
      };

      mockReq.params = { id: solicitudId };
      mockReq.body = datosActualizados;

      const updatedSolicitud = {
        id: solicitudId,
        ...datosActualizados,
        created_at: new Date()
      };

      updateSolicitudById.mockResolvedValue(updatedSolicitud);

      await putSolicitud(mockReq, mockRes);

      expect(updateSolicitudById).toHaveBeenCalledWith(solicitudId, datosActualizados);
      expect(mockRes.json).toHaveBeenCalledWith(updatedSolicitud);
    });

    it('debería fallar al actualizar solicitud sin codigo', async () => {
      const solicitudId = 1;
      const datosIncompletos = {
        descripcion: 'Solicitud sin código',
        resumen: 'Resumen sin código',
        id_empleado: 1
      };

      mockReq.params = { id: solicitudId };
      mockReq.body = datosIncompletos;

      await putSolicitud(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Todos los campos son obligatorios'
      });
    });

    it('debería fallar al actualizar solicitud inexistente', async () => {
      const solicitudId = 999;
      const datosActualizados = {
        codigo: 'SOL-INEXISTENTE',
        descripcion: 'Solicitud inexistente',
        resumen: 'Resumen inexistente',
        id_empleado: 1
      };

      mockReq.params = { id: solicitudId };
      mockReq.body = datosActualizados;

      updateSolicitudById.mockResolvedValue(null);

      await putSolicitud(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Solicitud no encontrada'
      });
    });

    it('debería manejar errores de base de datos', async () => {
      const solicitudId = 1;
      const datosActualizados = {
        codigo: 'SOL-TEST',
        descripcion: 'Solicitud de prueba',
        resumen: 'Resumen de prueba',
        id_empleado: 1
      };

      mockReq.params = { id: solicitudId };
      mockReq.body = datosActualizados;

      const dbError = new Error('Database connection failed');
      updateSolicitudById.mockRejectedValue(dbError);

      await putSolicitud(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Error al actualizar solicitud'
      });
    });
  });

  describe('deleteSolicitud', () => {
    it('debería eliminar una solicitud exitosamente', async () => {
      const solicitudId = 1;

      mockReq.params = { id: solicitudId };

      const solicitud = {
        id: solicitudId,
        codigo: 'SOL-001',
        descripcion: 'Solicitud de prueba',
        resumen: 'Resumen de prueba',
        id_empleado: 1
      };

      getSolicitudById.mockResolvedValue(solicitud);
      deleteSolicitudModel.mockResolvedValue({ rowCount: 1 });

      await deleteSolicitud(mockReq, mockRes);

      expect(deleteSolicitudModel).toHaveBeenCalledWith(solicitudId);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Solicitud eliminada'
      });
    });

    it('debería fallar al eliminar solicitud inexistente', async () => {
      const solicitudId = 999;

      mockReq.params = { id: solicitudId };

      deleteSolicitudModel.mockResolvedValue({ rowCount: 0 });

      await deleteSolicitud(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Solicitud no encontrada'
      });
    });

    it('debería manejar errores de base de datos', async () => {
      const solicitudId = 1;

      mockReq.params = { id: solicitudId };

      const solicitud = {
        id: solicitudId,
        codigo: 'SOL-001',
        descripcion: 'Solicitud de prueba',
        resumen: 'Resumen de prueba',
        id_empleado: 1
      };

      getSolicitudById.mockResolvedValue(solicitud);
      const dbError = new Error('Database connection failed');
      deleteSolicitudModel.mockRejectedValue(dbError);

      await deleteSolicitud(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Error del servidor'
      });
    });
  });
}); 