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
    const {
      id_usuario,
      nombres,
      apellidos,
      tipo_documento,
      numero_documento,
      dni_pasaporte,
      telefono,
      correo,
      nacionalidad
    } = req.body;
    connection = await getOracleConnection();

    await connection.execute(
      `INSERT INTO HUESPED (ID_HUESPED, ID_USUARIO, NOMBRES, APELLIDOS, TIPO_DOCUMENTO, NUMERO_DOCUMENTO, TELEFONO, CORREO, NACIONALIDAD)
       VALUES (SEQ_HUESPED.NEXTVAL, :id_usuario, :nombres, :apellidos, :tipo_documento, :numero_documento, :telefono, :correo, :nacionalidad)`,
      {
        id_usuario: id_usuario || null,
        nombres,
        apellidos,
        tipo_documento: tipo_documento || (dni_pasaporte ? "DNI" : null),
        numero_documento: numero_documento || dni_pasaporte || null,
        telefono: telefono || null,
        correo: correo || null,
        nacionalidad: nacionalidad || null
      },
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
    const {
      id_usuario,
      nombres,
      apellidos,
      tipo_documento,
      numero_documento,
      dni_pasaporte,
      telefono,
      correo,
      nacionalidad
    } = req.body;
    connection = await getOracleConnection();

    if (!["ADMIN", "CLIENTE"].includes(req.user?.role)) {
      return res.status(403).json({ message: "No tienes permisos para editar huespedes" });
    }

    if (req.user?.role === "CLIENTE") {
      const ownerResult = await connection.execute(
        "SELECT ID_USUARIO FROM HUESPED WHERE ID_HUESPED = :id",
        { id: Number(id) },
        { outFormat }
      );

      if (ownerResult.rows.length === 0) {
        return res.status(404).json({ message: "Huesped no encontrado" });
      }

      if (Number(ownerResult.rows[0].ID_USUARIO) !== Number(req.user.id)) {
        return res.status(403).json({ message: "No puedes editar datos de otro huesped" });
      }
    }

    const result = await connection.execute(
      `UPDATE HUESPED
       SET ID_USUARIO = :id_usuario,
           NOMBRES = :nombres,
           APELLIDOS = :apellidos,
           TIPO_DOCUMENTO = :tipo_documento,
           NUMERO_DOCUMENTO = :numero_documento,
           NACIONALIDAD = :nacionalidad,
           TELEFONO = :telefono,
           CORREO = :correo
       WHERE ID_HUESPED = :id`,
      {
        id: Number(id),
        id_usuario: req.user?.role === "CLIENTE" ? req.user.id : id_usuario || null,
        nombres,
        apellidos,
        tipo_documento: tipo_documento || (dni_pasaporte ? "DNI" : null),
        numero_documento: numero_documento || dni_pasaporte || null,
        nacionalidad: nacionalidad || null,
        telefono: telefono || null,
        correo: correo || null
      },
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
