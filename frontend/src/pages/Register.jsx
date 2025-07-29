import React, { useState } from 'react';
import { registerUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'empleado',
    salario: '', // usado si es empleado
    nombre: '',
  });

  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isFormInvalid =
    !form.username.trim() ||
    !form.email.trim() ||
    !form.password.trim() ||
    !form.role ||
    (form.role === 'empleado' && (!form.nombre.trim() || !form.salario || Number(form.salario) <= 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFormInvalid) {
      setMensaje('Todos los campos obligatorios deben completarse.');
      return;
    }

    setEnviando(true);
    setMensaje('');

    // Fecha actual en formato YYYY-MM-DD
    const fecha_ingreso = new Date().toISOString().split('T')[0];

    const payload = {
      ...form,
      nombre: form.nombre || form.username,
      fecha_ingreso,
      // Convertir salario a número si existe, sino undefined
      salario: form.salario ? Number(form.salario) : undefined,
    };



    try {
      const res = await registerUser(payload);
      if (res.id) {
        setMensaje('Usuario creado con éxito. Redirigiendo...');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setMensaje(res.error || '❌ Error desconocido al registrarse.');
      }
    } catch (error) {
      console.error('Error al registrarse:', error);
      setMensaje('Fallo en la conexión con el servidor');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main>
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Registro</h2>
        <input
          name="username"
          placeholder="Usuario"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Correo"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          required
        />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="empleado">Empleado</option>
          <option value="admin">Administrador</option>
        </select>

        {form.role === 'empleado' && (
          <>
            <input
              name="nombre"
              placeholder="Nombre completo"
              value={form.nombre}
              onChange={handleChange}
              required
            />
            <input
              name="salario"
              type="number"
              placeholder="Salario inicial (ej: 3000000)"
              value={form.salario}
              onChange={handleChange}
              min="1"
              required
            />
          </>
        )}

        <button type="submit" disabled={isFormInvalid || enviando}>
          {enviando ? 'Registrando...' : 'Registrarse'}
        </button>

        {mensaje && <p style={{ marginTop: '1rem' }}>{mensaje}</p>}
      </form>
    </main>
  );
};

export default Register;
