const { getOracleConnection, outFormat } = require("../config/oracle");

async function listPagos(req, res, next) {
  let connection;
  try {
    connection = await getOracleConnection();
    const result = await connection.execute(
      `SELECT P.ID_PAGO, P.ID_FACTURA, P.FECHA_PAGO, P.METODO_PAGO, P.MONTO,
              F.TOTAL AS FACTURA_TOTAL
       FROM PAGO P
       LEFT JOIN FACTURA F ON F.ID_FACTURA = P.ID_FACTURA
       ORDER BY P.ID_PAGO`,
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

async function createPago(req, res, next) {
  let connection;
  try {
    const { id_factura, fecha_pago, metodo_pago, monto } = req.body;
    connection = await getOracleConnection();

    await connection.execute(
      `INSERT INTO PAGO (ID_PAGO, ID_FACTURA, FECHA_PAGO, METODO_PAGO, MONTO)
       VALUES (SEQ_PAGO.NEXTVAL, :id_factura, TO_DATE(:fecha_pago, 'YYYY-MM-DD'), :metodo_pago, :monto)`,
      { id_factura, fecha_pago, metodo_pago, monto },
      { autoCommit: true }
    );

    res.status(201).json({ message: "Pago creado" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function updatePago(req, res, next) {
  let connection;
  try {
    const { id } = req.params;
    const { id_factura, fecha_pago, metodo_pago, monto } = req.body;
    connection = await getOracleConnection();

    const result = await connection.execute(
      `UPDATE PAGO
       SET ID_FACTURA = :id_factura,
           FECHA_PAGO = TO_DATE(:fecha_pago, 'YYYY-MM-DD'),
           METODO_PAGO = :metodo_pago,
           MONTO = :monto
       WHERE ID_PAGO = :id`,
      { id: Number(id), id_factura, fecha_pago, metodo_pago, monto },
      { autoCommit: true }
    );

    if (!result.rowsAffected) {
      return res.status(404).json({ message: "Pago no encontrado" });
    }

    res.json({ message: "Pago actualizado" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function deletePago(req, res, next) {
  let connection;
  try {
    const { id } = req.params;
    connection = await getOracleConnection();

    const result = await connection.execute(
      "DELETE FROM PAGO WHERE ID_PAGO = :id",
      { id: Number(id) },
      { autoCommit: true }
    );

    if (!result.rowsAffected) {
      return res.status(404).json({ message: "Pago no encontrado" });
    }

    res.json({ message: "Pago eliminado" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  listPagos,
  createPago,
  updatePago,
  deletePago
};
