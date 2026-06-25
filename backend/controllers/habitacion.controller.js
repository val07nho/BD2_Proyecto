const { getOracleConnection, outFormat } = require("../config/oracle");

async function listHabitaciones(req, res, next) {
  let connection;
  try {
    connection = await getOracleConnection();
    const result = await connection.execute("SELECT * FROM HABITACION ORDER BY ID_HABITACION", [], { outFormat });
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
    const { numero_habitacion, tipo, precio_noche, capacidad, estado } = req.body;
    connection = await getOracleConnection();

    await connection.execute(
      `INSERT INTO HABITACION (ID_HABITACION, NUMERO_HABITACION, TIPO, PRECIO_NOCHE, CAPACIDAD, ESTADO)
       VALUES (SEQ_HABITACION.NEXTVAL, :numero_habitacion, :tipo, :precio_noche, :capacidad, :estado)`,
      { numero_habitacion, tipo, precio_noche, capacidad, estado },
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
    const { numero_habitacion, tipo, precio_noche, capacidad, estado } = req.body;
    connection = await getOracleConnection();

    const result = await connection.execute(
      `UPDATE HABITACION
       SET NUMERO_HABITACION = :numero_habitacion,
           TIPO = :tipo,
           PRECIO_NOCHE = :precio_noche,
           CAPACIDAD = :capacidad,
           ESTADO = :estado
       WHERE ID_HABITACION = :id`,
      { id: Number(id), numero_habitacion, tipo, precio_noche, capacidad, estado },
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
