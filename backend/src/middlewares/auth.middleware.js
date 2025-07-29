const jwt = require('jsonwebtoken');

// Middleware para verificar token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET no está definido');
    return res.status(500).json({ error: 'Error del servidor: configuración incompleta' });
  }

jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
  if (err) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }

  // decoded debería contener: { userId, role, iat, exp }
  req.user = decoded;
  next();
});
};

// Middleware para autorizar por uno o varios roles
const authorizeRole = (allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Acceso denegado: rol no autorizado' });
  }
  next();
};

module.exports = {
  authenticateToken,
  authorizeRole,
};
