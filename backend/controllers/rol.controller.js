const { getOracleConnection, outFormat } = require("../config/oracle");

async function listRoles(req, res, next) {
  let connection;
  try {
    connection = await getOracleConnection();
    const result = await connection.execute("SELECT * FROM ROL ORDER BY ID_ROL", [], { outFormat });
    res.json(result.rows);
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function createRol(req, res, next) {
  let connection;
  try {
    const { nombre, descripcion } = req.body;
    connection = await getOracleConnection();

    await connection.execute(
      `INSERT INTO ROL (ID_ROL, NOMBRE, DESCRIPCION)
       VALUES (SEQ_ROL.NEXTVAL, :nombre, :descripcion)`,
      { nombre: String(nombre || "").toUpperCase(), descripcion: descripcion || null },
      { autoCommit: true }
    );

    res.status(201).json({ message: "Rol creado" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function updateRol(req, res, next) {
  let connection;
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    connection = await getOracleConnection();

    const result = await connection.execute(
      `UPDATE ROL
       SET NOMBRE = :nombre,
           DESCRIPCION = :descripcion
       WHERE ID_ROL = :id`,
      { id: Number(id), nombre: String(nombre || "").toUpperCase(), descripcion: descripcion || null },
      { autoCommit: true }
    );

    if (!result.rowsAffected) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }

    res.json({ message: "Rol actualizado" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function deleteRol(req, res, next) {
  let connection;
  try {
    const { id } = req.params;
    connection = await getOracleConnection();

    const result = await connection.execute(
      "DELETE FROM ROL WHERE ID_ROL = :id",
      { id: Number(id) },
      { autoCommit: true }
    );

    if (!result.rowsAffected) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }

    res.json({ message: "Rol eliminado" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  listRoles,
  createRol,
  updateRol,
  deleteRol
};
