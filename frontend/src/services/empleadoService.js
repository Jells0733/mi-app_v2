import api from './api';

const authHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

/**
 * Obtener empleados desde la API.
 * Devuelve un array de empleados o un array vacío si falla o no es válido.
 */
export const getEmpleados = async (token) => {
  try {
    const res = await api.get('/empleados', authHeader(token));
    const data = res.data;

    // Soporta respuesta directa o paginada
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;

    console.warn('Respuesta inesperada de empleados:', data);
    return [];
  } catch (err) {
    console.error('Error al obtener empleados:', err?.response?.data || err.message);
    return [];
  }
};

/**
 * Crear un nuevo empleado en la base de datos.
 * Devuelve el empleado creado o null si falla.
 */
export const createEmpleado = async (empleado, token) => {
  try {
    const res = await api.post('/empleados', empleado, authHeader(token));
    const data = res.data;

    if (!data || !data.id) {
      console.warn('Empleado creado sin ID. Respuesta:', data);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error al crear empleado:', err?.response?.data || err.message);
    return null;
  }
};
export const updateEmpleado = async (id, data, token) => {
  try {
    const res = await api.put(`/empleados/${id}`, data, authHeader(token));
    return res.data;
  } catch (err) {
    console.error('Error al actualizar empleado:', err?.response?.data || err.message);
    return null;
  }
};