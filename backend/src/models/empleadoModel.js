const db = require('../config/db');

// Obtener todos los empleados
const getEmpleados = async () => {
  const res = await db.query('SELECT * FROM empleados ORDER BY id');
  return res.rows;
};

// Crear un nuevo empleado
const createEmpleado = async ({ nombre, fecha_ingreso, salario, id_usuario = null }) => {
  const res = await db.query(
    `INSERT INTO empleados (nombre, fecha_ingreso, salario, id_usuario)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [nombre, fecha_ingreso, salario, id_usuario]
  );
  return res.rows[0];
};

// Obtener el ID del empleado por id_usuario
const getEmpleadoIdByUsuario = async (userId) => {
  const res = await db.query(
    'SELECT id FROM empleados WHERE id_usuario = $1',
    [userId]
  );
  return res.rows[0]?.id || null;
};

// Obtener empleado por ID
const getEmpleadoById = async (id) => {
  const res = await db.query(
    'SELECT * FROM empleados WHERE id = $1',
    [id]
  );
  return res.rows[0];
};

// Obtener todos los datos del empleado por id_usuario
const getEmpleadoByUserId = async (userId) => {
  const res = await db.query(
    'SELECT * FROM empleados WHERE id_usuario = $1',
    [userId]
  );
  return res.rows[0] || null;
};

// Actualizar empleado por ID
const updateEmpleadoById = async (id, { nombre, fecha_ingreso, salario }) => {
  const res = await db.query(
    `UPDATE empleados
     SET nombre = $1,
         fecha_ingreso = $2,
         salario = $3
     WHERE id = $4
     RETURNING *`,
    [nombre, fecha_ingreso, salario, id]
  );
  return res.rows[0];
};

// Eliminar empleado por ID
const deleteEmpleadoById = async (id) => {
  const res = await db.query(
    'DELETE FROM empleados WHERE id = $1 RETURNING *',
    [id]
  );
  return res?.rows?.[0] || null;
};

module.exports = {
  getEmpleados,
  createEmpleado,
  getEmpleadoIdByUsuario,
  getEmpleadoById,
  getEmpleadoByUserId,
  updateEmpleadoById,
  deleteEmpleadoById,
};
