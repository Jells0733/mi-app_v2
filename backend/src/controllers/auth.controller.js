const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, getUserByEmail } = require('../models/userModel');
const { createEmpleado, getEmpleadoByUserId } = require('../models/empleadoModel');

const register = async (req, res) => {
  const { username, email, password, role, salario } = req.body;


  if (!username || !email || !password || !role) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser({ username, email, password: hashedPassword, role });

    if (role === 'empleado') {

      
      // Validar que el salario sea un número válido
      const salarioValido = salario && !isNaN(Number(salario)) && Number(salario) > 0 ? Number(salario) : null;
      // console.log('🔍 Salario validado:', salarioValido);
      
      await createEmpleado({
        nombre: username,
        fecha_ingreso: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
        salario: salarioValido,
        id_usuario: user.id,
      });
    }

    res.status(201).json({
      id: user.id,
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Usuario o correo ya registrado' });
    }
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }

  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Validación adicional para empleados
    if (user.role === 'empleado') {
      const empleado = await getEmpleadoByUserId(user.id);
      if (!empleado) {
        return res.status(403).json({ error: 'No se pudo identificar tu registro de empleado' });
      }
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('Falta JWT_SECRET en el entorno');
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

module.exports = { register, login };
