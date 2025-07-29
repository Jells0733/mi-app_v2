const {
  getSolicitudes: getAll,
  createSolicitud: createOne,
  deleteSolicitud: deleteOne,
  updateSolicitudById,
  getSolicitudById
} = require('../models/solicitudModel');

const { getEmpleadoByUserId } = require('../models/empleadoModel');

const getSolicitudes = async (req, res) => {
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1 || limit > 100) limit = 10;

  try {
    const all = await getAll();
    const offset = (page - 1) * limit;
    const paginated = all.slice(offset, offset + limit);

    res.json({
      page,
      limit,
      total: all.length,
      totalPages: Math.ceil(all.length / limit),
      data: paginated,
    });
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

const createSolicitud = async (req, res) => {
  const { codigo, descripcion, resumen, id_empleado } = req.body;
  const { userId, role } = req.user;

  if (!codigo || !descripcion || !resumen) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    let empleadoId;

    if (role === 'admin') {
      if (!id_empleado) {
        return res.status(400).json({ error: 'El admin debe especificar un id_empleado' });
      }
      empleadoId = id_empleado;
    } else {
      const empleado = await getEmpleadoByUserId(userId);
      if (!empleado) {
        return res.status(403).json({ error: 'No se encontró empleado asociado al usuario' });
      }
      empleadoId = empleado.id;
    }

    const nueva = await createOne({
      id_empleado: empleadoId,
      codigo,
      descripcion,
      resumen
    });

    res.status(201).json(nueva);
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

const deleteSolicitud = async (req, res) => {
  const { id } = req.params;
  const { role } = req.user;

  if (role !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores pueden eliminar solicitudes' });
  }

  try {
    const solicitud = await getSolicitudById(id);
    if (!solicitud) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    await deleteOne(id);
    res.json({ mensaje: 'Solicitud eliminada' });
  } catch (error) {
    console.error('Error al eliminar solicitud:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

const putSolicitud = async (req, res) => {
  const { id } = req.params;
  const { codigo, descripcion, resumen, id_empleado } = req.body;

  if (!codigo || !descripcion || !resumen || !id_empleado) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const actualizada = await updateSolicitudById(id, { codigo, descripcion, resumen, id_empleado });
    if (!actualizada) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    res.json(actualizada);
  } catch (error) {
    console.error('Error al actualizar solicitud:', error);
    res.status(500).json({ error: 'Error al actualizar solicitud' });
  }
};

module.exports = {
  getSolicitudes,
  createSolicitud,
  deleteSolicitud,
  putSolicitud,
};
