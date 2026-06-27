const { getOracleConnection, outFormat } = require("../config/oracle");

async function listServicios(req, res, next) {
  let connection;
  try {
    connection = await getOracleConnection();
    const result = await connection.execute("SELECT * FROM SERVICIO ORDER BY ID_SERVICIO", [], { outFormat });
    res.json(result.rows);
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function createServicio(req, res, next) {
  let connection;
  try {
    const { nombre, descripcion, precio, estado } = req.body;
    connection = await getOracleConnection();

    await connection.execute(
      `INSERT INTO SERVICIO (ID_SERVICIO, NOMBRE, DESCRIPCION, PRECIO, ESTADO)
       VALUES (SEQ_SERVICIO.NEXTVAL, :nombre, :descripcion, :precio, :estado)`,
      { nombre, descripcion: descripcion || null, precio, estado: estado || "A" },
      { autoCommit: true }
    );

    res.status(201).json({ message: "Servicio creado" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function updateServicio(req, res, next) {
  let connection;
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, estado } = req.body;
    connection = await getOracleConnection();

    const result = await connection.execute(
      `UPDATE SERVICIO
       SET NOMBRE = :nombre,
           DESCRIPCION = :descripcion,
           PRECIO = :precio,
           ESTADO = :estado
       WHERE ID_SERVICIO = :id`,
      { id: Number(id), nombre, descripcion: descripcion || null, precio, estado: estado || "A" },
      { autoCommit: true }
    );

    if (!result.rowsAffected) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    res.json({ message: "Servicio actualizado" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function deleteServicio(req, res, next) {
  let connection;
  try {
    const { id } = req.params;
    connection = await getOracleConnection();

    const result = await connection.execute(
      "DELETE FROM SERVICIO WHERE ID_SERVICIO = :id",
      { id: Number(id) },
      { autoCommit: true }
    );

    if (!result.rowsAffected) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    res.json({ message: "Servicio eliminado" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  listServicios,
  createServicio,
  updateServicio,
  deleteServicio
};
