// src/services/solicitudService.js
import api from './api';

const authHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

/**
 * Obtener todas las solicitudes desde la API.
 * Maneja estructura de respuesta como lista directa o paginada.
 */
export const getSolicitudes = async (token) => {
  try {
    const res = await api.get('/solicitudes', authHeader(token));
    const data = res.data;

    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;

    console.warn('Respuesta inesperada de solicitudes:', data);
    return [];
  } catch (err) {
    console.error('Error al obtener solicitudes:', err);
    return [];
  }
};

/**
 * Crear una nueva solicitud.
 */
export const createSolicitud = async (solicitud, token) => {
  try {
    const res = await api.post('/solicitudes', solicitud, authHeader(token));
    return res.data;
  } catch (err) {
    console.error('Error al crear solicitud:', err);
    return null;
  }
};

/**
 * Eliminar una solicitud por ID.
 */
export const deleteSolicitud = async (id, token) => {
  try {
    const res = await api.delete(`/solicitudes/${id}`, authHeader(token));
    return res.data;
  } catch (err) {
    console.error('Error al eliminar solicitud:', err);
    return null;
  }
};

/**
 * Actualizar una solicitud existente por ID.
 */
export const updateSolicitud = async (id, solicitud, token) => {
  try {
    const res = await api.put(`/solicitudes/${id}`, solicitud, authHeader(token));
    return res.data;
  } catch (err) {
    console.error('Error al actualizar solicitud:', err);
    return null;
  }
};
