const { getOracleConnection, outFormat } = require("../config/oracle");

async function listFacturas(req, res, next) {
  let connection;
  try {
    connection = await getOracleConnection();
    const result = await connection.execute("SELECT * FROM FACTURA ORDER BY ID_FACTURA", [], { outFormat });
    res.json(result.rows);
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function createFactura(req, res, next) {
  let connection;
  try {
    const { fecha_emision, monto_total, metodo_pago, id_reserva } = req.body;
    connection = await getOracleConnection();

    await connection.execute(
      `INSERT INTO FACTURA (ID_FACTURA, NUMERO_FACTURA, FECHA_EMISION, MONTO_TOTAL, METODO_PAGO, ID_RESERVA)
       VALUES (SEQ_FACTURA.NEXTVAL, 'FAC-' || LPAD(SEQ_FACTURA.CURRVAL, 6, '0'), TO_DATE(:fecha_emision, 'YYYY-MM-DD'), :monto_total, :metodo_pago, :id_reserva)`,
      { fecha_emision, monto_total, metodo_pago, id_reserva },
      { autoCommit: true }
    );

    res.status(201).json({ message: "Factura creada" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function updateFactura(req, res, next) {
  let connection;
  try {
    const { id } = req.params;
    const { fecha_emision, monto_total, metodo_pago, id_reserva } = req.body;
    connection = await getOracleConnection();

    const result = await connection.execute(
      `UPDATE FACTURA
       SET FECHA_EMISION = TO_DATE(:fecha_emision, 'YYYY-MM-DD'),
           MONTO_TOTAL = :monto_total,
           METODO_PAGO = :metodo_pago,
           ID_RESERVA = :id_reserva
       WHERE ID_FACTURA = :id`,
      { id: Number(id), fecha_emision, monto_total, metodo_pago, id_reserva },
      { autoCommit: true }
    );

    if (!result.rowsAffected) {
      return res.status(404).json({ message: "Factura no encontrada" });
    }

    res.json({ message: "Factura actualizada" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function deleteFactura(req, res, next) {
  let connection;
  try {
    const { id } = req.params;
    connection = await getOracleConnection();

    const result = await connection.execute(
      "DELETE FROM FACTURA WHERE ID_FACTURA = :id",
      { id: Number(id) },
      { autoCommit: true }
    );

    if (!result.rowsAffected) {
      return res.status(404).json({ message: "Factura no encontrada" });
    }

    res.json({ message: "Factura eliminada" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  listFacturas,
  createFactura,
  updateFactura,
  deleteFactura
};
