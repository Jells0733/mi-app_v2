import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { loginUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(email, password);
      if (res.token) {
        login(res.user, res.token);
        navigate('/');
      } else {
        alert(res.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      alert('Error inesperado. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <form onSubmit={handleSubmit}>
        <h2>Iniciar Sesión</h2>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Entrar'}
        </button>
      </form>
    </main>
  );
};

export default Login;
