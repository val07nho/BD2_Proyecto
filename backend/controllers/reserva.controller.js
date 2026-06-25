const { getOracleConnection, outFormat } = require("../config/oracle");

async function listReservas(req, res, next) {
  let connection;
  try {
    connection = await getOracleConnection();
    const result = await connection.execute(
      `SELECT R.ID_RESERVA, R.FECHA_RESERVA, R.FECHA_INGRESO, R.FECHA_SALIDA, R.ESTADO,
              R.ID_HUESPED, H.NOMBRES || ' ' || H.APELLIDOS AS HUESPED,
              R.ID_HABITACION, HB.NUMERO_HABITACION
       FROM RESERVA R
       INNER JOIN HUESPED H ON H.ID_HUESPED = R.ID_HUESPED
       INNER JOIN HABITACION HB ON HB.ID_HABITACION = R.ID_HABITACION
       ORDER BY R.ID_RESERVA`,
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

async function createReserva(req, res, next) {
  let connection;
  try {
    const { fecha_ingreso, fecha_salida, estado, id_huesped, id_habitacion } = req.body;
    connection = await getOracleConnection();

    await connection.execute(
      `INSERT INTO RESERVA (ID_RESERVA, FECHA_RESERVA, FECHA_INGRESO, FECHA_SALIDA, ESTADO, ID_HUESPED, ID_HABITACION)
       VALUES (SEQ_RESERVA.NEXTVAL, SYSDATE, TO_DATE(:fecha_ingreso, 'YYYY-MM-DD'), TO_DATE(:fecha_salida, 'YYYY-MM-DD'), :estado, :id_huesped, :id_habitacion)`,
      { fecha_ingreso, fecha_salida, estado, id_huesped, id_habitacion },
      { autoCommit: true }
    );

    res.status(201).json({ message: "Reserva creada" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function updateReserva(req, res, next) {
  let connection;
  try {
    const { id } = req.params;
    const { fecha_ingreso, fecha_salida, estado, id_huesped, id_habitacion } = req.body;
    connection = await getOracleConnection();

    const result = await connection.execute(
      `UPDATE RESERVA
       SET FECHA_INGRESO = TO_DATE(:fecha_ingreso, 'YYYY-MM-DD'),
           FECHA_SALIDA = TO_DATE(:fecha_salida, 'YYYY-MM-DD'),
           ESTADO = :estado,
           ID_HUESPED = :id_huesped,
           ID_HABITACION = :id_habitacion
       WHERE ID_RESERVA = :id`,
      { id: Number(id), fecha_ingreso, fecha_salida, estado, id_huesped, id_habitacion },
      { autoCommit: true }
    );

    if (!result.rowsAffected) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    res.json({ message: "Reserva actualizada" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function deleteReserva(req, res, next) {
  let connection;
  try {
    const { id } = req.params;
    connection = await getOracleConnection();

    const result = await connection.execute(
      "DELETE FROM RESERVA WHERE ID_RESERVA = :id",
      { id: Number(id) },
      { autoCommit: true }
    );

    if (!result.rowsAffected) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    res.json({ message: "Reserva eliminada" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  listReservas,
  createReserva,
  updateReserva,
  deleteReserva
};
