// tests/unit/solicitudModel.test.js
const {
  createSolicitud,
  getSolicitudes,
  getSolicitudById,
  updateSolicitudById,
  deleteSolicitud,
  getSolicitudesByEmpleado
} = require('../../src/models/solicitudModel');

// Mock de la base de datos
jest.mock('../../src/config/db', () => ({
  query: jest.fn()
}));

const db = require('../../src/config/db');

describe('solicitudModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSolicitud', () => {
    it('debería crear una solicitud exitosamente', async () => {
      const solicitudData = {
        codigo: 'SOL-001',
        descripcion: 'Solicitud de prueba',
        resumen: 'Resumen de la solicitud',
        id_empleado: 1
      };

      const expectedSolicitud = {
        id: 1,
        ...solicitudData,
        empleado: {
          id: 1,
          nombre: 'No asignado'
        }
      };

      db.query.mockResolvedValueOnce({ rows: [expectedSolicitud] });

      const result = await createSolicitud(solicitudData);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO solicitudes'),
        [solicitudData.codigo, solicitudData.descripcion, solicitudData.resumen, solicitudData.id_empleado]
      );
      expect(result).toEqual(expectedSolicitud);
    });

    it('debería manejar errores de base de datos', async () => {
      const solicitudData = {
        codigo: 'SOL-001',
        descripcion: 'Solicitud de prueba',
        resumen: 'Resumen de la solicitud',
        id_empleado: 1
      };

      const dbError = new Error('Database connection failed');
      db.query.mockRejectedValueOnce(dbError);

      await expect(createSolicitud(solicitudData)).rejects.toThrow('Database connection failed');
    });

    it('debería manejar errores de validación', async () => {
      const solicitudData = {
        codigo: '', // código vacío
        descripcion: 'Solicitud de prueba',
        resumen: 'Resumen de la solicitud',
        id_empleado: 1
      };

      const validationError = new Error('Invalid solicitud data');
      db.query.mockRejectedValueOnce(validationError);

      await expect(createSolicitud(solicitudData)).rejects.toThrow('Invalid solicitud data');
    });
  });

  describe('getSolicitudes', () => {
    it('debería obtener todas las solicitudes', async () => {
      const solicitudes = [
        {
          id: 1,
          codigo: 'SOL-001',
          descripcion: 'Solicitud 1',
          resumen: 'Resumen 1',
          id_empleado: 1,
          empleado: {
            id: 1,
            nombre: 'No asignado'
          }
        },
        {
          id: 2,
          codigo: 'SOL-002',
          descripcion: 'Solicitud 2',
          resumen: 'Resumen 2',
          id_empleado: 2,
          empleado: {
            id: 2,
            nombre: 'No asignado'
          }
        }
      ];

      db.query.mockResolvedValueOnce({ rows: solicitudes });

      const result = await getSolicitudes();

      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT'));
      expect(result).toEqual(solicitudes);
    });

    it('debería retornar array vacío cuando no hay solicitudes', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const result = await getSolicitudes();

      expect(result).toEqual([]);
    });

    it('debería manejar errores de base de datos', async () => {
      const dbError = new Error('Database connection failed');
      db.query.mockRejectedValueOnce(dbError);

      await expect(getSolicitudes()).rejects.toThrow('Database connection failed');
    });
  });

  describe('getSolicitudById', () => {
    it('debería obtener una solicitud por ID', async () => {
      const solicitudId = 1;
      const solicitud = {
        id: solicitudId,
        codigo: 'SOL-001',
        descripcion: 'Solicitud de prueba',
        resumen: 'Resumen de la solicitud',
        id_empleado: 1
      };

      db.query.mockResolvedValueOnce({ rows: [solicitud] });

      const result = await getSolicitudById(solicitudId);

      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM solicitudes WHERE id = $1',
        [solicitudId]
      );
      expect(result).toEqual(solicitud);
    });

    it('debería retornar null cuando la solicitud no existe', async () => {
      const solicitudId = 999;

      db.query.mockResolvedValueOnce({ rows: [] });

      const result = await getSolicitudById(solicitudId);

      expect(result).toBeUndefined();
    });

    it('debería manejar errores de base de datos', async () => {
      const solicitudId = 1;
      const dbError = new Error('Database connection failed');

      db.query.mockRejectedValueOnce(dbError);

      await expect(getSolicitudById(solicitudId)).rejects.toThrow('Database connection failed');
    });
  });

  describe('getSolicitudesByEmpleado', () => {
    it('debería obtener solicitudes por ID de empleado', async () => {
      const empleadoId = 1;
      const solicitudes = [
        {
          id: 1,
          codigo: 'SOL-001',
          descripcion: 'Solicitud del empleado 1',
          resumen: 'Resumen 1',
          id_empleado: empleadoId
        },
        {
          id: 2,
          codigo: 'SOL-002',
          descripcion: 'Solicitud del empleado 1',
          resumen: 'Resumen 2',
          id_empleado: empleadoId
        }
      ];

      db.query.mockResolvedValueOnce({ rows: solicitudes });

      const result = await getSolicitudesByEmpleado(empleadoId);

      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM solicitudes WHERE id_empleado = $1 ORDER BY id',
        [empleadoId]
      );
      expect(result).toEqual(solicitudes);
    });

    it('debería retornar array vacío cuando no hay solicitudes para el empleado', async () => {
      const empleadoId = 999;

      db.query.mockResolvedValueOnce({ rows: [] });

      const result = await getSolicitudesByEmpleado(empleadoId);

      expect(result).toEqual([]);
    });
  });

  describe('updateSolicitudById', () => {
    it('debería actualizar una solicitud exitosamente', async () => {
      const solicitudId = 1;
      const updateData = {
        codigo: 'SOL-001-UPDATED',
        descripcion: 'Solicitud actualizada',
        resumen: 'Resumen actualizado'
      };

      const updatedSolicitud = {
        id: solicitudId,
        ...updateData,
        id_empleado: 1,
        empleado: {
          id: 1,
          nombre: 'No asignado'
        }
      };

      db.query.mockResolvedValueOnce({ rows: [updatedSolicitud] });

      const result = await updateSolicitudById(solicitudId, updateData);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE solicitudes'),
        [updateData.codigo, updateData.descripcion, updateData.resumen, updateData.id_empleado, solicitudId]
      );
      expect(result).toEqual(updatedSolicitud);
    });

    it('debería manejar errores cuando la solicitud no existe', async () => {
      const solicitudId = 999;
      const updateData = {
        codigo: 'SOL-INEXISTENTE',
        descripcion: 'Solicitud inexistente',
        resumen: 'Resumen inexistente'
      };

      db.query.mockResolvedValueOnce({ rows: [] });

      const result = await updateSolicitudById(solicitudId, updateData);

      expect(result).toBeNull();
    });

    it('debería manejar errores de base de datos', async () => {
      const solicitudId = 1;
      const updateData = {
        codigo: 'SOL-001',
        descripcion: 'Solicitud de prueba',
        resumen: 'Resumen de prueba'
      };

      const dbError = new Error('Database connection failed');
      db.query.mockRejectedValueOnce(dbError);

      await expect(updateSolicitudById(solicitudId, updateData)).rejects.toThrow('Database connection failed');
    });
  });

  describe('deleteSolicitud', () => {
    it('debería eliminar una solicitud exitosamente', async () => {
      const solicitudId = 1;

      db.query.mockResolvedValueOnce({ rowCount: 1 });

      await deleteSolicitud(solicitudId);

      expect(db.query).toHaveBeenCalledWith(
        'DELETE FROM solicitudes WHERE id = $1',
        [solicitudId]
      );
    });

    it('debería manejar cuando la solicitud no existe', async () => {
      const solicitudId = 999;

      db.query.mockResolvedValueOnce({ rowCount: 0 });

      await deleteSolicitud(solicitudId);

      expect(db.query).toHaveBeenCalledWith(
        'DELETE FROM solicitudes WHERE id = $1',
        [solicitudId]
      );
    });

    it('debería manejar errores de base de datos', async () => {
      const solicitudId = 1;
      const dbError = new Error('Database connection failed');

      db.query.mockRejectedValueOnce(dbError);

      await expect(deleteSolicitud(solicitudId)).rejects.toThrow('Database connection failed');
    });
  });
});
