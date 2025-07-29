const db = require('../config/db');

// Obtener todas las solicitudes con datos del empleado
const getSolicitudes = async () => {
  const res = await db.query(`
    SELECT 
      s.id, s.codigo, s.descripcion, s.resumen, s.id_empleado,
      e.nombre AS empleado_nombre
    FROM solicitudes s
    LEFT JOIN empleados e ON s.id_empleado = e.id
    ORDER BY s.id
  `);

  return res.rows.map(s => ({
    id: s.id,
    codigo: s.codigo,
    descripcion: s.descripcion,
    resumen: s.resumen,
    id_empleado: s.id_empleado,
    empleado: {
      id: s.id_empleado,
      nombre: s.empleado_nombre || 'No asignado'
    }
  }));
};

// Crear nueva solicitud
const createSolicitud = async ({ codigo, descripcion, resumen, id_empleado }) => {
  const insertRes = await db.query(
    `INSERT INTO solicitudes (codigo, descripcion, resumen, id_empleado)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [codigo, descripcion, resumen, id_empleado]
  );

  const solicitud = insertRes.rows[0];

  const empleadoRes = await db.query(
    `SELECT nombre FROM empleados WHERE id = $1`,
    [id_empleado]
  );

  const empleado = empleadoRes?.rows?.[0];

  return {
    id: solicitud.id,
    codigo: solicitud.codigo,
    descripcion: solicitud.descripcion,
    resumen: solicitud.resumen,
    id_empleado: solicitud.id_empleado,
    empleado: {
      id: solicitud.id_empleado,
      nombre: empleado?.nombre || 'No asignado'
    }
  };
};

// Obtener solicitud por ID
const getSolicitudById = async (id) => {
  const res = await db.query(
    'SELECT * FROM solicitudes WHERE id = $1',
    [id]
  );
  return res.rows[0];
};

// Obtener solicitudes por ID de empleado
const getSolicitudesByEmpleado = async (empleadoId) => {
  const res = await db.query(
    'SELECT * FROM solicitudes WHERE id_empleado = $1 ORDER BY id',
    [empleadoId]
  );
  return res.rows;
};

// Eliminar solicitud
const deleteSolicitud = async (id) => {
  await db.query('DELETE FROM solicitudes WHERE id = $1', [id]);
};

// Actualizar solicitud
const updateSolicitudById = async (id, { codigo, descripcion, resumen, id_empleado }) => {
  const res = await db.query(
    `UPDATE solicitudes
     SET codigo = $1,
         descripcion = $2,
         resumen = $3,
         id_empleado = $4
     WHERE id = $5
     RETURNING *`,
    [codigo, descripcion, resumen, id_empleado, id]
  );

  const updated = res.rows[0];

  if (!updated) return null;

  const empleadoRes = await db.query(
    `SELECT nombre FROM empleados WHERE id = $1`,
    [updated.id_empleado]
  );

  const empleado = empleadoRes?.rows?.[0];

  return {
    id: updated.id,
    codigo: updated.codigo,
    descripcion: updated.descripcion,
    resumen: updated.resumen,
    id_empleado: updated.id_empleado,
    empleado: {
      id: updated.id_empleado,
      nombre: empleado?.nombre || 'No asignado'
    }
  };
};

module.exports = {
  getSolicitudes,
  createSolicitud,
  getSolicitudById,
  getSolicitudesByEmpleado,
  deleteSolicitud,
  updateSolicitudById
};
