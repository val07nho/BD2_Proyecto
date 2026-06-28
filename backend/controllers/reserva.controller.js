const { getOracleConnection, outFormat } = require("../config/oracle");

function normalizeEstado(estado) {
  const value = String(estado || "PENDIENTE").toUpperCase();
  if (["PENDIENTE", "CONFIRMADA", "FINALIZADA", "CANCELADA"].includes(value)) {
    return value;
  }
  return "PENDIENTE";
}

async function listReservas(req, res, next) {
  let connection;
  try {
    connection = await getOracleConnection();
    const result = await connection.execute(
          `SELECT R.ID_RESERVA, R.FECHA_RESERVA, R.FECHA_INGRESO, R.FECHA_SALIDA,
            INITCAP(R.ESTADO) AS ESTADO,
            R.TOTAL,
              R.ID_HUESPED, H.NOMBRES || ' ' || H.APELLIDOS AS HUESPED,
            D.ID_HABITACION,
            HB.NUMERO AS NUMERO_HABITACION,
            D.PRECIO_NOCHE,
            D.CANTIDAD_NOCHES,
            D.SUBTOTAL
       FROM RESERVA R
       INNER JOIN HUESPED H ON H.ID_HUESPED = R.ID_HUESPED
           LEFT JOIN DETALLE_RESERVA D ON D.ID_RESERVA = R.ID_RESERVA
           LEFT JOIN HABITACION HB ON HB.ID_HABITACION = D.ID_HABITACION
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
    const {
      fecha_ingreso,
      fecha_salida,
      estado,
      id_huesped,
      id_habitacion,
      precio_noche,
      cantidad_noches,
      total,
      metodo_pago // Campo opcional para simular el pago al reservar
    } = req.body;
    connection = await getOracleConnection();

    const nights = Number(cantidad_noches || 1);
    const subtotal = Number(precio_noche || 0) * nights;
    const totalValue = total || subtotal;

    // 1. Insertar en RESERVA (con autoCommit: false)
    await connection.execute(
      `INSERT INTO RESERVA (ID_RESERVA, FECHA_RESERVA, FECHA_INGRESO, FECHA_SALIDA, ESTADO, ID_HUESPED, TOTAL)
       VALUES (SEQ_RESERVA.NEXTVAL, SYSDATE, TO_DATE(:fecha_ingreso, 'YYYY-MM-DD'), TO_DATE(:fecha_salida, 'YYYY-MM-DD'), :estado, :id_huesped, :total)`,
      {
        fecha_ingreso,
        fecha_salida,
        estado: normalizeEstado(estado),
        id_huesped,
        total: totalValue
      },
      { autoCommit: false }
    );

    const reservaIdResult = await connection.execute("SELECT SEQ_RESERVA.CURRVAL AS ID_RESERVA FROM DUAL", [], { outFormat });
    const reservaId = reservaIdResult.rows[0].ID_RESERVA;

    // 2. Insertar en DETALLE_RESERVA
    if (id_habitacion) {
      await connection.execute(
        `INSERT INTO DETALLE_RESERVA (ID_DETALLE, ID_RESERVA, ID_HABITACION, PRECIO_NOCHE, CANTIDAD_NOCHES, SUBTOTAL)
         VALUES (SEQ_DETALLE_RESERVA.NEXTVAL, :id_reserva, :id_habitacion, :precio_noche, :cantidad_noches, :subtotal)`,
        {
          id_reserva: reservaId,
          id_habitacion,
          precio_noche: precio_noche || null,
          cantidad_noches: nights,
          subtotal: subtotal
        },
        { autoCommit: false }
      );
    }

    // 3. Si se proporciona método de pago, simular el pago (crear Factura y Pago)
    if (metodo_pago) {
      const subtotalFactura = Number((totalValue / 1.18).toFixed(2));
      const igvFactura = Number((totalValue - subtotalFactura).toFixed(2));

      // Insertar en FACTURA
      await connection.execute(
        `INSERT INTO FACTURA (ID_FACTURA, ID_RESERVA, FECHA_EMISION, SUBTOTAL, IGV, TOTAL, ESTADO_PAGO)
         VALUES (SEQ_FACTURA.NEXTVAL, :id_reserva, SYSDATE, :subtotal, :igv, :total, 'PAGADO')`,
        {
          id_reserva: reservaId,
          subtotal: subtotalFactura,
          igv: igvFactura,
          total: totalValue
        },
        { autoCommit: false }
      );

      const facturaIdResult = await connection.execute("SELECT SEQ_FACTURA.CURRVAL AS ID_FACTURA FROM DUAL", [], { outFormat });
      const facturaId = facturaIdResult.rows[0].ID_FACTURA;

      // Insertar en PAGO
      await connection.execute(
        `INSERT INTO PAGO (ID_PAGO, ID_FACTURA, FECHA_PAGO, METODO_PAGO, MONTO)
         VALUES (SEQ_PAGO.NEXTVAL, :id_factura, SYSDATE, :metodo_pago, :monto)`,
        {
          id_factura: facturaId,
          metodo_pago,
          monto: totalValue
        },
        { autoCommit: false }
      );
    }

    await connection.commit();

    res.status(201).json({ message: "Reserva creada exitosamente y pago registrado", id_reserva: reservaId });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (err) {
        // ignore
      }
    }
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

async function updateReserva(req, res, next) {
  let connection;
  try {
    const { id } = req.params;
    const {
      fecha_ingreso,
      fecha_salida,
      estado,
      id_huesped,
      id_habitacion,
      precio_noche,
      cantidad_noches,
      total
    } = req.body;
    connection = await getOracleConnection();

    const nights = Number(cantidad_noches || 1);
    const subtotal = Number(precio_noche || 0) * nights;
    const normalizedEstadoValue = normalizeEstado(estado);

    const result = await connection.execute(
      `UPDATE RESERVA
       SET FECHA_INGRESO = TO_DATE(:fecha_ingreso, 'YYYY-MM-DD'),
           FECHA_SALIDA = TO_DATE(:fecha_salida, 'YYYY-MM-DD'),
           ESTADO = :estado,
           ID_HUESPED = :id_huesped,
           TOTAL = :total
       WHERE ID_RESERVA = :id`,
      {
        id: Number(id),
        fecha_ingreso,
        fecha_salida,
        estado: normalizedEstadoValue,
        id_huesped,
        total: total || subtotal || null
      },
      { autoCommit: false }
    );

    if (!result.rowsAffected) {
      await connection.rollback();
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    if (id_habitacion) {
      const detailResult = await connection.execute(
        `UPDATE DETALLE_RESERVA
         SET ID_HABITACION = :id_habitacion,
             PRECIO_NOCHE = :precio_noche,
             CANTIDAD_NOCHES = :cantidad_noches,
             SUBTOTAL = :subtotal
         WHERE ID_RESERVA = :id_reserva`,
        {
          id_reserva: Number(id),
          id_habitacion,
          precio_noche: precio_noche || null,
          cantidad_noches: nights,
          subtotal: subtotal || null
        },
        { autoCommit: false }
      );

      if (!detailResult.rowsAffected) {
        await connection.execute(
          `INSERT INTO DETALLE_RESERVA (ID_DETALLE, ID_RESERVA, ID_HABITACION, PRECIO_NOCHE, CANTIDAD_NOCHES, SUBTOTAL)
           VALUES (SEQ_DETALLE_RESERVA.NEXTVAL, :id_reserva, :id_habitacion, :precio_noche, :cantidad_noches, :subtotal)`,
          {
            id_reserva: Number(id),
            id_habitacion,
            precio_noche: precio_noche || null,
            cantidad_noches: nights,
            subtotal: subtotal || null
          },
          { autoCommit: false }
        );
      }
    }

    // Si se cancela la reserva, la factura pasa a ANULADO
    if (normalizedEstadoValue === "CANCELADA") {
      await connection.execute(
        `UPDATE FACTURA
         SET ESTADO_PAGO = 'ANULADO'
         WHERE ID_RESERVA = :id_reserva`,
        { id_reserva: Number(id) },
        { autoCommit: false }
      );
    }

    await connection.commit();
    res.json({ message: "Reserva actualizada" });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (err) {
        // ignore
      }
    }
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

    await connection.execute("DELETE FROM PAGO WHERE ID_FACTURA IN (SELECT ID_FACTURA FROM FACTURA WHERE ID_RESERVA = :id)", { id: Number(id) }, { autoCommit: false });
    await connection.execute("DELETE FROM FACTURA WHERE ID_RESERVA = :id", { id: Number(id) }, { autoCommit: false });
    await connection.execute("DELETE FROM CONSUMO_SERVICIO WHERE ID_RESERVA = :id", { id: Number(id) }, { autoCommit: false });
    await connection.execute("DELETE FROM RESERVA_EVENTO WHERE ID_RESERVA = :id", { id: Number(id) }, { autoCommit: false });
    await connection.execute("DELETE FROM DETALLE_RESERVA WHERE ID_RESERVA = :id", { id: Number(id) }, { autoCommit: false });

    const result = await connection.execute(
      "DELETE FROM RESERVA WHERE ID_RESERVA = :id",
      { id: Number(id) },
      { autoCommit: false }
    );

    if (!result.rowsAffected) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    await connection.commit();
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
