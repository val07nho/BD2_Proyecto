const { getOracleConnection, outFormat } = require("../config/oracle");

async function listEventos(req, res, next) {
  let connection;
  try {
    connection = await getOracleConnection();
    const result = await connection.execute("SELECT * FROM EVENTO ORDER BY ID_EVENTO", [], { outFormat });
    res.json(result.rows);
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function createEvento(req, res, next) {
  let connection;
  try {
    const { nombre, descripcion, fecha_evento, costo } = req.body;
    connection = await getOracleConnection();

    await connection.execute(
      `INSERT INTO EVENTO (ID_EVENTO, CODIGO_EVENTO, NOMBRE, DESCRIPCION, FECHA_EVENTO, COSTO)
       VALUES (SEQ_EVENTO.NEXTVAL, 'EV-' || LPAD(SEQ_EVENTO.CURRVAL, 4, '0'), :nombre, :descripcion, TO_DATE(:fecha_evento, 'YYYY-MM-DD'), :costo)`,
      { nombre, descripcion, fecha_evento, costo },
      { autoCommit: true }
    );

    res.status(201).json({ message: "Evento creado" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function updateEvento(req, res, next) {
  let connection;
  try {
    const { id } = req.params;
    const { nombre, descripcion, fecha_evento, costo } = req.body;
    connection = await getOracleConnection();

    const result = await connection.execute(
      `UPDATE EVENTO
       SET NOMBRE = :nombre,
           DESCRIPCION = :descripcion,
           FECHA_EVENTO = TO_DATE(:fecha_evento, 'YYYY-MM-DD'),
           COSTO = :costo
       WHERE ID_EVENTO = :id`,
      { id: Number(id), nombre, descripcion, fecha_evento, costo },
      { autoCommit: true }
    );

    if (!result.rowsAffected) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    res.json({ message: "Evento actualizado" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function deleteEvento(req, res, next) {
  let connection;
  try {
    const { id } = req.params;
    connection = await getOracleConnection();

    const result = await connection.execute(
      "DELETE FROM EVENTO WHERE ID_EVENTO = :id",
      { id: Number(id) },
      { autoCommit: true }
    );

    if (!result.rowsAffected) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    res.json({ message: "Evento eliminado" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  listEventos,
  createEvento,
  updateEvento,
  deleteEvento
};
