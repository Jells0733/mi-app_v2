const jwt = require('jsonwebtoken');
const { authenticateToken, authorizeRole } = require('../../src/middlewares/auth.middleware');

describe('auth.middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;
  let validToken;
  let expiredToken;
  let invalidToken;

  beforeAll(() => {
    // Configurar JWT_SECRET para pruebas
    process.env.JWT_SECRET = 'test_secret_key_for_middleware_testing';
    
    // Crear tokens de prueba
    validToken = jwt.sign(
      { userId: 1, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    expiredToken = jwt.sign(
      { userId: 1, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '-1s' }
    );

    invalidToken = 'invalid.token.here';
  });

  beforeEach(() => {
    // Resetear mocks antes de cada prueba
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  describe('authenticateToken', () => {
    it('debería permitir acceso con token válido', () => {
      mockReq.headers.authorization = `Bearer ${validToken}`;

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.userId).toBe(1);
      expect(mockReq.user.role).toBe('admin');
    });

    it('debería denegar acceso sin token', () => {
      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token no proporcionado' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería denegar acceso con token expirado', () => {
      mockReq.headers.authorization = `Bearer ${expiredToken}`;

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token inválido o expirado' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería denegar acceso con token inválido', () => {
      mockReq.headers.authorization = `Bearer ${invalidToken}`;

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token inválido o expirado' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería manejar formato de autorización incorrecto', () => {
      mockReq.headers.authorization = 'InvalidFormat token';

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token inválido o expirado' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería manejar JWT_SECRET no definido', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      mockReq.headers.authorization = `Bearer ${validToken}`;

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        error: 'Error del servidor: configuración incompleta' 
      });
      expect(mockNext).not.toHaveBeenCalled();

      // Restaurar JWT_SECRET
      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe('authorizeRole', () => {
    beforeEach(() => {
      // Configurar usuario autenticado
      mockReq.user = { userId: 1, role: 'admin' };
    });

    it('debería permitir acceso a admin para rol admin', () => {
      const adminOnly = authorizeRole(['admin']);

      adminOnly(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('debería permitir acceso a admin para múltiples roles', () => {
      const adminOrEmpleado = authorizeRole(['admin', 'empleado']);

      adminOrEmpleado(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('debería denegar acceso a empleado para rol admin', () => {
      mockReq.user.role = 'empleado';
      const adminOnly = authorizeRole(['admin']);

      adminOnly(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        error: 'Acceso denegado: rol no autorizado' 
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería denegar acceso sin usuario autenticado', () => {
      delete mockReq.user;
      const adminOnly = authorizeRole(['admin']);

      adminOnly(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        error: 'Acceso denegado: rol no autorizado' 
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería denegar acceso con rol no autorizado', () => {
      mockReq.user.role = 'invitado';
      const adminOnly = authorizeRole(['admin', 'empleado']);

      adminOnly(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        error: 'Acceso denegado: rol no autorizado' 
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
}); 