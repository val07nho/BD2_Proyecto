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

async function getFacturaDetalle(req, res, next) {
  let connection;
  try {
    const { id } = req.params;
    connection = await getOracleConnection();

    // 1. Obtener la factura
    const facturaRes = await connection.execute(
      "SELECT * FROM FACTURA WHERE ID_FACTURA = :id",
      { id: Number(id) },
      { outFormat }
    );

    if (facturaRes.rows.length === 0) {
      return res.status(404).json({ message: "Factura no encontrada." });
    }

    const factura = facturaRes.rows[0];

    // 2. Obtener la reserva para validar pertenencia y obtener datos
    const reservaRes = await connection.execute(
      `SELECT R.ID_RESERVA, R.ID_HUESPED, R.FECHA_RESERVA, R.FECHA_INGRESO, R.FECHA_SALIDA, R.ESTADO, R.TOTAL,
              D.PRECIO_NOCHE, D.CANTIDAD_NOCHES, D.SUBTOTAL AS DETALLE_SUBTOTAL,
              H.NUMERO AS NUMERO_HABITACION, H.TIPO AS TIPO_HABITACION
       FROM RESERVA R
       LEFT JOIN DETALLE_RESERVA D ON D.ID_RESERVA = R.ID_RESERVA
       LEFT JOIN HABITACION H ON H.ID_HABITACION = D.ID_HABITACION
       WHERE R.ID_RESERVA = :id_reserva`,
      { id_reserva: factura.ID_RESERVA },
      { outFormat }
    );

    if (reservaRes.rows.length === 0) {
      return res.status(404).json({ message: "Reserva asociada a la factura no encontrada." });
    }

    const reserva = reservaRes.rows[0];

    // 3. Validar permisos del cliente
    if (req.user.role === "CLIENTE") {
      const huespedResult = await connection.execute(
        "SELECT ID_HUESPED FROM HUESPED WHERE ID_USUARIO = :id_usuario",
        { id_usuario: req.user.id },
        { outFormat }
      );
      if (huespedResult.rows.length === 0) {
        return res.status(403).json({ message: "El usuario no tiene un huesped asociado." });
      }
      const idHuespedActual = huespedResult.rows[0].ID_HUESPED;
      if (Number(reserva.ID_HUESPED) !== Number(idHuespedActual)) {
        return res.status(403).json({ message: "No tienes permiso para ver esta factura." });
      }
    }

    // 4. Obtener servicios consumidos
    const serviciosRes = await connection.execute(
      `SELECT C.ID_CONSUMO, C.CANTIDAD, C.SUBTOTAL, C.FECHA,
              S.NOMBRE AS NOMBRE_SERVICIO, S.PRECIO AS PRECIO_SERVICIO
       FROM CONSUMO_SERVICIO C
       INNER JOIN SERVICIO S ON S.ID_SERVICIO = C.ID_SERVICIO
       WHERE C.ID_RESERVA = :id_reserva
       ORDER BY C.FECHA DESC`,
      { id_reserva: factura.ID_RESERVA },
      { outFormat }
    );

    // 5. Obtener eventos reservados
    const eventosRes = await connection.execute(
      `SELECT RE.ID_RESERVA_EVENTO, RE.CANTIDAD, RE.SUBTOTAL,
              E.NOMBRE AS NOMBRE_EVENTO, E.COSTO AS COSTO_EVENTO, E.FECHA_EVENTO
       FROM RESERVA_EVENTO RE
       INNER JOIN EVENTO E ON E.ID_EVENTO = RE.ID_EVENTO
       WHERE RE.ID_RESERVA = :id_reserva
       ORDER BY E.FECHA_EVENTO ASC`,
      { id_reserva: factura.ID_RESERVA },
      { outFormat }
    );

    res.json({
      factura,
      reserva,
      servicios: serviciosRes.rows,
      eventos: eventosRes.rows
    });
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
  deleteFactura,
  getFacturaDetalle
};
