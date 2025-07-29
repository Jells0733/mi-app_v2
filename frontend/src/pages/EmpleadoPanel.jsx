import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getSolicitudes, createSolicitud } from '../services/solicitudService';
import { useNavigate } from 'react-router-dom';

const EmpleadoPanel = () => {
  const { user, token } = useContext(AuthContext);
  const [solicitudes, setSolicitudes] = useState([]);
  const [form, setForm] = useState({ codigo: '', descripcion: '', resumen: '' });
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'empleado') {
      navigate('/');
      return;
    }

    const fetchSolicitudes = async () => {
      try {
        const todas = await getSolicitudes(token);
        // Solo mostrar las propias (asumiendo que backend incluye nombre del empleado)
        const propias = todas.filter(s => s.empleado === user.username);
        setSolicitudes(propias);
      } catch (error) {
        console.error('Error al cargar solicitudes:', error.message);
        setMensaje('No se pudieron cargar tus solicitudes.');
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, [user, token, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.codigo.trim() || !form.descripcion.trim() || !form.resumen.trim()) {
      alert('Todos los campos son obligatorios');
      return;
    }

    try {
      const nueva = await createSolicitud(form, token);
      setSolicitudes([nueva, ...solicitudes]);
      setForm({ codigo: '', descripcion: '', resumen: '' });
      setMensaje('Solicitud enviada con éxito.');
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
      alert('No se pudo enviar la solicitud. Intenta nuevamente.');
    }
  };

  if (loading) return <p>Cargando tus solicitudes...</p>;

  return (
    <div className="panel">
      <h2>Bienvenido, {user.username}</h2>

      <section className="panel-section">
        <h3>Crear nueva solicitud</h3>
        <form onSubmit={handleSubmit}>
          <label htmlFor="codigo">Código</label>
          <input
            id="codigo"
            name="codigo"
            placeholder="Ej: SOL-001"
            value={form.codigo}
            onChange={handleChange}
            required
          />

          <label htmlFor="descripcion">Descripción</label>
          <input
            id="descripcion"
            name="descripcion"
            placeholder="Ej: Solicitud de materiales"
            value={form.descripcion}
            onChange={handleChange}
            required
          />

          <label htmlFor="resumen">Resumen</label>
          <input
            id="resumen"
            name="resumen"
            placeholder="Ej: Reposición de insumos para el área"
            value={form.resumen}
            onChange={handleChange}
            required
          />

          <button type="submit">Enviar solicitud</button>
        </form>

        {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      </section>

      <section className="panel-section">
        <h3>Mis solicitudes</h3>
        {solicitudes.length === 0 ? (
          <p>Aún no has enviado ninguna solicitud.</p>
        ) : (
          <ul>
            {solicitudes.map((s) => (
              <li key={s.id}>
                <strong>{s.codigo}</strong>: {s.descripcion} — {s.resumen}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default EmpleadoPanel;
