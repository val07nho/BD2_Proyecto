const { getOracleConnection, outFormat } = require("../config/oracle");

function normalizeEstadoPago(estadoPago) {
  const value = String(estadoPago || "PENDIENTE").toUpperCase();
  if (["PENDIENTE", "PAGADO", "ANULADO"].includes(value)) {
    return value;
  }
  return "PENDIENTE";
}

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
    const {
      fecha_emision,
      subtotal,
      igv,
      total,
      monto_total,
      estado_pago,
      id_reserva
    } = req.body;

    const totalValue = Number(total || monto_total || 0);
    const subtotalValue = Number(subtotal || (totalValue ? (totalValue / 1.18).toFixed(2) : 0));
    const igvValue = Number(igv || (totalValue - subtotalValue).toFixed(2));

    connection = await getOracleConnection();

    await connection.execute(
      `INSERT INTO FACTURA (ID_FACTURA, ID_RESERVA, FECHA_EMISION, SUBTOTAL, IGV, TOTAL, ESTADO_PAGO)
       VALUES (SEQ_FACTURA.NEXTVAL, :id_reserva, TO_DATE(:fecha_emision, 'YYYY-MM-DD'), :subtotal, :igv, :total, :estado_pago)`,
      {
        id_reserva,
        fecha_emision,
        subtotal: subtotalValue,
        igv: igvValue,
        total: totalValue,
        estado_pago: normalizeEstadoPago(estado_pago)
      },
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
    const {
      fecha_emision,
      subtotal,
      igv,
      total,
      monto_total,
      estado_pago,
      id_reserva
    } = req.body;

    const totalValue = Number(total || monto_total || 0);
    const subtotalValue = Number(subtotal || (totalValue ? (totalValue / 1.18).toFixed(2) : 0));
    const igvValue = Number(igv || (totalValue - subtotalValue).toFixed(2));

    connection = await getOracleConnection();

    const result = await connection.execute(
      `UPDATE FACTURA
       SET FECHA_EMISION = TO_DATE(:fecha_emision, 'YYYY-MM-DD'),
           SUBTOTAL = :subtotal,
           IGV = :igv,
           TOTAL = :total,
           ESTADO_PAGO = :estado_pago,
           ID_RESERVA = :id_reserva
       WHERE ID_FACTURA = :id`,
      {
        id: Number(id),
        fecha_emision,
        subtotal: subtotalValue,
        igv: igvValue,
        total: totalValue,
        estado_pago: normalizeEstadoPago(estado_pago),
        id_reserva
      },
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
