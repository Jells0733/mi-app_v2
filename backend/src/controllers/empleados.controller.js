const {
  getEmpleados: getAll,
  createEmpleado,
  updateEmpleadoById,
  deleteEmpleadoById,
  getEmpleadoById
} = require('../models/empleadoModel');

// Obtener empleados con paginación y filtro por nombre
const getEmpleados = async (req, res) => {
  let { page = 1, limit = 10, nombre = '' } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1 || limit > 100) limit = 10;

  try {
    const allEmpleados = await getAll();
    const filtered = allEmpleados.filter(e =>
      e.nombre.toLowerCase().includes(nombre.toLowerCase())
    );

    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);

    res.json({
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
      data: paginated,
    });
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ error: 'Error al obtener empleados' });
  }
};

// Crear nuevo empleado
const postEmpleado = async (req, res) => {
  const { nombre, fecha_ingreso, salario } = req.body;

  if (!nombre || !fecha_ingreso || !salario) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const nuevo = await createEmpleado({ nombre, fecha_ingreso, salario });
    res.status(201).json(nuevo);
  } catch (error) {
    console.error('Error al crear empleado:', error);
    res.status(500).json({ error: 'Error al crear empleado' });
  }
};

// Actualizar empleado
const updateEmpleado = async (req, res) => {
  const { id } = req.params;
  const { nombre, fecha_ingreso, salario } = req.body;

  if (!nombre || !fecha_ingreso || !salario) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const empleado = await getEmpleadoById(id);
    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    const actualizado = await updateEmpleadoById(id, { nombre, fecha_ingreso, salario });
    res.json(actualizado);
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    res.status(500).json({ error: 'Error al actualizar empleado' });
  }
};

// Eliminar empleado
const deleteEmpleado = async (req, res) => {
  const { id } = req.params;

  try {
    const empleado = await getEmpleadoById(id);
    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    await deleteEmpleadoById(id);
    res.json({ message: 'Empleado eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    res.status(500).json({ error: 'Error al eliminar empleado' });
  }
};

module.exports = {
  getEmpleados,
  createEmpleado: postEmpleado,
  updateEmpleado,
  deleteEmpleado,
};
