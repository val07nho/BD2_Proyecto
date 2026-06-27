const { getOracleConnection, outFormat } = require("../config/oracle");

function normalizeEstado(estado) {
  const value = String(estado || "DISPONIBLE").toUpperCase();
  if (["DISPONIBLE", "OCUPADA", "MANTENIMIENTO"].includes(value)) {
    return value;
  }
  return "DISPONIBLE";
}

async function listHabitaciones(req, res, next) {
  let connection;
  try {
    connection = await getOracleConnection();
    const result = await connection.execute(
      `SELECT
         ID_HABITACION,
         NUMERO AS NUMERO_HABITACION,
         TIPO,
         PRECIO_NOCHE,
         CAPACIDAD,
         INITCAP(ESTADO) AS ESTADO,
         DESCRIPCION
       FROM HABITACION
       ORDER BY ID_HABITACION`,
      [],
      { outFormat }
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function createHabitacion(req, res, next) {
  let connection;
  try {
    const {
      numero_habitacion,
      numero,
      tipo,
      precio_noche,
      capacidad,
      estado,
      descripcion
    } = req.body;
    connection = await getOracleConnection();

    await connection.execute(
      `INSERT INTO HABITACION (ID_HABITACION, NUMERO, TIPO, PRECIO_NOCHE, CAPACIDAD, ESTADO, DESCRIPCION)
       VALUES (SEQ_HABITACION.NEXTVAL, :numero, :tipo, :precio_noche, :capacidad, :estado, :descripcion)`,
      {
        numero: numero || numero_habitacion,
        tipo,
        precio_noche,
        capacidad,
        estado: normalizeEstado(estado),
        descripcion: descripcion || null
      },
      { autoCommit: true }
    );

    res.status(201).json({ message: "Habitacion creada" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function updateHabitacion(req, res, next) {
  let connection;
  try {
    const { id } = req.params;
    const {
      numero_habitacion,
      numero,
      tipo,
      precio_noche,
      capacidad,
      estado,
      descripcion
    } = req.body;
    connection = await getOracleConnection();

    const result = await connection.execute(
      `UPDATE HABITACION
       SET NUMERO = :numero,
           TIPO = :tipo,
           PRECIO_NOCHE = :precio_noche,
           CAPACIDAD = :capacidad,
           ESTADO = :estado,
           DESCRIPCION = :descripcion
       WHERE ID_HABITACION = :id`,
      {
        id: Number(id),
        numero: numero || numero_habitacion,
        tipo,
        precio_noche,
        capacidad,
        estado: normalizeEstado(estado),
        descripcion: descripcion || null
      },
      { autoCommit: true }
    );

    if (!result.rowsAffected) {
      return res.status(404).json({ message: "Habitacion no encontrada" });
    }

    res.json({ message: "Habitacion actualizada" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function deleteHabitacion(req, res, next) {
  let connection;
  try {
    const { id } = req.params;
    connection = await getOracleConnection();

    const result = await connection.execute(
      "DELETE FROM HABITACION WHERE ID_HABITACION = :id",
      { id: Number(id) },
      { autoCommit: true }
    );

    if (!result.rowsAffected) {
      return res.status(404).json({ message: "Habitacion no encontrada" });
    }

    res.json({ message: "Habitacion eliminada" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  listHabitaciones,
  createHabitacion,
  updateHabitacion,
  deleteHabitacion
};
