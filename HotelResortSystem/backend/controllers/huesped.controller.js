const { getOracleConnection, outFormat } = require("../config/oracle");

async function listHuespedes(req, res, next) {
  let connection;
  try {
    connection = await getOracleConnection();
    const result = await connection.execute("SELECT * FROM HUESPED ORDER BY ID_HUESPED", [], { outFormat });
    res.json(result.rows);
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function createHuesped(req, res, next) {
  let connection;
  try {
    const { dni_pasaporte, nombres, apellidos, nacionalidad, telefono, correo } = req.body;
    connection = await getOracleConnection();

    await connection.execute(
      `INSERT INTO HUESPED (ID_HUESPED, DNI_PASAPORTE, NOMBRES, APELLIDOS, NACIONALIDAD, TELEFONO, CORREO)
       VALUES (SEQ_HUESPED.NEXTVAL, :dni_pasaporte, :nombres, :apellidos, :nacionalidad, :telefono, :correo)`,
      { dni_pasaporte, nombres, apellidos, nacionalidad, telefono, correo },
      { autoCommit: true }
    );

    res.status(201).json({ message: "Huesped creado" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function updateHuesped(req, res, next) {
  let connection;
  try {
    const { id } = req.params;
    const { dni_pasaporte, nombres, apellidos, nacionalidad, telefono, correo } = req.body;
    connection = await getOracleConnection();

    const result = await connection.execute(
      `UPDATE HUESPED
       SET DNI_PASAPORTE = :dni_pasaporte,
           NOMBRES = :nombres,
           APELLIDOS = :apellidos,
           NACIONALIDAD = :nacionalidad,
           TELEFONO = :telefono,
           CORREO = :correo
       WHERE ID_HUESPED = :id`,
      { id: Number(id), dni_pasaporte, nombres, apellidos, nacionalidad, telefono, correo },
      { autoCommit: true }
    );

    if (!result.rowsAffected) {
      return res.status(404).json({ message: "Huesped no encontrado" });
    }

    res.json({ message: "Huesped actualizado" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function deleteHuesped(req, res, next) {
  let connection;
  try {
    const { id } = req.params;
    connection = await getOracleConnection();

    const result = await connection.execute(
      "DELETE FROM HUESPED WHERE ID_HUESPED = :id",
      { id: Number(id) },
      { autoCommit: true }
    );

    if (!result.rowsAffected) {
      return res.status(404).json({ message: "Huesped no encontrado" });
    }

    res.json({ message: "Huesped eliminado" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  listHuespedes,
  createHuesped,
  updateHuesped,
  deleteHuesped
};
