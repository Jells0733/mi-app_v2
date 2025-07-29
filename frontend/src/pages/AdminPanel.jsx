// src/components/AdminPanel.jsx
import React, { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getEmpleados, createEmpleado, updateEmpleado } from '../services/empleadoService';
import {
  getSolicitudes,
  createSolicitud,
  updateSolicitud,
  deleteSolicitud,
} from '../services/solicitudService';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const { user, token } = useContext(AuthContext);
  const [empleados, setEmpleados] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [nuevoEmpleado, setNuevoEmpleado] = useState({ nombre: '', fecha_ingreso: '', salario: '' });
  const [nuevaSolicitud, setNuevaSolicitud] = useState({ codigo: '', descripcion: '', resumen: '', id_empleado: '' });

  const [modoEdicion, setModoEdicion] = useState(false);
  const [empleadoEditando, setEmpleadoEditando] = useState(null);

  const [modoEdicionSolicitud, setModoEdicionSolicitud] = useState(false);
  const [solicitudEditando, setSolicitudEditando] = useState(null);

  // Referencias para scroll y focus
  const empleadoFormRef = useRef(null);
  const solicitudFormRef = useRef(null);
  const nombreInputRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const empleadosData = await getEmpleados(token);
        const solicitudesData = await getSolicitudes(token);
        setEmpleados(empleadosData);
        setSolicitudes(solicitudesData);
      } catch (err) {
        console.error('Error al obtener datos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token, navigate]);

  const handleEmpleadoChange = (e) => setNuevoEmpleado({ ...nuevoEmpleado, [e.target.name]: e.target.value });
  const handleSolicitudChange = (e) => setNuevaSolicitud({ ...nuevaSolicitud, [e.target.name]: e.target.value });

  const handleCrearEmpleado = async (e) => {
    e.preventDefault();
    const { nombre, fecha_ingreso, salario } = nuevoEmpleado;
    if (!nombre || !fecha_ingreso) return alert('Nombre y fecha de ingreso son obligatorios');
    if (!salario || salario <= 0) return alert('El salario debe ser mayor a 0');

    try {
      const nuevo = await createEmpleado(nuevoEmpleado, token);
      if (nuevo) {
        setEmpleados([...empleados, nuevo]);
        setNuevoEmpleado({ nombre: '', fecha_ingreso: '', salario: '' });
        alert('Empleado creado exitosamente');
      } else {
        alert('Error al crear el empleado');
      }
    } catch (err) {
      console.error(err);
      alert('Error al registrar el empleado');
    }
  };

  const handleEditarEmpleado = (emp) => {
    setModoEdicion(true);
    setEmpleadoEditando(emp);
    setNuevoEmpleado({ 
      nombre: emp.nombre, 
      fecha_ingreso: emp.fecha_ingreso ? emp.fecha_ingreso.split('T')[0] : '', 
      salario: emp.salario ? emp.salario.toString() : '' 
    });
    
    // Scroll suave al formulario y focus en el primer campo
    setTimeout(() => {
      empleadoFormRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      nombreInputRef.current?.focus();
    }, 100);
  };

  const handleActualizarEmpleado = async (e) => {
    e.preventDefault();
    const { nombre, fecha_ingreso, salario } = nuevoEmpleado;
    if (!nombre || !fecha_ingreso) return alert('Nombre y fecha de ingreso son obligatorios');
    if (!salario || salario <= 0) return alert('El salario debe ser mayor a 0');

    try {
      const actualizado = await updateEmpleado(empleadoEditando.id, nuevoEmpleado, token);
      if (actualizado) {
        setEmpleados(empleados.map((emp) => (emp.id === actualizado.id ? actualizado : emp)));
        setModoEdicion(false);
        setEmpleadoEditando(null);
        setNuevoEmpleado({ nombre: '', fecha_ingreso: '', salario: '' });
        alert('Empleado actualizado exitosamente');
        
        // Scroll hacia arriba después de actualizar
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert('Error al actualizar el empleado');
      }
    } catch (err) {
      console.error(err);
      alert('Error al actualizar el empleado');
    }
  };

  const handleCrearSolicitud = async (e) => {
    e.preventDefault();
    const { codigo, descripcion, resumen, id_empleado } = nuevaSolicitud;
    if (!codigo || !descripcion || !resumen || !id_empleado) return alert('Todos los campos de la solicitud son obligatorios');

    try {
      const nueva = await createSolicitud(nuevaSolicitud, token);
      setSolicitudes([...solicitudes, nueva]);
      setNuevaSolicitud({ codigo: '', descripcion: '', resumen: '', id_empleado: '' });
    } catch (err) {
      console.error(err);
      alert('Error al crear solicitud');
    }
  };

  const handleEditarSolicitud = (s) => {
    setModoEdicionSolicitud(true);
    setSolicitudEditando(s);
    setNuevaSolicitud({ codigo: s.codigo, descripcion: s.descripcion, resumen: s.resumen, id_empleado: s.id_empleado });
    
    // Scroll suave al formulario de solicitudes
    setTimeout(() => {
      solicitudFormRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  };

  const handleActualizarSolicitud = async (e) => {
    e.preventDefault();
    const actualizada = await updateSolicitud(solicitudEditando.id, nuevaSolicitud, token);
    if (actualizada) {
      setSolicitudes(solicitudes.map(s => (s.id === actualizada.id ? actualizada : s)));
      setModoEdicionSolicitud(false);
      setSolicitudEditando(null);
      setNuevaSolicitud({ codigo: '', descripcion: '', resumen: '', id_empleado: '' });
      alert('Solicitud actualizada exitosamente');
      
      // Scroll hacia arriba después de actualizar
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert('Error al actualizar la solicitud');
    }
  };

  const handleDelete = async (id) => {
    await deleteSolicitud(id, token);
    setSolicitudes((prev) => prev.filter((s) => s.id !== id));
  };

  if (loading) return <p>Cargando datos...</p>;

  return (
    <div className="panel admin-panel">
      <h2>Panel del Administrador</h2>

      <section className={`panel-section ${modoEdicion ? 'editing-mode' : ''}`} ref={empleadoFormRef}>
        <h3>{modoEdicion ? '✏️ Editar Empleado' : '➕ Crear nuevo Empleado'}</h3>
        <form onSubmit={modoEdicion ? handleActualizarEmpleado : handleCrearEmpleado}>
          <input 
            ref={nombreInputRef}
            name="nombre" 
            placeholder="Nombre completo" 
            value={nuevoEmpleado.nombre} 
            onChange={handleEmpleadoChange} 
            required
          />
          <input 
            name="fecha_ingreso" 
            type="date" 
            value={nuevoEmpleado.fecha_ingreso} 
            onChange={handleEmpleadoChange} 
            required
          />
          <input 
            name="salario" 
            type="number" 
            placeholder="Salario (ej: 3000000)" 
            value={nuevoEmpleado.salario} 
            onChange={handleEmpleadoChange} 
            min="1"
            required
          />
          <button type="submit">{modoEdicion ? 'Guardar cambios' : 'Crear Empleado'}</button>
          {modoEdicion && (
            <button 
              type="button"
              onClick={() => { 
                setModoEdicion(false); 
                setEmpleadoEditando(null); 
                setNuevoEmpleado({ nombre: '', fecha_ingreso: '', salario: '' }); 
                // Scroll hacia arriba al cancelar
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Cancelar
            </button>
          )}
        </form>
      </section>

      <section className={`panel-section ${modoEdicionSolicitud ? 'editing-mode' : ''}`} ref={solicitudFormRef}>
        <h3>{modoEdicionSolicitud ? '✏️ Editar Solicitud' : '➕ Crear nueva Solicitud'}</h3>
        <form onSubmit={modoEdicionSolicitud ? handleActualizarSolicitud : handleCrearSolicitud}>
          <input name="codigo" placeholder="Código" value={nuevaSolicitud.codigo} onChange={handleSolicitudChange} />
          <input name="descripcion" placeholder="Descripción" value={nuevaSolicitud.descripcion} onChange={handleSolicitudChange} />
          <input name="resumen" placeholder="Resumen" value={nuevaSolicitud.resumen} onChange={handleSolicitudChange} />
          <select name="id_empleado" value={nuevaSolicitud.id_empleado} onChange={handleSolicitudChange}>
            <option value="">Selecciona un empleado</option>
            {empleados.map(emp => <option key={emp.id} value={emp.id}>{emp.nombre}</option>)}
          </select>
          <button type="submit">{modoEdicionSolicitud ? 'Actualizar' : 'Crear'}</button>
          {modoEdicionSolicitud && (
            <button 
              type="button"
              onClick={() => { 
                setModoEdicionSolicitud(false); 
                setSolicitudEditando(null); 
                setNuevaSolicitud({ codigo: '', descripcion: '', resumen: '', id_empleado: '' }); 
                // Scroll hacia arriba al cancelar
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Cancelar
            </button>
          )}
        </form>
      </section>

      <section className="panel-section">
        <h3>Empleados</h3>
        <ul>
          {empleados.map(emp => (
            <li key={emp.id}>
              <div>
                <strong>{emp.nombre}</strong> — 
                Fecha: {emp.fecha_ingreso ? emp.fecha_ingreso.split('T')[0] : 'No definida'} — 
                Salario: {emp.salario ? `$${Number(emp.salario).toLocaleString()}` : 'No definido'}
              </div>
              <button onClick={() => handleEditarEmpleado(emp)}>Editar</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel-section">
        <h3>Solicitudes</h3>
        <ul>
          {solicitudes.map(s => (
            <li key={s.id}>
              <div>
                <strong>{s.codigo}</strong>: {s.descripcion} — {s.resumen} — Empleado: {s.empleado?.nombre || 'No asignado'}
              </div>
              <div>
                <button onClick={() => handleEditarSolicitud(s)}>Editar</button>
                <button onClick={() => handleDelete(s.id)}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AdminPanel;
